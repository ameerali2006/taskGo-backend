import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { injectable } from "tsyringe";
import { registerSocketHandlers } from "./socket.handler";
import { SocketEvents } from "./socket.events";

@injectable()
export class SocketServer {
  private io: SocketIOServer | null = null;

  public init(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "http://localhost:5173",
        credentials: true,
      },
    });

    this.io.on("connection", (socket) => {
      console.log(`🔌 New socket connection: ${socket.id}`);
      registerSocketHandlers(this.io!, socket);
    });

    console.log("⚡ Socket.IO server initialized successfully");
    return this.io;
  }

  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error("Socket.IO server has not been initialized!");
    }
    return this.io;
  }

  public emitTaskCreated(userId: string, task: any): void {
    if (this.io) {
      this.io.to(userId).emit(SocketEvents.TASK_CREATED, task);
      console.log(`📡 Emitted task-created to room ${userId}`);
    }
  }

  public emitTaskUpdated(userId: string, task: any): void {
    if (this.io) {
      this.io.to(userId).emit(SocketEvents.TASK_UPDATED, task);
      console.log(`📡 Emitted task-updated to room ${userId}`);
    }
  }

  public emitTaskDeleted(userId: string, taskId: string): void {
    if (this.io) {
      this.io.to(userId).emit(SocketEvents.TASK_DELETED, { id: taskId });
      console.log(`📡 Emitted task-deleted to room ${userId}`);
    }
  }
}
