import { Router, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

const mainRouter = Router();
const routesPath = __dirname;

// Get all route files
const routeFiles = fs.readdirSync(routesPath).filter((file) => {
  return (
    file !== "index.ts" &&
    file !== "index.js" &&
    file !== "auth.route.ts" &&
    (file.endsWith(".route.ts") || file.endsWith(".route.js"))
  );
});

// Global route logging middleware
mainRouter.use((req: Request, res: Response, next: NextFunction) => {
  console.log(
    `[${new Date().toISOString()}] Route called: ${req.method} ${
      req.originalUrl
    }`
  );
  next();
});

// Register routes
routeFiles.forEach(async (file) => {
  try {
    const baseName = file.replace(".route.ts", "").replace(".route.js", "");
    const routePath = `/v1/api/${baseName
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .toLowerCase()}`;

    console.log(`[Route Loader] Registering route: ${routePath}`);

    const module = await import(path.join(routesPath, file));
    const router = module.router || module.default?.router || module.default;

    if (router) {
      // Add route-specific logging
      router.use((req: Request, res: Response, next: NextFunction) => {
        console.log(
          `[${new Date().toISOString()}] Route handler executed: ${
            req.method
          } ${routePath}`
        );
        next();
      });

      mainRouter.use(routePath, router);
    } else {
      console.warn(
        `[Route Loader] Route file ${file} doesn't export a valid router`
      );
    }
  } catch (err) {
    console.error(`[Route Loader] Error loading route ${file}:`, err);
  }
});

export { mainRouter as allRoutes };
