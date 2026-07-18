import { Router } from "express";
import authRoutes from "./auth.route";
import taskRoutes from "./task.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);

export default router;