export interface TaskSummaryDTO {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface StatusDistributionDTO {
  status: "Todo" | "In Progress" | "Completed";
  count: number;
}

export interface PriorityDistributionDTO {
  priority: "Low" | "Medium" | "High";
  count: number;
}

export interface WeeklyTaskDTO {
  day: string;
  count: number;
}

export interface MonthlyTaskDTO {
  month: string;
  count: number;
}

export interface TaskAnalyticsDTO {
  summary: TaskSummaryDTO;
  statusDistribution: StatusDistributionDTO[];
  priorityDistribution: PriorityDistributionDTO[];
  weeklyTasks: WeeklyTaskDTO[];
  monthlyTasks: MonthlyTaskDTO[];
}

export interface TaskAnalyticsResponseDTO {
  success: boolean;
  message: string;
  data: TaskAnalyticsDTO;
}
