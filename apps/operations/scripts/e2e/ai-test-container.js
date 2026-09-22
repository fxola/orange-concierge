import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GenericContainer, Wait } from 'testcontainers';
import { AIConfig } from './config.js';

const AIProviderDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'ai-provider');

export async function startAIContainer() {
  console.log('[e2e] Building AI Provider image (cached)...');

  const builder = GenericContainer.fromDockerfile(AIProviderDir, 'Dockerfile').withCache(false);

  const built = await builder.build(AIConfig.image, { deleteOnExit: false });

  console.log('[e2e] Starting AI Provider container...');

  const container = await built
    .withExposedPorts(AIConfig.internalPort)
    .withWaitStrategy(
      Wait.forAll([
        Wait.forLogMessage('AI Provider listening on'),
        Wait.forHttp('/__e2e/requests', AIConfig.internalPort),
      ])
    )
    .withStartupTimeout(120_000)
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(AIConfig.internalPort);
  const baseURL = `http://${host}:${port}`;

  console.log(`[e2e] AI Provider container ready at ${baseURL}`);

  return {
    baseURL,

    async stop() {
      console.log('[e2e] Stopping AI Provider container...');
      await container.stop();
    },
  };
}
