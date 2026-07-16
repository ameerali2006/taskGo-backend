import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { IAuthController } from "./interface/IAuth.controller";
import { AuthService } from "../service/auth.service";

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject(AuthService)
    private readonly authService: AuthService
  ) {}

  signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, phone, password } = req.body;

      // Backend validations (never trust frontend validation)
      if (!name || typeof name !== "string" || name.trim().length < 3 || name.trim().length > 50) {
        res.status(400).json({
          success: false,
          message: "Name must be between 3 and 50 characters",
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
        return;
      }

      const phoneRegex = /^\d{10}$/;
      if (!phone || typeof phone !== "string" || !phoneRegex.test(phone)) {
        res.status(400).json({
          success: false,
          message: "Phone number must be exactly 10 digits",
        });
        return;
      }

      // Password rule: min 8 characters, one uppercase, one lowercase, one number, one special character
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!password || typeof password !== "string" || !passwordRegex.test(password)) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        });
        return;
      }

      const result = await this.authService.register({ name, email, phone, password });

      if (!result.success) {
        if (result.message === "User already exists" || result.message === "Phone number already exists") {
          res.status(409).json({
            success: false,
            message: result.message,
          });
          return;
        }
        res.status(400).json({
          success: false,
          message: result.message,
        });
        return;
      }

      const isProduction = process.env.NODE_ENV === "production";
      res.cookie("token", result.accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      const result = await this.authService.login({ email, password });

      if (!result.success) {
        res.status(401).json({
          success: false,
          message: result.message,
        });
        return;
      }

      const isProduction = process.env.NODE_ENV === "production";
      res.cookie("token", result.accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.clearCookie("token");
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}