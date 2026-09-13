export function readEmbeddingVectors(value: unknown, providerName: string): number[][] {
  if (!Array.isArray(value)) {
    throw new Error(`${providerName} returned embeddings in an unexpected shape.`);
  }

  return value.map((embedding) => {
    if (!Array.isArray(embedding)) {
      throw new Error(`${providerName} returned a non-array embedding.`);
    }

    return embedding.map((dimension) => {
      if (typeof dimension !== 'number' || !Number.isFinite(dimension)) {
        throw new Error(`${providerName} returned a non-numeric embedding dimension.`);
      }

      return dimension;
    });
  });
}

export function readEmbeddingDimensions(embeddings: readonly (readonly number[])[]): number {
  return embeddings[0]?.length ?? 0;
}
