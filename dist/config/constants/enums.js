"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPriority = exports.TaskStatus = void 0;
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "Todo";
    TaskStatus["IN_PROGRESS"] = "In Progress";
    TaskStatus["COMPLETED"] = "Completed";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "Low";
    TaskPriority["MEDIUM"] = "Medium";
    TaskPriority["HIGH"] = "High";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
