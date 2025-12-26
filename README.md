# Technical Assessment – REST API with Express

## Overview

This project is a small technical assessment designed to demonstrate code structure, clarity, and best practices when building a REST API with Node.js and Express.

The goal of the API is to consume data from a public external API (such as OpenWeatherMap or a similar free service), process and normalize the data, and expose one or more custom endpoints with meaningful, structured responses.

The implementation focuses on clean architecture, input validation, error handling, caching, and basic testing.

## 🛠️ Tech Stack

- Node.js
- Express
- JavaScript
- Jest
- Axios / Fetch

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a .env file at the root of the project and define the required variables:

```env
PORT=3000
EXTERNAL_API_KEY=your_api_key_here
```

Get your API key from the chosen external public API service in `https://newsapi.org/`

### Running the Project

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Running Tests

```bash
npm test
```

## 📁 Project Structure ( example )

```
src/
 ├── controllers/
 ├── services/
 ├── routes/
 ├── utils/
 ├── cache/
 ├── tests/
 └── app.js
```

## ✅ Features Implemented

- Consumption of an external public API
- Input validation with proper error handling
- Normalized and consistent response structure
- In-memory caching with a TTL of 10 minutes
- Simple in-memory history of recent queries
- Basic test coverage:
  - At least one service test
  - At least one controller test

## API Endpoints

This project exposes two main endpoints: `/news` and `/history`.

### 1. POST `/news`

Fetches the latest news on a given topic and optionally filters by relevance, popularity, or publication date.  
It also caches the results in memory for 10 minutes to improve performance.

**Request Body (JSON):**

```json
{
  "topic": "bitcoin",
  "filterBy": "relevancy", // optional: "relevancy" | "popularity" | "publishedAt"
  "page": 1 // optional: page number for pagination
}
```

**Response (JSON):**

```json
{
  "fromCache": false,
  "articles": [
    {
      "title": "Bitcoin hits new high",
      "source": "CryptoNews",
      "author": "John Doe",
      "publishedAt": "2025-12-26T18:34:12Z",
      "url": "https://cryptonews.com/article/bitcoin"
    },
    ...
  ]
}
```

- fromCache: true if the result came from the cache, false if fetched from the external API.
- articles: array of news articles (max 5).

### 2. GET `/history`

Returns the list of the last news queries made to /news, including topic, filter, and timestamp.

**Response (JSON):**

```json
[
  {
    "topic": "bitcoin",
    "filterBy": "relevancy",
    "requestedAt": "2025-12-26T18:34:12.345Z"
  },
  {
    "topic": "tesla",
    "filterBy": "popularity",
    "requestedAt": "2025-12-26T18:36:45.678Z"
  }
]
```

- Useful to see the recent queries stored in the server memory.
- The list is stored in-memory and will be cleared when the server restarts.

### API Decisions / Limits

The API consumes data from NewsAPI, a free public news service.  
To ensure consistent responses and avoid overwhelming the user with information, each request to the `/news` endpoint returns **a maximum of 5 articles** with pagination possible, by querying the next 5 articles in the list.

Users can filter results using the `filterBy` parameter, which accepts three options:

- `relevancy` – returns articles most relevant to the topic.  
- `popularity` – returns articles that are currently most popular.  
- `publishedAt` – returns articles sorted by publication date (default).  

These limits provide useful information to the client, and I also wanted an additional parameter for the request body.