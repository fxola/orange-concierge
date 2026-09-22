import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import {
  EMBEDDING_MODEL,
  REVIEW_ASSESSMENT,
  REVIEW_RECOMMENDATION_DRAFTS,
  fixedEmbedding,
} from './llm-fixtures.js';

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on('data', (chunk) => chunks.push(chunk));
    request.on('error', reject);
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

async function readJsonBody(request) {
  try {
    return JSON.parse(await readRequestBody(request));
  } catch {
    return undefined;
  }
}

function writeJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

function systemPromptOf(body) {
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const system = messages[0]?.content;
  return typeof system === 'string' ? system : '';
}

function createAIHandler() {
  let modelRequestCount = 0;
  const modelRequests = [];
  let embedRequestCount = 0;

  return async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');

    if (url.pathname === '/__e2e/requests' && request.method === 'GET') {
      writeJson(response, 200, {
        modelRequestCount,
        embedRequestCount,
        requests: modelRequests,
      });
      return;
    }

    if (url.pathname === '/__e2e/reset' && request.method === 'POST') {
      modelRequestCount = 0;
      embedRequestCount = 0;
      modelRequests.length = 0;
      writeJson(response, 200, { ok: true });
      return;
    }

    if (url.pathname === '/api/embed' && request.method === 'POST') {
      const body = await readJsonBody(request);
      const texts = Array.isArray(body?.input) ? body.input : undefined;

      if (!texts) {
        writeJson(response, 400, { error: 'ai_provider_unexpected_embed_request' });
        return;
      }

      embedRequestCount += 1;
      writeJson(response, 200, {
        model: EMBEDDING_MODEL,
        embeddings: texts.map(() => fixedEmbedding()),
      });
      return;
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      const body = await readJsonBody(request);
      const systemPrompt = systemPromptOf(body);

      modelRequestCount += 1;
      modelRequests.push({
        method: request.method ?? 'UNKNOWN',
        path: url.pathname,
        bodyLength: JSON.stringify(body ?? null).length,
      });

      if (systemPrompt.includes('assessment facts')) {
        writeJson(response, 200, {
          model: body?.model ?? 'e2e-ai-model',
          message: { role: 'assistant', content: JSON.stringify(REVIEW_ASSESSMENT) },
        });
        return;
      }

      if (systemPrompt.includes('evidence-backed recommendations')) {
        writeJson(response, 200, {
          model: body?.model ?? 'e2e-ai-model',
          message: { role: 'assistant', content: JSON.stringify(REVIEW_RECOMMENDATION_DRAFTS) },
        });
        return;
      }

      writeJson(response, 500, {
        error: 'ai_provider_unexpected_model_request',
        message: 'The E2E AI Provider server received an unexpected model request.',
      });
      return;
    }

    writeJson(response, 404, { error: 'ai_provider_unknown_path' });
  };
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const host = process.env.HOST ?? '0.0.0.0';
  const port = Number(process.env.PORT ?? 8080);
  const server = createServer(createAIHandler());

  server.listen(port, host, () => {
    console.log(`AI Provider listening on ${host}:${port}`);
  });
}
