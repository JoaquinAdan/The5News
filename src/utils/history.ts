export interface NewsRequest {
  topic: string;
  filterBy: string;
  requestedAt: string;
  failed?: boolean;
}

export const newsHistory: NewsRequest[] = [];

export const addToHistory = (topic: string, filterBy: string, failed = false) => {
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
