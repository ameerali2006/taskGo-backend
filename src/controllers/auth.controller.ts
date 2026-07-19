import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { IAuthController } from "./interface/IAuth.controller";
import { AuthService } from "../service/auth.service";
import { JwtService } from "../service/jwt-auth.service";
import { setRefreshTokenCookie, clearAuthCookies } from "../utils/cookie-helper";

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject(AuthService)
    private readonly authService: AuthService,
    @inject(JwtService)
    private readonly jwtService: JwtService
  ) {}

  signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, phone, password } = req.body;

      // Validate inputs
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

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!password || typeof password !== "string" || !passwordRegex.test(password)) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters",
        });
        return;
      }

      const result = await this.authService.signup({ name, email, phone, password });

      if (!result.success) {
        if (result.message === "Email already registered" || result.message === "Phone number already registered") {
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

      setRefreshTokenCookie(res, (result as any).refreshToken!);

      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
        accessToken: result.accessToken,
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
      console.log(result)

      if (!result.success) {
        res.status(200).json({
          success: false,
          message: result.message,
        });
        return;
      }

      setRefreshTokenCookie(res, (result as any).refreshToken!);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const user = (req as any).user;
      const userId = user?.id || user?._id;

      if (userId) {
        await this.authService.logout(userId.toString());
      } else if (refreshToken) {
        const payload = this.jwtService.verifyToken(refreshToken, "refresh");
        if (payload && payload._id) {
          await this.authService.logout(payload._id);
        }
      }

      clearAuthCookies(res);

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

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: "Refresh token missing",
        });
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);
      if (!result.success || !result.accessToken || !result.refreshToken) {
        res.status(401).json({
          success: false,
          message: result.message || "Failed to refresh token",
        });
        return;
      }

      setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json({
        success: true,
        message: result.message,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };
}