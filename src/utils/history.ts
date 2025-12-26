export interface NewsRequest {
  topic: string | null;
  filterBy: string | null;
  requestedAt: string;
  failed?: boolean;
}

export const newsHistory: NewsRequest[] = [];

export const addToHistory = (topic: string | null, filterBy: string | null, failed = false) => {
  newsHistory.push({
    topic,
    filterBy,
    requestedAt: new Date().toISOString(),
    failed,
  });

  if (newsHistory.length > 100) {
    newsHistory.shift();
  }
};
