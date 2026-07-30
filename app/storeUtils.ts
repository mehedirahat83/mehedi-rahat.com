export function mergeWithArrayDefaults<
  T extends object,
  K extends keyof T,
>(seed: T, saved: Partial<T>, arrayKeys: readonly K[]): T {
  const merged = { ...seed, ...saved };

  for (const key of arrayKeys) {
    if (!Array.isArray(saved[key])) {
      merged[key] = seed[key];
    }
  }

  return merged;
}
