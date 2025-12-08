import { databaseService } from "./services/database.service";
import { PORT, CREATE_ADMIN, COMPANY_NAME } from "./config";
import createApp from "./app";
import { createAdmin } from "./services/user/createAdmin.service";
import os from "os";

const networkInterfaces = os.networkInterfaces();
const localIP =
  Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface?.family === "IPv4" && !iface.internal)?.address ||
  "localhost";

const startServer = async () => {
  try {
    await databaseService.initialize();

    if (CREATE_ADMIN) await createAdmin();

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`✅ ${COMPANY_NAME} Server is running on:`);
      console.log(`     • Local:   http://localhost:${PORT}`);
      console.log(`     • Local:   http://127.0.0.1:${PORT}`);
      console.log(`     • Network: http://${localIP}:${PORT}`);
      console.log(`     • Health:  http://localhost:${PORT}/v1/api/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
