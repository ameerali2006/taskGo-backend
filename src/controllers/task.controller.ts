import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { ITaskController } from "./interface/ITask.controller";
import { TaskService } from "../service/task.service";

@injectable()
export class TaskController implements ITaskController {
  constructor(
    @inject(TaskService)
    private readonly taskService: TaskService
  ) {}

  getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const tasks = await this.taskService.getTasks(user._id.toString());
      
      const formattedTasks = tasks.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate.toISOString().split("T")[0],
      }));

      res.status(200).json({
        success: true,
        message: "Tasks retrieved successfully",
        data: formattedTasks,
      });
    } catch (error) {
      next(error);
    }
  };

  createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const { title, description, priority, status, dueDate } = req.body;

      if (!title) {
        res.status(400).json({ success: false, message: "Task title is required" });
        return;
      }
      if (!dueDate) {
        res.status(400).json({ success: false, message: "Due date is required" });
        return;
      }

      const task = await this.taskService.createTask(user._id.toString(), {
        title,
        description: description || "",
        priority: priority || "Medium",
        status: status || "Todo",
        dueDate: new Date(dueDate),
      });

      res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: {
          id: task._id.toString(),
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate.toISOString().split("T")[0],
        },
      });
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const id = req.params.id as string;
      const { title, description, priority, status, dueDate } = req.body;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority !== undefined) updateData.priority = priority;
      if (status !== undefined) updateData.status = status;
      if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);

      const task = await this.taskService.updateTask(user._id.toString(), id, updateData);
      if (!task) {
        res.status(404).json({ success: false, message: "Task not found" });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: {
          id: task._id.toString(),
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate.toISOString().split("T")[0],
        },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const id = req.params.id as string;

      const result = await this.taskService.deleteTask(user._id.toString(), id);
      if (!result) {
        res.status(404).json({ success: false, message: "Task not found" });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const analytics = await this.taskService.getAnalytics(user._id.toString());

      res.status(200).json({
        success: true,
        message: "Task analytics fetched successfully",
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };
}

