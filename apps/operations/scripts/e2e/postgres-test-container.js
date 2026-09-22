import { GenericContainer, Wait } from 'testcontainers';
import { postgresConfig } from './config.js';

export async function startPostgres() {
  console.log('[e2e] Starting PostgreSQL...');

  const container = await new GenericContainer(postgresConfig.image)
    .withEnvironment({
      POSTGRES_USER: postgresConfig.user,
      POSTGRES_PASSWORD: postgresConfig.password,
      POSTGRES_DB: postgresConfig.database,
    })
    .withExposedPorts(postgresConfig.port)
    .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
    .withStartupTimeout(120_000)
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(postgresConfig.port);

  const databaseUrl =
    `postgresql://${postgresConfig.user}` +
    `:${postgresConfig.password}` +
    `@${host}:${port}` +
    `/${postgresConfig.database}`;

  console.log(`[e2e] PostgreSQL ready at ${host}:${port}`);

  return {
    databaseUrl,

    async stop() {
      console.log('[e2e] Stopping PostgreSQL...');
      await container.stop();
    },
  };
}
