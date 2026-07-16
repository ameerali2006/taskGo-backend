"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModel = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../config/constants/enums");
const taskSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: Object.values(enums_1.TaskStatus),
        default: enums_1.TaskStatus.TODO,
    },
    priority: {
        type: String,
        enum: Object.values(enums_1.TaskPriority),
        default: enums_1.TaskPriority.MEDIUM,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
exports.TaskModel = (0, mongoose_1.model)("Task", taskSchema);
