import "reflect-metadata";
import { container } from "tsyringe";
import { IAuthController } from "../controllers/interface/IAuth.controller";
import { AuthController } from "../controllers/auth.controller";
import { UserRepository } from "../repositories/User.repository";
import { JwtService } from "../service/jwt-auth.service";
import { AuthService } from "../service/auth.service";

import { TaskRepository } from "../repositories/Task.repository";
import { TaskService } from "../service/task.service";
import { ITaskController } from "../controllers/interface/ITask.controller";
import { TaskController } from "../controllers/task.controller";
import { SocketServer } from "../socket/socket.server";

// Register Singletons/Dependencies
container.registerSingleton(UserRepository);
container.registerSingleton(JwtService);
container.registerSingleton(AuthService);

container.registerSingleton(SocketServer);
container.registerSingleton(TaskRepository);
container.registerSingleton(TaskService);

// singletons / controllers
export const socketServer = container.resolve(SocketServer);
export const authController = container.resolve<IAuthController>(AuthController);
export const taskController = container.resolve<ITaskController>(TaskController);

export { container };