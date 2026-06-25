export const normalizeDisplayName = (name: string): string => name.trim().toLowerCase()

export const wordTokens = (normalizedName: string): readonly string[] => {
  if (normalizedName.length === 0) {
    return []
  }

  return normalizedName.split(/\s+/).filter((token) => token.length > 0)
}

export const jaccardSimilarity = (left: readonly string[], right: readonly string[]): number => {
  if (left.length === 0 && right.length === 0) {
    return 1
  }

  const leftSet = new Set(left)
  const rightSet = new Set(right)
  let intersection = 0

  for (const token of leftSet) {
    if (rightSet.has(token)) {
      intersection += 1
    }
  }

  const union = new Set([...leftSet, ...rightSet]).size

  return union === 0 ? 0 : intersection / union
}

export const LIKELY_DUPLICATE_JACCARD_THRESHOLD = 0.8
