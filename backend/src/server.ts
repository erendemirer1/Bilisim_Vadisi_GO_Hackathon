import express from "express";
import { initializeDatabase } from "./config/database.js";
import userRoutes from "./routes/userRoutes.js";
const app = express();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'batuhan';
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

app.use(express.json());
app.use(userRoutes);

const startServer = async () => {
  try {
    initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();