"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tsyringe_1 = require("tsyringe");
const auth_service_1 = require("../service/auth.service");
const jwt_auth_service_1 = require("../service/jwt-auth.service");
let AuthController = class AuthController {
    authService;
    jwtService;
    constructor(authService, jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }
    signUp = async (req, res, next) => {
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
            const isProduction = process.env.NODE_ENV === "production";
            // Set HTTP Only Access Token Cookie (15m expiry)
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: isProduction,
                maxAge: 15 * 60 * 1000,
            });
            // Set HTTP Only Refresh Token Cookie (7 days expiry)
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: isProduction,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(201).json({
                success: true,
                message: result.message,
                data: result.data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    login = async (req, res, next) => {
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
            // Set HTTP Only Access Token Cookie (15m expiry)
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: isProduction,
                maxAge: 15 * 60 * 1000,
            });
            // Set HTTP Only Refresh Token Cookie (7 days expiry)
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: isProduction,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    logout = async (req, res, next) => {
        try {
            const refreshToken = req.cookies?.refreshToken;
            const user = req.user;
            const userId = user?.id || user?._id;
            if (userId) {
                await this.authService.logout(userId.toString());
            }
            else if (refreshToken) {
                const payload = this.jwtService.verifyToken(refreshToken, "refresh");
                if (payload && payload._id) {
                    await this.authService.logout(payload._id);
                }
            }
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        }
        catch (error) {
            next(error);
        }
    };
    getMe = async (req, res, next) => {
        try {
            const user = req.user;
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
        }
        catch (error) {
            next(error);
        }
    };
    refreshToken = async (req, res, next) => {
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
            if (!result.success) {
                res.status(401).json({
                    success: false,
                    message: result.message,
                });
                return;
            }
            const isProduction = process.env.NODE_ENV === "production";
            // Set HTTP Only Access Token Cookie (15m expiry)
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: isProduction,
                maxAge: 15 * 60 * 1000,
            });
            // Set HTTP Only Refresh Token Cookie (7 days expiry)
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: isProduction,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(200).json({
                success: true,
                message: result.message,
                accessToken: result.accessToken,
            });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(auth_service_1.AuthService)),
    __param(1, (0, tsyringe_1.inject)(jwt_auth_service_1.JwtService)),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_auth_service_1.JwtService])
], AuthController);
