import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);

    console.log("✅ MongoDB Connected (Mongoose)");
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error);

    process.exit(1);
  }
};

export async function disconnectFromMongoDB() {
  await mongoose.connection.close();
}

export default connectDB;