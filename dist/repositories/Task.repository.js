"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRepository = void 0;
const tsyringe_1 = require("tsyringe");
const task_model_1 = require("../models/task.model");
const Base_repostiory_1 = require("./Base.repostiory");
const enums_1 = require("../config/constants/enums");
let TaskRepository = class TaskRepository extends Base_repostiory_1.BaseRepository {
    constructor() {
        super(task_model_1.TaskModel);
    }
    async findByUser(userId) {
        return this.model.find({ user: userId });
    }
    async findByStatus(userId, status) {
        return this.model.find({
            user: userId,
            status,
        });
    }
    async getTaskStatistics(userId) {
        const today = new Date();
        const [total, completed, pending, overdue] = await Promise.all([
            this.model.countDocuments({ user: userId }),
            this.model.countDocuments({
                user: userId,
                status: enums_1.TaskStatus.COMPLETED,
            }),
            this.model.countDocuments({
                user: userId,
                status: {
                    $ne: enums_1.TaskStatus.COMPLETED,
                },
            }),
            this.model.countDocuments({
                user: userId,
                dueDate: { $lt: today },
                status: {
                    $ne: enums_1.TaskStatus.COMPLETED,
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
};
exports.TaskRepository = TaskRepository;
exports.TaskRepository = TaskRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], TaskRepository);
