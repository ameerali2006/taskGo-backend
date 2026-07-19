import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";
const app = express();

const allowedOrigins = process.env.CLIENT_URL || ["http://localhost:5173"];

app.use(cors({
  origin:allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req: express.Request, res: express.Response) => {
  res.send("Task Management API Running...");
});
app.use("/api",router)


export default app;