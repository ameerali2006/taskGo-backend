import { Router } from "express";
import { taskController } from "../config/container";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Secure all task routes
router.use(authMiddleware);

router.get("/analytics", taskController.getAnalytics);
router.get("/", taskController.getTasks);
router.post("/", taskController.createTask);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

export default router;
