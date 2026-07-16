import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { JwtService } from "../service/jwt-auth.service";
import { UserRepository } from "../repositories/User.repository";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
      return;
    }

    const jwtService = container.resolve(JwtService);
    const decoded = jwtService.verifyToken(token, "access");

    if (!decoded || !decoded._id) {
      res.status(401).json({
        success: false,
        message: "Token is invalid or expired",
      });
      return;
    }

    const userRepository = container.resolve(UserRepository);
    const user = await userRepository.findById(decoded._id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found, authorization denied",
      });
      return;
    }

    // Attach user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token verification failed",
    });
  }
};
