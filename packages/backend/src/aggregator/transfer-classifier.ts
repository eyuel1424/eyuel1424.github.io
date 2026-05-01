import type { TransferType } from "@arsenal/shared";

interface TransferClassification {
  isTransfer: true;
  transferType: TransferType;
}

const CONFIRMED_PATTERNS = [
  /\bofficial\b/i,
  /\bconfirmed?\b/i,
  /\bsigned\b/i,
  /\bsigning\b/i,
  /\bcompleted?\s+deal\b/i,
  /\bhere\s+we\s+go\b/i,
  /\bannounce[ds]?\b/i,
];

const LOAN_PATTERNS = [
  /\bloan\b/i,
  /\bloaned?\b/i,
  /\bloan\s+(deal|move|spell)\b/i,
];

const CONTRACT_PATTERNS = [
  /\bcontract\s+(extension|renewal|extended)\b/i,
  /\bnew\s+(deal|contract)\b/i,
  /\brenewal\b/i,
  /\bextend(s|ed)?\b/i,
];

const DEPARTURE_PATTERNS = [
  /\bleav(e|es|ing)\b/i,
  /\bdepart(s|ed|ure)?\b/i,
  /\bsold\b/i,
  /\breleased?\b/i,
  /\bexit\b/i,
  /\bfarewell\b/i,
];

const RUMOR_PATTERNS = [
  /\btransfer\b/i,
  /\brumou?r\b/i,
  /\btarget\b/i,
  /\binterest(ed)?\b/i,
  /\bbid\b/i,
  /\boffer\b/i,
  /\bwant(s|ed)?\b/i,
  /\blink(s|ed)?\b/i,
  /\bchase\b/i,
  /\bpursu(e|ing)\b/i,
  /\bswoop\b/i,
  /\bscout(s|ed|ing)?\b/i,
];

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

/**
 * Classify content as transfer-related based on title keywords.
 * Only the title is checked to avoid false positives from incidental
 * mentions of transfer-related words in editorial summaries.
 * Returns null if the content is not transfer-related.
 */
export function classifyTransferItem(
  title: string,
  _summary: string
): TransferClassification | null {
  // Check specific types first (more specific → less specific)
  if (matchesAny(title, LOAN_PATTERNS)) {
    return { isTransfer: true, transferType: "loan" };
  }

  if (matchesAny(title, CONTRACT_PATTERNS)) {
    return { isTransfer: true, transferType: "contract_extension" };
  }

  if (matchesAny(title, DEPARTURE_PATTERNS)) {
    return { isTransfer: true, transferType: "departure" };
  }

  if (matchesAny(title, CONFIRMED_PATTERNS)) {
    return { isTransfer: true, transferType: "confirmed_signing" };
  }

  if (matchesAny(title, RUMOR_PATTERNS)) {
    return { isTransfer: true, transferType: "rumor" };
  }

  return null;
}
