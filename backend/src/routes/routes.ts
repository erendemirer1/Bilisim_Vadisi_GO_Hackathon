import { Router } from "express";
import { UserController } from "../controller/UserController.js";
import { adminMiddleware, middleware } from "../middleware/middleware.js";
import { AdminController } from "../controller/AdminController.js";

const router = Router();
const userController = new UserController();
const adminController = new AdminController();

// User Routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/validate", userController.validate);
router.delete("/delete", middleware, userController.delete);
router.get("/health", (_, res) => {
  res.send("OK");
});

// Admin Routes
router.post("/admin/login", /*adminMiddleware,*/ adminController.login);
router.post("/admin/addDoctor", adminMiddleware, adminController.addDoctor);
router.delete("/admin/deleteDoctor", adminMiddleware, adminController.deleteDoctor);
router.get("/admin/getAllDoctors", adminMiddleware, adminController.getAllDoctors);

export default router;