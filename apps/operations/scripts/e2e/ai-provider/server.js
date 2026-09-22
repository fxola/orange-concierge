import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on('data', (chunk) => chunks.push(chunk));
    request.on('error', reject);
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

function writeJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

function createAIHandler() {
  let modelRequestCount = 0;
  const modelRequests = [];

  return async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');

    if (url.pathname === '/__e2e/requests' && request.method === 'GET') {
      writeJson(response, 200, {
        modelRequestCount,
        requests: modelRequests,
      });
      return;
    }

    if (url.pathname === '/__e2e/reset' && request.method === 'POST') {
      modelRequestCount = 0;
      modelRequests.length = 0;
      writeJson(response, 200, { ok: true });
      return;
    }

    const body = await readRequestBody(request);
    modelRequestCount += 1;
    modelRequests.push({
      method: request.method ?? 'UNKNOWN',
      path: url.pathname,
      bodyLength: body.length,
    });

    writeJson(response, 500, {
      error: 'ai_provider_unexpected_model_request',
      message: 'The E2E AI Provider server received a model request.',
    });
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
