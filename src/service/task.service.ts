import { injectable, inject } from "tsyringe";
import { ITaskService } from "./interface/ITask.service";
import { TaskRepository } from "../repositories/Task.repository";
import { ITask } from "../models/task.model";

@injectable()
export class TaskService implements ITaskService {
  constructor(
    @inject(TaskRepository)
    private readonly taskRepository: TaskRepository
  ) {}

  async getTasks(userId: string): Promise<ITask[]> {
    return this.taskRepository.findByUser(userId);
  }

  async createTask(userId: string, data: any): Promise<ITask> {
     console.log("Task Data:", data);

    return this.taskRepository.create({
      ...data,
      user: userId,
    });
  }

  async updateTask(userId: string, taskId: string, data: any): Promise<ITask | null> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.user.toString() !== userId) {
      return null;
    }
    return this.taskRepository.update(taskId, data);
  }

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.user.toString() !== userId) {
      return false;
    }
    await this.taskRepository.delete(taskId);
    return true;
  }
}
