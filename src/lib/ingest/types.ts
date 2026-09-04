// Shared types for the ingestion pipeline.

export interface FetchedItem {
  title: string;
  url: string;
  content?: string; // HTML or plain text body
  summary?: string; // optional explicit summary
  publishedAt?: Date;
  author?: string;
  raw?: unknown;
}

export interface ClassifiedItem extends FetchedItem {
  kind: string; // NEWS_KIND value
  categoryKey: string; // NEWS_CATEGORIES key
  importance: string; // CRITICAL | HIGH | MEDIUM | LOW
  summary: string;
  tags: string[];
  techNames: string[]; // matched technology names
  clusterKey: string;
  sourceName: string;
  sourceType: string;
  urlHash: string;
  itemHash: string;
}

export interface JobLog {
  step: string;
  detail?: string;
  at: string;
}