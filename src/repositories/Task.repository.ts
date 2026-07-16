
import { injectable } from "tsyringe";

import { ITask, TaskModel } from "../models/task.model";
import { ITaskRepository } from "./interface/ITask.repository";
import { BaseRepository } from "./Base.repostiory";
import { TaskStatus } from "../config/constants/enums";


@injectable()
export class TaskRepository
  extends BaseRepository<ITask>
  implements ITaskRepository
{
  constructor() {
    super(TaskModel);
  }

  async findByUser(userId: string): Promise<ITask[]> {
    return this.model.find({ user: userId });
  }

  async findByStatus(
    userId: string,
    status: TaskStatus
  ): Promise<ITask[]> {
    return this.model.find({
      user: userId,
      status,
    });
  }

  async getTaskStatistics(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  }> {
    const today = new Date();

    const [total, completed, pending, overdue] = await Promise.all([
      this.model.countDocuments({ user: userId }),

      this.model.countDocuments({
        user: userId,
        status: TaskStatus.COMPLETED,
      }),

      this.model.countDocuments({
        user: userId,
        status: {
          $ne: TaskStatus.COMPLETED,
        },
      }),

      this.model.countDocuments({
        user: userId,
        dueDate: { $lt: today },
        status: {
          $ne: TaskStatus.COMPLETED,
        },
      }),
    ]);

    return {
      total,
      completed,
      pending,
      overdue,
    };
  }
}
