import { Router } from "express";
import { UserController } from "../controller/UserController.js";
import { adminMiddleware, middleware } from "../middleware/middleware.js";
import { AdminController } from "../controller/AdminController.js";
import { AppointmentController } from "../controller/AppointmentController.js";

const router = Router();
const userController = new UserController();
const adminController = new AdminController();
const appointmentController = new AppointmentController();

// User Routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/validate", userController.validate);
router.get("/users", userController.getAllUsers);
router.delete("/delete", middleware, userController.delete);
router.get("/health", (_, res) => {
  res.status(200).json({ status: "OK" });
});

// Admin Routes
router.post("/admin/login", /*adminMiddleware,*/ adminController.login);
router.post("/admin/doctor", adminMiddleware, adminController.addDoctor);
router.delete("/admin/doctor", adminMiddleware, adminController.deleteDoctor);
router.get("/admin/doctor", middleware, adminController.getAllDoctors);

// Appointment Routes
router.post("/appointment", middleware, appointmentController.createAppointment);
router.get("/appointments", middleware, appointmentController.getAllAppointments);
router.get("/admin/appointment/:id", adminMiddleware, appointmentController.getAppointmentById);
router.get("/appointment", middleware, appointmentController.getAppointmentByUserId);
router.delete("/appointment/:id", middleware, appointmentController.deleteAppointment);

// Doctor Routes
router.get("/doctor/:doctorId", middleware, appointmentController.getDoctorAppointments);

export default router;