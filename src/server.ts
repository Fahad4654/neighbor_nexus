import { databaseService } from "./services/database.service";
import { PORT, CREATE_ADMIN } from "./config";
import createApp from "./app";
import { createAdmin } from "./services/createAdmin.service";


const startServer = async () => {
  try {
    await databaseService.initialize();

    if (CREATE_ADMIN) await createAdmin();

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
