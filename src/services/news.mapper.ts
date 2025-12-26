type ArticlesMapper = {
  title: string;
  source: { name: string };
  author: string;
  publishedAt: string;
  url: string;
}[];

export const mapNewsResponse = (articles: ArticlesMapper) =>
  articles.map((article) => ({
    title: article.title,
    source: article.source.name,
    author: article.author,
    publishedAt: article.publishedAt,
    url: article.url,
  }));
