import { Router } from "express";
import { UserController } from "../controller/UserController.js";

const router = Router();
const userController = new UserController();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.delete("/delete", userController.delete);

export default router;