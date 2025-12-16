import { Router } from "express";
import { UserController } from "../controller/UserController.js";
import { middleware } from "../middleware/middleware.js";

const router = Router();
const userController = new UserController();

// User Routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/validate", userController.validate);
router.delete("/delete", middleware, userController.delete);
router.get("/health", (_, res) => {
  res.send("OK");
});

export default router;