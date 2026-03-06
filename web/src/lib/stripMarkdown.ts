/** Strips common markdown syntax for plain-text previews (e.g. card summaries). */
export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')              // fenced code blocks (before inline code)
    .replace(/^#{1,6}\s+/gm, '')                 // headings
    .replace(/(\*\*|__)(.*?)\1/g, '$2')          // bold
    .replace(/\*([^*\n]+)\*/g, '$1')             // italic * (safe — * not used in identifiers)
    .replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, '$1') // italic _ (word-boundary safe — preserves snake_case)
    .replace(/~~(.*?)~~/g, '$1')                 // strikethrough
    .replace(/`([^`]*)`/g, '$1')                 // inline code
    .replace(/^\s*[-*+]\s+/gm, '')               // unordered lists
    .replace(/^\s*\d+\.\s+/gm, '')               // ordered lists
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')    // images (before links)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')     // links
    .replace(/^>\s*/gm, '')                      // blockquotes
    .replace(/\n{2,}/g, ' ')                     // collapse multiple newlines
    .replace(/\s+/g, ' ')                        // collapse whitespace
    .trim();
}
