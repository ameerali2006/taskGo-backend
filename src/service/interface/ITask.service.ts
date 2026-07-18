import { ITask } from "../../models/task.model";
import { TaskAnalyticsDTO } from "../../dto/task-analytics.dto";

export interface ITaskService {
  getTasks(userId: string): Promise<ITask[]>;
  createTask(userId: string, data: any): Promise<ITask>;
  updateTask(userId: string, taskId: string, data: any): Promise<ITask | null>;
  deleteTask(userId: string, taskId: string): Promise<boolean>;
  getAnalytics(userId: string): Promise<TaskAnalyticsDTO>;
}

