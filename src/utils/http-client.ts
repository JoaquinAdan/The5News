import axios from "axios";

export const httpClient = axios.create({
  baseURL: "https://newsapi.org/v2",
  timeout: 5000,
});