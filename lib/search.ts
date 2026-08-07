import { type SavedLink } from './api';

/**
 * Smart fuzzy search and date filtering for saved links.
 */

interface ScoredLink {
  link: SavedLink;
  score: number;
}

/**
 * Extract all searchable text fragments from a link
 */
function getSearchableText(link: SavedLink): string {
  const parts: string[] = [];

  // Title
  if (link.title) parts.push(link.title);

  // Full URL
  parts.push(link.url);

  try {
    const url = new URL(link.url);

    // Domain without www
    const domain = url.hostname.replace('www.', '');
    parts.push(domain);

    // Domain parts (e.g. "github" from "github.com")
    parts.push(...domain.split('.'));

    // Path segments (e.g. ["settings", "profile"] from "/settings/profile")
    const pathSegments = url.pathname
      .split('/')
      .filter(Boolean)
      .map((seg) => decodeURIComponent(seg).replace(/[-_]/g, ' '));
    parts.push(...pathSegments);

    // Query parameters (values can contain useful info)
    url.searchParams.forEach((value, key) => {
      parts.push(key.replace(/[-_]/g, ' '));
      if (value) parts.push(value.replace(/[-_]/g, ' '));
    });

    // Hash fragment
    if (url.hash) {
      parts.push(url.hash.slice(1).replace(/[-_]/g, ' '));
    }
  } catch {
    // Invalid URL, just use as-is
  }

  return parts.join(' ').toLowerCase();
}

/**
 * Calculate relevance score for a link against search terms.
 * Higher score = better match.
 */
function calculateScore(searchableText: string, terms: string[]): number {
  let totalScore = 0;
  let allTermsFound = true;

  for (const term of terms) {
    if (!searchableText.includes(term)) {
      // Try character-level fuzzy: check if all characters appear in order
      if (fuzzyCharMatch(searchableText, term)) {
        totalScore += 1; // Low score for fuzzy char match
      } else {
        allTermsFound = false;
        break;
      }
    } else {
      // Exact substring match — score based on how prominent the match is
      let termScore = 5;

      // Bonus: term appears at the start of a word boundary
      const wordBoundaryPattern = new RegExp(`(?:^|[\\s/._-])${escapeRegex(term)}`, 'i');
      if (wordBoundaryPattern.test(searchableText)) {
        termScore += 10;
      }

      // Bonus: exact word match
      const exactWordPattern = new RegExp(`(?:^|[\\s/._-])${escapeRegex(term)}(?:$|[\\s/._-])`, 'i');
      if (exactWordPattern.test(searchableText)) {
        termScore += 15;
      }

      // Bonus: longer match terms are worth more (more specific)
      termScore += Math.min(term.length, 10);

      totalScore += termScore;
    }
  }

  // If not all terms were found, this is not a match
  if (!allTermsFound) return 0;

  return totalScore;
}

/**
 * Simple character-level fuzzy matching.
 */
function fuzzyCharMatch(text: string, pattern: string): boolean {
  if (pattern.length < 3) return false;

  let patternIdx = 0;
  for (let i = 0; i < text.length && patternIdx < pattern.length; i++) {
    if (text[i] === pattern[patternIdx]) {
      patternIdx++;
    }
  }
  return patternIdx === pattern.length;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Options for filtering links
 */
export interface FilterOptions {
  query?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

/**
 * Search and filter links with fuzzy matching, date range filter, and relevance scoring.
 */
export function searchLinks(links: SavedLink[], options: FilterOptions | string = {}): SavedLink[] {
  const opts: FilterOptions = typeof options === 'string' ? { query: options } : options;
  const { query = '', startDate, endDate } = opts;

  // 1. Date Range Filtering
  let filtered = links;

  if (startDate || endDate) {
    const startMs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : 0;
    const endMs = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : Infinity;

    filtered = filtered.filter((link) => {
      const linkMs = new Date(link.createdAt).getTime();
      return linkMs >= startMs && linkMs <= endMs;
    });
  }

  // 2. Query Filtering & Scoring
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return filtered;

  const terms = trimmed.split(/\s+/).filter((t) => t.length > 0);
  if (terms.length === 0) return filtered;

  const scored: ScoredLink[] = [];

  for (const link of filtered) {
    const searchableText = getSearchableText(link);
    const score = calculateScore(searchableText, terms);

    if (score > 0) {
      scored.push({ link, score });
    }
  }

  // Sort by score (highest first), then by recency
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.link.createdAt).getTime() - new Date(a.link.createdAt).getTime();
  });

  return scored.map((s) => s.link);
}
