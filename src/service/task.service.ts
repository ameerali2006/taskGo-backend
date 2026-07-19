import { injectable, inject } from "tsyringe";
import { ITaskService } from "./interface/ITask.service";
import { TaskRepository } from "../repositories/Task.repository";
import { SocketServer } from "../socket/socket.server";
import { ITask } from "../models/task.model";
import { TaskAnalyticsDTO } from "../dto/task-analytics.dto";

@injectable()
export class TaskService implements ITaskService {
  constructor(
    @inject(TaskRepository)
    private readonly taskRepository: TaskRepository,
    @inject(SocketServer)
    private readonly socketServer: SocketServer
  ) {}

  private formatTask(task: ITask) {
    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    };
  }

  async getTasks(userId: string): Promise<ITask[]> {
    return this.taskRepository.findByUser(userId);
  }

  async createTask(userId: string, data: any): Promise<ITask> {
    console.log("Task Data:", data);

    const task = await this.taskRepository.create({
      ...data,
      user: userId,
    });

    this.socketServer.emitTaskCreated(userId, this.formatTask(task));

    return task;
  }

  async updateTask(userId: string, taskId: string, data: any): Promise<ITask | null> {
    const existing = await this.taskRepository.findById(taskId);
    if (!existing || existing.user.toString() !== userId) {
      return null;
    }

    const updatedTask = await this.taskRepository.update(taskId, data);
    if (updatedTask) {
      this.socketServer.emitTaskUpdated(userId, this.formatTask(updatedTask));
    }

    return updatedTask;
  }

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    const existing = await this.taskRepository.findById(taskId);
    if (!existing || existing.user.toString() !== userId) {
      return false;
    }

    await this.taskRepository.delete(taskId);
    this.socketServer.emitTaskDeleted(userId, taskId);

    return true;
  }

  async getAnalytics(userId: string): Promise<TaskAnalyticsDTO> {
    return this.taskRepository.getAnalytics(userId);
  }
}

