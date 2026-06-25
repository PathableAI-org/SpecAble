const DEFAULT_MAX_LINES = 80

export const truncateSummaryPreview = (
  markdown: string,
  maxLines: number = DEFAULT_MAX_LINES
): string => {
  const lines = markdown.split("\n")

  if (lines.length <= maxLines) {
    return markdown
  }

  const truncated = lines.slice(0, maxLines)

  return [...truncated, "", "... (summary preview truncated)"].join("\n")
}
