/** Strips common markdown syntax for plain-text previews (e.g. card summaries). */
export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')              // fenced code blocks (before inline code)
    .replace(/^#{1,6}\s+/gm, '')                 // headings
    .replace(/(\*\*|__)(.*?)\1/g, '$2')          // bold
    .replace(/(\*|_)(.*?)\1/g, '$2')             // italic
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
