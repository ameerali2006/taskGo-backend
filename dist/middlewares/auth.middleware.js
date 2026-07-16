"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const tsyringe_1 = require("tsyringe");
const jwt_auth_service_1 = require("../service/jwt-auth.service");
const User_repository_1 = require("../repositories/User.repository");
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).json({
                success: false,
                message: "No token provided, authorization denied",
            });
            return;
        }
        const jwtService = tsyringe_1.container.resolve(jwt_auth_service_1.JwtService);
        const decoded = jwtService.verifyToken(token, "access");
        if (!decoded || !decoded._id) {
            res.status(401).json({
                success: false,
                message: "Token is invalid or expired",
            });
            return;
        }
        const userRepository = tsyringe_1.container.resolve(User_repository_1.UserRepository);
        const user = await userRepository.findById(decoded._id);
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not found, authorization denied",
            });
            return;
        }
        // Attach user to request object
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: "Token verification failed",
        });
    }
};
exports.authMiddleware = authMiddleware;
