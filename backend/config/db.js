import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURL = process.env.MONGO_URL;
if (!mongoURL) {
  console.error("❌ MONGO_URL is not set in .env file");
  process.exit(1);
}

mongoose
  .connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  });

const db = mongoose.connection;

db.on("disconnected", () => {
  console.log("❌ Disconnected from MongoDB");
});

export default db;
