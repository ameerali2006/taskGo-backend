"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const container_1 = require("../config/container");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Route for signup (both /signup and /signUp to be safe)
router.post("/signup", container_1.authController.signUp);
router.post("/signUp", container_1.authController.signUp);
// Route for login
router.post("/login", container_1.authController.login);
// Route for logout
router.post("/logout", container_1.authController.logout);
// Route for getting current authenticated user profile
router.get("/me", auth_middleware_1.authMiddleware, container_1.authController.getMe);
exports.default = router;
