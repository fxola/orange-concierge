import { createDatabaseFromUrl } from '../database';
import { env } from '../env';
import { DrizzleKnowledgeIndexRepository } from '../adapters/knowledge/drizzle-knowledge-index-repository';
import { config } from '../application/config';
import { PatternSecretScanner } from '../security';
import { createKnowledgeEmbedder } from './embedder-factory';
import { indexKnowledgeCorpus } from './indexer';

async function run(): Promise<void> {
  const { db, client } = createDatabaseFromUrl(env.DATABASE_URL);

  try {
    const result = await indexKnowledgeCorpus({
      embedder: createKnowledgeEmbedder(config.ai),
      store: new DrizzleKnowledgeIndexRepository(db),
      secretScanner: new PatternSecretScanner(),
    });

    if (result.isFailure()) {
      const error = result.getError();
      console.error('Knowledge indexing failed:', error.message);
      if (Object.keys(error.details).length > 0) {
        console.error('Details:', error.details);
      }
      process.exitCode = 1;
      return;
    }

    const indexed = result.getValue();

    console.log(
      `Indexed ${indexed.sourceCount} knowledge sources into ${indexed.chunkCount} chunks.`
    );
  } finally {
    await client.end();
  }
}

run().catch((error: unknown) => {
  console.error('Knowledge indexing failed:', error);
  process.exitCode = 1;
});
