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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const tsyringe_1 = require("tsyringe");
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_repository_1 = require("../repositories/User.repository");
const jwt_auth_service_1 = require("./jwt-auth.service");
let AuthService = class AuthService {
    userRepository;
    jwtService;
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async signup(data) {
        // 1. Check if email already exists
        const existingEmail = await this.userRepository.findByEmail(data.email);
        if (existingEmail) {
            return {
                success: false,
                message: "Email already registered",
            };
        }
        // 2. Check if phone already exists
        const existingPhone = await this.userRepository.findByPhone(data.phone);
        if (existingPhone) {
            return {
                success: false,
                message: "Phone number already registered",
            };
        }
        // 3. Hash password using bcrypt
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        // 4. Create the user
        const newUser = await this.userRepository.create({
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: hashedPassword,
        });
        // 5. Generate Access & Refresh Tokens
        const accessToken = this.jwtService.generateAccessToken(newUser._id.toString(), "user");
        const refreshToken = this.jwtService.generateRefreshToken(newUser._id.toString(), "user");
        // 6. Save Refresh Token in Database
        await this.userRepository.updateRefreshToken(newUser._id.toString(), refreshToken);
        return {
            success: true,
            message: "Registration successful",
            data: {
                id: newUser._id.toString(),
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
            },
            accessToken,
            refreshToken,
        };
    }
    async login(data) {
        // 1. Find user by email
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            return {
                success: false,
                message: "Invalid email or password",
            };
        }
        // 2. Compare password
        const isPasswordMatch = await bcrypt_1.default.compare(data.password, user.password);
        if (!isPasswordMatch) {
            return {
                success: false,
                message: "Invalid email or password",
            };
        }
        // 3. Generate Access & Refresh Tokens
        const accessToken = this.jwtService.generateAccessToken(user._id.toString(), "user");
        const refreshToken = this.jwtService.generateRefreshToken(user._id.toString(), "user");
        // 4. Update Refresh Token in Database
        await this.userRepository.updateRefreshToken(user._id.toString(), refreshToken);
        return {
            success: true,
            message: "Login successful",
            data: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
            accessToken,
            refreshToken,
        };
    }
    async logout(userId) {
        await this.userRepository.updateRefreshToken(userId, null);
    }
    async refreshToken(token) {
        const payload = this.jwtService.verifyToken(token, "refresh");
        if (!payload || !payload._id) {
            return {
                success: false,
                message: "Invalid or expired refresh token",
            };
        }
        const user = await this.userRepository.findById(payload._id);
        if (!user || user.refreshToken !== token) {
            return {
                success: false,
                message: "Refresh token revoked or invalid",
            };
        }
        const accessToken = this.jwtService.generateAccessToken(user._id.toString(), "user");
        const newRefreshToken = this.jwtService.generateRefreshToken(user._id.toString(), "user");
        await this.userRepository.updateRefreshToken(user._id.toString(), newRefreshToken);
        return {
            success: true,
            message: "Token refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    async getProfile(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            return {
                success: false,
                message: "User not found",
            };
        }
        return {
            success: true,
            message: "Profile retrieved successfully",
            data: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(User_repository_1.UserRepository)),
    __param(1, (0, tsyringe_1.inject)(jwt_auth_service_1.JwtService)),
    __metadata("design:paramtypes", [User_repository_1.UserRepository,
        jwt_auth_service_1.JwtService])
], AuthService);
