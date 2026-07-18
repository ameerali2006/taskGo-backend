
import { injectable } from "tsyringe";
import { Types } from "mongoose";

import { ITask, TaskModel } from "../models/task.model";
import { ITaskRepository } from "./interface/ITask.repository";
import { BaseRepository } from "./Base.repostiory";
import { TaskPriority, TaskStatus } from "../config/constants/enums";
import { TaskAnalyticsDTO } from "../dto/task-analytics.dto";


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

  async getAnalytics(userId: string): Promise<TaskAnalyticsDTO> {
    const userObjectId = new Types.ObjectId(userId);
    const now = new Date();

    // 7 days ago at start of day
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [aggregationResult] = await this.model.aggregate([
      { $match: { user: userObjectId } },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                completedTasks: {
                  $sum: { $cond: [{ $eq: ["$status", TaskStatus.COMPLETED] }, 1, 0] },
                },
                pendingTasks: {
                  $sum: { $cond: [{ $ne: ["$status", TaskStatus.COMPLETED] }, 1, 0] },
                },
                inProgressTasks: {
                  $sum: { $cond: [{ $eq: ["$status", TaskStatus.IN_PROGRESS] }, 1, 0] },
                },
                todoTasks: {
                  $sum: { $cond: [{ $eq: ["$status", TaskStatus.TODO] }, 1, 0] },
                },
                lowPriority: {
                  $sum: { $cond: [{ $eq: ["$priority", TaskPriority.LOW] }, 1, 0] },
                },
                mediumPriority: {
                  $sum: { $cond: [{ $eq: ["$priority", TaskPriority.MEDIUM] }, 1, 0] },
                },
                highPriority: {
                  $sum: { $cond: [{ $eq: ["$priority", TaskPriority.HIGH] }, 1, 0] },
                },
                overdueTasks: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $lt: ["$dueDate", now] },
                          { $ne: ["$status", TaskStatus.COMPLETED] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          weekly: [
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
          ],
          monthly: [
            {
              $group: {
                _id: {
                  $dateToString: { format: "%b", date: "$createdAt" },
                },
                monthNum: { $first: { $month: "$createdAt" } },
                count: { $sum: 1 },
              },
            },
            { $sort: { monthNum: 1 } },
          ],
        },
      },
    ]);

    const rawSummary = aggregationResult?.summary?.[0] || {};

    const totalTasks = rawSummary.totalTasks || 0;
    const completedTasks = rawSummary.completedTasks || 0;
    const pendingTasks = rawSummary.pendingTasks || 0;
    const inProgressTasks = rawSummary.inProgressTasks || 0;
    const overdueTasks = rawSummary.overdueTasks || 0;
    const todoTasks = rawSummary.todoTasks || 0;

    const lowPriority = rawSummary.lowPriority || 0;
    const mediumPriority = rawSummary.mediumPriority || 0;
    const highPriority = rawSummary.highPriority || 0;

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Build Weekly Data for past 7 days
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyMap = new Map<string, number>();

    if (aggregationResult?.weekly) {
      for (const item of aggregationResult.weekly) {
        weeklyMap.set(item._id, item.count);
      }
    }

    const weeklyTasks: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = daysOfWeek[d.getDay()];
      weeklyTasks.push({
        day: dayName,
        count: weeklyMap.get(dateStr) || 0,
      });
    }

    // Build Monthly Data for 12 months
    const allMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyMap = new Map<string, number>();

    if (aggregationResult?.monthly) {
      for (const item of aggregationResult.monthly) {
        monthlyMap.set(item._id, item.count);
      }
    }

    const monthlyTasks = allMonths.map((m) => ({
      month: m,
      count: monthlyMap.get(m) || 0,
    }));

    return {
      summary: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        completionRate,
      },
      statusDistribution: [
        { status: "Todo", count: todoTasks },
        { status: "In Progress", count: inProgressTasks },
        { status: "Completed", count: completedTasks },
      ],
      priorityDistribution: [
        { priority: "Low", count: lowPriority },
        { priority: "Medium", count: mediumPriority },
        { priority: "High", count: highPriority },
      ],
      weeklyTasks,
      monthlyTasks,
    };
  }
}

