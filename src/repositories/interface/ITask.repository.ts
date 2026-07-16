import { TaskStatus } from "../../config/constants/enums";
import { ITask } from "../../models/task.model";
import { IBaseRepository } from "./IBase.repository";

export interface ITaskRepository extends IBaseRepository<ITask> {
  findByUser(userId: string): Promise<ITask[]>;

  findByStatus(userId: string, status: TaskStatus): Promise<ITask[]>;

  getTaskStatistics(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  }>;
}