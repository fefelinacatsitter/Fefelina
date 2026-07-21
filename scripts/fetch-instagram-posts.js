#!/usr/bin/env node
/**
 * Busca os posts mais recentes do Instagram via API oficial da Meta
 * ("Instagram API with Instagram Login") e grava um snapshot simplificado
 * em data/instagram.json.
 *
 * Pré-requisitos (feitos uma única vez, fora deste script):
 *   1. Conta @fefelinacatsitter convertida para conta Profissional
 *      (Business ou Criador de Conteúdo) — grátis, feito no app do Instagram.
 *   2. Um app criado em https://developers.facebook.com/apps (tipo "Business").
 *   3. Produto "Instagram" > "API setup with Instagram business login"
 *      adicionado ao app, com o token de acesso gerado pelo dashboard.
 *
 * Variáveis de ambiente:
 *   INSTAGRAM_ACCESS_TOKEN - token de acesso do usuário Instagram (obrigatória)
 *
 * O token de longa duração dura ~60 dias e precisa ser renovado antes de
 * expirar (veja scripts/refresh-instagram-token.js ou gere um novo token
 * manualmente no dashboard do app e atualize o secret INSTAGRAM_ACCESS_TOKEN).
 *
 * Uso local (PowerShell):
 *   $env:INSTAGRAM_ACCESS_TOKEN="seu_token"; node scripts/fetch-instagram-posts.js
 *
 * Este script NÃO sobrescreve data/instagram.json em caso de erro,
 * preservando o último snapshot válido.
 */

const fs = require('fs');
const path = require('path');

const GRAPH_API_BASE = 'https://graph.instagram.com';
const GRAPH_API_VERSION = 'v21.0';
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'instagram.json');
const MAX_POSTS = 6;

function getRequiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
    }
    return value;
}

async function requestJson(url) {
    const response = await fetch(url);
    const json = await response.json().catch(() => null);

    if (!response.ok || (json && json.error)) {
        const message = json && json.error ? json.error.message : `${response.status} ${response.statusText}`;
        throw new Error(`Instagram Graph API retornou erro: ${message}`);
    }

    return json;
}

async function fetchProfile(accessToken) {
    const params = new URLSearchParams({
        fields: 'user_id,username',
        access_token: accessToken,
    });
    const json = await requestJson(`${GRAPH_API_BASE}/${GRAPH_API_VERSION}/me?${params.toString()}`);
    return { userId: json.user_id, username: json.username };
}

async function fetchMedia(accessToken, userId) {
    const params = new URLSearchParams({
        fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
        limit: String(MAX_POSTS),
        access_token: accessToken,
    });
    const json = await requestJson(`${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${userId}/media?${params.toString()}`);
    return Array.isArray(json.data) ? json.data : [];
}

function mapPost(post) {
    // Vídeos não expõem uma imagem em media_url (é o arquivo de vídeo), então
    // usamos thumbnail_url nesse caso. Álbuns (CAROUSEL_ALBUM) retornam a
    // imagem da primeira mídia em media_url.
    const image = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;

    return {
        id: post.id,
        caption: post.caption || '',
        mediaType: post.media_type || null,
        image: image || post.media_url || null,
        permalink: post.permalink || null,
        timestamp: post.timestamp || null,
    };
}

async function main() {
    const accessToken = getRequiredEnv('INSTAGRAM_ACCESS_TOKEN');

    const profile = await fetchProfile(accessToken);
    if (!profile.userId) {
        throw new Error('Não foi possível identificar o usuário Instagram a partir do token informado.');
    }

    const media = await fetchMedia(accessToken, profile.userId);
    const posts = media
        .filter((post) => post.media_type !== 'VIDEO' || post.thumbnail_url)
        .slice(0, MAX_POSTS)
        .map(mapPost);

    if (posts.length === 0) {
        throw new Error('Nenhum post retornado pela API do Instagram; abortando para não sobrescrever dados existentes.');
    }

    const snapshot = {
        updatedAt: new Date().toISOString(),
        profile: {
            username: profile.username || 'fefelinacatsitter',
            profileUrl: `https://www.instagram.com/${profile.username || 'fefelinacatsitter'}`,
        },
        posts,
    };

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

    console.log(`OK: ${posts.length} posts gravados em ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((error) => {
    console.error(`Falha ao sincronizar posts do Instagram: ${error.message}`);
    process.exitCode = 1;
});
