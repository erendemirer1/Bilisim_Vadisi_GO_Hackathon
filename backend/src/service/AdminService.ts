import { AdminRepository } from "../repository/AdminRepository.js";
import { StatusCodes } from "http-status-codes";
import Result from "../bean/Result.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repository/UserRepository.js";
import { Doctor } from "../entity/Doctor.js";

export class AdminService {
  private adminRepository: AdminRepository;
  private userRepository: UserRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
    this.userRepository = new UserRepository();
  }

  public async login(phone: number, password: string): Promise<Result<any>> {
    const user = await this.userRepository.findByNumber(phone);
    if (!user) {
      return new Result(StatusCodes.UNAUTHORIZED, {field: "phone"}, "Kullanıcı bulunamadı!");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Result(StatusCodes.UNAUTHORIZED, {field: "password"}, "Yanlış Şifre!");
    }

    if (!user.isAdmin) {
      return new Result(StatusCodes.BAD_REQUEST, {field: "admin"}, "Kullanıcı admin değil!");
    }

    const JWT_SECRET = process.env.JWT_SECRET || "batuhan";
    const token = jwt.sign(
      {
        email: user.email,
        name: user.name,
        surname: user.surname,
        phone: user.phone,
        isAdmin: true,
      },
      JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    return new Result(StatusCodes.OK, token, "Giriş başarılı");
  }

  public async addDoctor(doctor: Doctor): Promise<Result<any>> {
    const doc = await this.adminRepository.findDoctorByFullname(
      doctor.fullname,
    );
    if (doc) {
      return new Result(StatusCodes.NOT_FOUND, {}, "Doctor zaten kayıtlı");
    }

    await this.adminRepository.saveDoctor(doctor);

    return new Result(StatusCodes.OK, {}, "Doctor added successfully");
  }

  public async deleteDoctor(id: string): Promise<Result<any>> {
    let intId;
    try {
      intId = parseInt(id);
    } catch (error) {
      return new Result(StatusCodes.BAD_REQUEST, {}, "Invalid doctor id");
    }

    await this.adminRepository.deleteDoctor(intId);
    return new Result(StatusCodes.OK, {}, "Doctor deleted successfully");
  }

  public async getAllDoctors(): Promise<Result<any>> {
    const doctors = await this.adminRepository.findAllDoctors();
    return new Result(StatusCodes.OK, doctors, "Doctors retrieved successfully");
  }
}
