import { sequelize } from "../config/database";

class DatabaseService {
  async initialize() {
    try {
      await sequelize.authenticate();
      console.log("Database connection established");

      // Sync models with database
      await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
      console.log("Database synchronized");
    } catch (error) {
      console.error("Database connection failed:", error);
      process.exit(1);
    }
  }
}

export const databaseService = new DatabaseService();
