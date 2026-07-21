#!/usr/bin/env node
/**
 * Renova o token de acesso de longa duração do Instagram (válido por ~60 dias)
 * antes que ele expire, gerando um novo token com mais 60 dias de validade.
 *
 * Isso NÃO gera um token novo do zero (isso só é possível fazendo login de
 * novo pelo dashboard do app) — apenas estende a validade do token atual.
 * Precisa ser executado com o token ainda válido (antes de expirar).
 *
 * Variáveis de ambiente:
 *   INSTAGRAM_ACCESS_TOKEN - token de acesso atual (obrigatória)
 *
 * Uso local (PowerShell):
 *   $env:INSTAGRAM_ACCESS_TOKEN="seu_token"; node scripts/refresh-instagram-token.js
 *
 * O novo token é apenas exibido no console. Copie-o e atualize o secret
 * INSTAGRAM_ACCESS_TOKEN no GitHub (Settings > Secrets and variables > Actions).
 */

const GRAPH_API_BASE = 'https://graph.instagram.com';

function getRequiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
    }
    return value;
}

async function main() {
    const accessToken = getRequiredEnv('INSTAGRAM_ACCESS_TOKEN');

    const params = new URLSearchParams({
        grant_type: 'ig_refresh_token',
        access_token: accessToken,
    });

    const response = await fetch(`${GRAPH_API_BASE}/refresh_access_token?${params.toString()}`);
    const json = await response.json().catch(() => null);

    if (!response.ok || !json || !json.access_token) {
        const message = json && json.error ? json.error.message : `${response.status} ${response.statusText}`;
        throw new Error(`Falha ao renovar o token: ${message}`);
    }

    const expiresInDays = Math.round((json.expires_in || 0) / 86400);
    console.log('Novo token gerado com sucesso!');
    console.log(`Válido por aproximadamente ${expiresInDays} dias.`);
    console.log('');
    console.log('Atualize o secret INSTAGRAM_ACCESS_TOKEN no GitHub com o valor abaixo:');
    console.log('');
    console.log(json.access_token);
}

main().catch((error) => {
    console.error(`Erro: ${error.message}`);
    process.exitCode = 1;
});
