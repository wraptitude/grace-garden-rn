let objectSequence = 0;

export function createGardenObjectId(
  catalogId: string,
  now = Date.now(),
): string {
  objectSequence = (objectSequence + 1) % 1_000_000;
  return `${catalogId}-${now.toString(36)}-${objectSequence.toString(36)}`;
}
