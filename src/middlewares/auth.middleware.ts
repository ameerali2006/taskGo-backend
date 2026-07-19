import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { JwtService } from "../service/jwt-auth.service";
import { UserRepository } from "../repositories/User.repository";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const token = bearerToken || req.cookies?.accessToken;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token is not provided",
      });
      return;
    }

    const jwtService = container.resolve(JwtService);
    const decoded = jwtService.verifyToken(token, "access");

    if (!decoded || !decoded._id) {
      console.log("token expired")

      res.status(401).json({
        success: false,
        message: "Token expired",
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
