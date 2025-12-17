import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AppointmentService } from "../service/AppointmentService.js";
import { Appointment } from "../entity/Appointment.js";
import Result from "../bean/Result.js";
import { getResult, getResultAndData } from "../bean/getResult.js";
import { getDecodedJwtToken } from "../middleware/middleware.js";

export class AppointmentController {
  private appointmentService: AppointmentService;

  constructor() {
    this.appointmentService = new AppointmentService();
  }

  public createAppointment = async (req: Request, res: Response): Promise<Result<any>> => {
    try {
      const appointment: Appointment = req.body;
      const data = getDecodedJwtToken(req.headers.authorization);
      const result = await this.appointmentService.createAppointment(appointment, data.id);
      return getResultAndData(result, res);
    } catch (error: Error | any) {
      return getResult(
        new Result(StatusCodes.INTERNAL_SERVER_ERROR, null, error.message || "Randevu oluşturulamadı"),
        res
      );
    }
  };

  public getAllAppointments = async (req: Request, res: Response): Promise<Result<any>> => {
    try {
      const result = await this.appointmentService.getAllAppointments();
      return getResultAndData(result, res);
    } catch (error: Error | any) {
      return getResult(
        new Result(StatusCodes.INTERNAL_SERVER_ERROR, null, error.message || "Randevular getirilemedi"),
        res
      );
    }
  };

  public getAppointmentById = async (req: Request, res: Response): Promise<Result<any>> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return getResult(new Result(StatusCodes.BAD_REQUEST, null, "Geçersiz ID"), res);
      }

      const result = await this.appointmentService.getAppointmentById(id);
      return getResultAndData(result, res);
    } catch (error: Error | any) {
      return getResult(
        new Result(StatusCodes.INTERNAL_SERVER_ERROR, null, error.message || "Randevu getirilemedi"),
        res
      );
    }
  };

  public getAppointmentByUserId = async (req: Request, res: Response): Promise<Result<any>> => {
    try {
      const data = getDecodedJwtToken(req.headers.authorization);
      const userId = data.id;
      if (isNaN(userId)) {
        return getResult(new Result(StatusCodes.BAD_REQUEST, null, "Geçersiz User ID"), res);
      }

      const result = await this.appointmentService.getAppointmentByUserId(userId);
      return getResultAndData(result, res);
    } catch (error: Error | any) {
      return getResult(
        new Result(StatusCodes.INTERNAL_SERVER_ERROR, null, error.message || "Randevular getirilemedi"),
        res
      );
    }
  };

  public getDoctorAppointments = async (req: Request, res: Response): Promise<Result<any>> => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return getResult(new Result(StatusCodes.BAD_REQUEST, null, "Geçersiz Doctor ID"), res);
      }

      const result = await this.appointmentService.getDoctorAppointments(doctorId);
      return getResultAndData(result, res);
    } catch (error: Error | any) {
      return getResult(
        new Result(StatusCodes.INTERNAL_SERVER_ERROR, null, error.message || "Randevular getirilemedi"),
        res
      );
    }
  };

  public deleteAppointment = async (req: Request, res: Response): Promise<Result<any>> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return getResult(new Result(StatusCodes.BAD_REQUEST, null, "Geçersiz ID"), res);
      }

      const result = await this.appointmentService.deleteAppointment(id);
      return getResult(result, res);
    } catch (error: Error | any) {
      return getResult(
        new Result(StatusCodes.INTERNAL_SERVER_ERROR, null, error.message || "Randevu silinemedi"),
        res
      );
    }
  };
}

