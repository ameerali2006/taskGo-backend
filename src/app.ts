import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.send("Task Management API Running...");
});
app.use("/api",router)


export default app;