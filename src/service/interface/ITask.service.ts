import { ITask } from "../../models/task.model";

export interface ITaskService {
  getTasks(userId: string): Promise<ITask[]>;
  createTask(userId: string, data: any): Promise<ITask>;
  updateTask(userId: string, taskId: string, data: any): Promise<ITask | null>;
  deleteTask(userId: string, taskId: string): Promise<boolean>;
}
