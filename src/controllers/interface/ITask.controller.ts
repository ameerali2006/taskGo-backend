import { Request, Response, NextFunction } from "express";

export interface ITaskController {
  getTasks(req: Request, res: Response, next: NextFunction): Promise<void>;
  createTask(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateTask(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteTask(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
}

