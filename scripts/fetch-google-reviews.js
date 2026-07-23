#!/usr/bin/env node
/**
 * Busca as avaliações do Google Maps via SerpApi e grava um snapshot
 * simplificado em data/reviews.json.
 *
 * Variáveis de ambiente:
 *   SERPAPI_API_KEY   - chave da conta SerpApi (obrigatória)
 *   GOOGLE_DATA_ID    - data_id do perfil do Google Maps do negócio
 *                       (opcional; usa DEFAULT_DATA_ID abaixo se não definida)
 *
 * Uso local (PowerShell):
 *   $env:SERPAPI_API_KEY="sua_chave"; node scripts/fetch-google-reviews.js
 *
 * Este script NÃO sobrescreve data/reviews.json em caso de erro,
 * preservando o último snapshot válido.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const tls = require('tls');
const { URL } = require('url');

const SERPAPI_ENDPOINT = 'https://serpapi.com/search.json';
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'reviews.json');
// A API sempre retorna 8 avaliações na primeira página; para trazer mais é
// preciso paginar usando next_page_token (serpapi_pagination.next_page_token).
const MAX_REVIEWS = 100;
const MAX_PAGES = 8;

// data_id do perfil "Fefelina Cat Sitter" no Google Maps.
// Não é um dado sensível (é apenas um identificador público de local),
// por isso pode ficar hardcoded aqui como valor padrão.
const DEFAULT_DATA_ID = '0xa4c378cb5df94505:0x6b1ef55d63a642e2';

function getRequiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
    }
    return value;
}

function getProxyUrl() {
    return (
        process.env.HTTPS_PROXY ||
        process.env.https_proxy ||
        process.env.HTTP_PROXY ||
        process.env.http_proxy ||
        null
    );
}

// Redes corporativas costumam exigir um proxy HTTP e o fetch nativo do
// Node não usa HTTPS_PROXY/HTTP_PROXY automaticamente. Quando essas
// variáveis existem, fazemos a requisição via túnel CONNECT manual usando
// apenas módulos nativos (sem dependências externas). Nos runners do
// GitHub Actions essas variáveis não existem, então o caminho normal
// (fetch nativo) é usado sem alterações.
function requestJsonViaProxy(targetUrl, proxyUrl) {
    return new Promise((resolve, reject) => {
        const target = new URL(targetUrl);
        const proxy = new URL(proxyUrl);

        const connectReq = http.request({
            host: proxy.hostname,
            port: Number(proxy.port) || 80,
            method: 'CONNECT',
            path: `${target.hostname}:443`,
            headers: { Host: `${target.hostname}:443` },
        });

        connectReq.on('connect', (proxyRes, socket) => {
            if (proxyRes.statusCode !== 200) {
                reject(new Error(`Proxy CONNECT falhou com status ${proxyRes.statusCode}`));
                socket.destroy();
                return;
            }

            const tlsSocket = tls.connect({ socket, servername: target.hostname }, () => {
                const req = https.request(
                    {
                        createConnection: () => tlsSocket,
                        hostname: target.hostname,
                        path: `${target.pathname}${target.search}`,
                        method: 'GET',
                        headers: { Host: target.hostname, Accept: 'application/json' },
                    },
                    (response) => {
                        let body = '';
                        response.setEncoding('utf8');
                        response.on('data', (chunk) => {
                            body += chunk;
                        });
                        response.on('end', () => {
                            if (response.statusCode < 200 || response.statusCode >= 300) {
                                reject(new Error(`SerpApi retornou status ${response.statusCode}`));
                                return;
                            }
                            try {
                                resolve(JSON.parse(body));
                            } catch (error) {
                                reject(new Error(`Falha ao interpretar resposta da SerpApi: ${error.message}`));
                            }
                        });
                    }
                );
                req.on('error', reject);
                req.end();
            });
            tlsSocket.on('error', reject);
        });
        connectReq.on('error', reject);
        connectReq.end();
    });
}

async function requestJson(targetUrl) {
    const proxyUrl = getProxyUrl();
    if (!proxyUrl) {
        const response = await fetch(targetUrl);
        if (!response.ok) {
            throw new Error(`SerpApi retornou status ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }
    return requestJsonViaProxy(targetUrl, proxyUrl);
}

async function fetchReviewsPage(apiKey, dataId, nextPageToken) {
    const params = new URLSearchParams({
        engine: 'google_maps_reviews',
        data_id: dataId,
        hl: 'pt-BR',
        api_key: apiKey,
    });

    if (nextPageToken) {
        // Páginas seguintes usam o token e podem pedir até 20 avaliações por vez.
        params.set('next_page_token', nextPageToken);
        params.set('num', '20');
    } else {
        // A primeira página sempre retorna 8 avaliações, independente de "num".
        params.set('sort_by', 'newestFirst');
    }

    const url = `${SERPAPI_ENDPOINT}?${params.toString()}`;
    const json = await requestJson(url);

    if (json.error) {
        throw new Error(`SerpApi retornou erro: ${json.error}`);
    }

    return json;
}

function mapReview(review) {
    return {
        id: review.review_id || null,
        author: review.user?.name || 'Cliente do Google',
        authorPhoto: review.user?.thumbnail || null,
        authorLink: review.user?.link || null,
        isLocalGuide: Boolean(review.user?.local_guide),
        rating: typeof review.rating === 'number' ? review.rating : null,
        relativeDate: review.date || null,
        text: review.snippet || review.extracted_snippet?.original || '',
        link: review.link || null,
    };
}

function mapPlaceInfo(placeInfo, mapsUrl) {
    if (!placeInfo) {
        return null;
    }
    return {
        name: placeInfo.title || null,
        address: placeInfo.address || null,
        rating: typeof placeInfo.rating === 'number' ? placeInfo.rating : null,
        totalReviews: typeof placeInfo.reviews === 'number' ? placeInfo.reviews : null,
        type: placeInfo.type || null,
        // place_info nunca traz um link; o link do perfil vem em
        // search_metadata.google_maps_reviews_url (apenas na primeira página).
        mapsUrl: mapsUrl || null,
    };
}

async function main() {
    const apiKey = getRequiredEnv('SERPAPI_API_KEY');
    const dataId = process.env.GOOGLE_DATA_ID || DEFAULT_DATA_ID;

    let allReviews = [];
    let placeInfo = null;
    let mapsUrl = null;
    let nextPageToken = null;
    let page = 0;

    do {
        const json = await fetchReviewsPage(apiKey, dataId, nextPageToken);

        if (page === 0) {
            placeInfo = json.place_info || null;
            mapsUrl = json.search_metadata?.google_maps_reviews_url || null;
        }

        if (Array.isArray(json.reviews)) {
            allReviews = allReviews.concat(json.reviews);
        }

        nextPageToken = json.serpapi_pagination?.next_page_token || null;
        page += 1;
    } while (nextPageToken && allReviews.length < MAX_REVIEWS && page < MAX_PAGES);

    const reviews = allReviews.slice(0, MAX_REVIEWS).map(mapReview);

    if (reviews.length === 0) {
        throw new Error('Nenhuma avaliação retornada pela SerpApi; abortando para não sobrescrever dados existentes.');
    }

    const snapshot = {
        updatedAt: new Date().toISOString(),
        place: mapPlaceInfo(placeInfo, mapsUrl),
        reviews,
    };

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

    console.log(`OK: ${reviews.length} avaliações gravadas em ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((error) => {
    console.error(`Falha ao sincronizar avaliações: ${error.message}`);
    if (error.cause) {
        console.error('Causa detalhada:', error.cause);
    }
    process.exitCode = 1;
});
