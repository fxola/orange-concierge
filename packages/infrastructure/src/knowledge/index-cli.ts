import { indexKnowledgeCorpus } from './indexer';

indexKnowledgeCorpus()
  .then((result) => {
    console.log(
      `Indexed ${result.sourceCount} knowledge sources into ${result.chunkCount} chunks.`
    );
  })
  .catch((error: unknown) => {
    console.error('Knowledge indexing failed:', error);
    process.exitCode = 1;
  });
