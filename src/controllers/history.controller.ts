import { Request, Response } from "express";
import { newsHistory } from "../utils/history";

export const getHistory = (_req: Request, res: Response) => {
  //! Return the news request history
  res.json(newsHistory);
};
