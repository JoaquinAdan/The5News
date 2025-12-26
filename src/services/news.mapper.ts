type NewsMapper = {
  title: string;
  source: { name: string };
  author: string;
  publishedAt: string;
  url: string;
}[];

export const mapNewsResponse = (news: NewsMapper) =>
  news.map((newsItem) => ({
    title: newsItem.title,
    source: newsItem.source.name,
    author: newsItem.author,
    publishedAt: newsItem.publishedAt,
    url: newsItem.url,
  }));
