import { Router } from "express";
import { authController } from "../config/container";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Route for signup (both /signup and /signUp to be safe)
router.post("/signup", authController.signUp);
router.post("/signUp", authController.signUp);

// Route for login
router.post("/login", authController.login);

// Route for logout
router.post("/logout", authController.logout);

// Route for getting current authenticated user profile
router.get("/me", authMiddleware, authController.getMe);

export default router;