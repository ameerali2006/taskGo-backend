"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectFromMongoDB = disconnectFromMongoDB;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected (Mongoose)");
    }
    catch (error) {
        console.error("❌ Database Connection Failed");
        console.error(error);
        process.exit(1);
    }
};
async function disconnectFromMongoDB() {
    await mongoose_1.default.connection.close();
}
exports.default = connectDB;
