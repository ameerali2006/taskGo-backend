import { Request, Response, NextFunction } from 'express';

export interface IAuthController {
  signUp(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  logout(req: Request, res: Response, next: NextFunction): Promise<void>;
  getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
}