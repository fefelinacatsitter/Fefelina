#!/usr/bin/env node
/**
 * Busca as avaliações do Google Maps via SerpApi e grava um snapshot
 * simplificado em data/reviews.json.
 *
 * Variáveis de ambiente necessárias:
 *   SERPAPI_API_KEY   - chave da conta SerpApi (obrigatória)
 *   GOOGLE_DATA_ID     - data_id do perfil do Google Maps do negócio (obrigatória)
 *
 * Uso local (PowerShell):
 *   $env:SERPAPI_API_KEY="sua_chave"; $env:GOOGLE_DATA_ID="0x...:0x..."; node scripts/fetch-google-reviews.js
 *
 * Este script NÃO sobrescreve data/reviews.json em caso de erro,
 * preservando o último snapshot válido.
 */

const fs = require('fs');
const path = require('path');

const SERPAPI_ENDPOINT = 'https://serpapi.com/search.json';
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'reviews.json');
const MAX_REVIEWS = 8;

function getRequiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
    }
    return value;
}

async function fetchReviewsPage(apiKey, dataId) {
    const params = new URLSearchParams({
        engine: 'google_maps_reviews',
        data_id: dataId,
        hl: 'pt-BR',
        sort_by: 'newestFirst',
        api_key: apiKey,
    });

    const url = `${SERPAPI_ENDPOINT}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`SerpApi retornou status ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

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

function mapPlaceInfo(placeInfo) {
    if (!placeInfo) {
        return null;
    }
    return {
        name: placeInfo.title || null,
        address: placeInfo.address || null,
        rating: typeof placeInfo.rating === 'number' ? placeInfo.rating : null,
        totalReviews: typeof placeInfo.reviews === 'number' ? placeInfo.reviews : null,
        type: placeInfo.type || null,
        mapsUrl: placeInfo.link || null,
    };
}

async function main() {
    const apiKey = getRequiredEnv('SERPAPI_API_KEY');
    const dataId = getRequiredEnv('GOOGLE_DATA_ID');

    const json = await fetchReviewsPage(apiKey, dataId);

    const reviews = Array.isArray(json.reviews)
        ? json.reviews.slice(0, MAX_REVIEWS).map(mapReview)
        : [];

    if (reviews.length === 0) {
        throw new Error('Nenhuma avaliação retornada pela SerpApi; abortando para não sobrescrever dados existentes.');
    }

    const snapshot = {
        updatedAt: new Date().toISOString(),
        place: mapPlaceInfo(json.place_info),
        reviews,
    };

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

    console.log(`OK: ${reviews.length} avaliações gravadas em ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((error) => {
    console.error(`Falha ao sincronizar avaliações: ${error.message}`);
    process.exitCode = 1;
});
