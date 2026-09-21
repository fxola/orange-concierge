import type { ExtractedFacts } from './schemas';

function pushListPaths(paths: string[], base: string, values: readonly string[] | undefined): void {
  if (!values) {
    return;
  }

  values.forEach((_, index) => {
    paths.push(`${base}[${index}]`);
  });
}

export function factPathsFor(facts: ExtractedFacts): string[] {
  const paths: string[] = [];

  if (facts.custody?.currentArrangement) {
    paths.push('custody.currentArrangement');
  }

  pushListPaths(paths, 'custody.assetsDiscussed', facts.custody?.assetsDiscussed);

  pushListPaths(paths, 'custody.concerns', facts.custody?.concerns);

  pushListPaths(paths, 'cybersecurity.controls', facts.cybersecurity?.controls);

  pushListPaths(paths, 'cybersecurity.risks', facts.cybersecurity?.risks);

  if (facts.cybersecurity?.incidentHistory) {
    paths.push('cybersecurity.incidentHistory');
  }

  pushListPaths(paths, 'planning.goals', facts.planning?.goals);

  pushListPaths(paths, 'planning.constraints', facts.planning?.constraints);

  pushListPaths(paths, 'planning.nextSteps', facts.planning?.nextSteps);

  return paths;
}
