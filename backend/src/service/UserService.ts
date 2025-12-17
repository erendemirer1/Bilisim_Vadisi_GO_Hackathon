import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repository/UserRepository.js";
import { User } from "../entity/User.js";
import { StatusCodes } from "http-status-codes";
import Result from "../bean/Result.js";
import validator from "validator";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public async register(user: User): Promise<Result<any>> {
    const { email, password, name, surname, phone, isAdmin } = user;

    if (!email || !password || !name || !surname || !phone) {
      return new Result(
        StatusCodes.BAD_REQUEST,
        null,
        "Email, password, name, surname and phone are required"
      );
    }

    if (!validator.isAlpha(name,'tr-TR') || !validator.isAlpha(surname, 'tr-TR')) {
      return new Result(
        StatusCodes.BAD_REQUEST,
        null,
        "İsim ve soyisim sadece harf içermelidir"
      );
    }

    if (!validator.isEmail(email)) {
      return new Result(StatusCodes.BAD_REQUEST, {field: "email"}, "Yanlış email");
    }

    const phoneStr = String(phone);
    if (
      !validator.isNumeric(phoneStr) ||
      phoneStr.length != 10 ||
      !phoneStr.startsWith("5")
    ) {
      return new Result(StatusCodes.BAD_REQUEST, {field: "phone"}, "Yanlış telefon numarası");
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      return new Result(StatusCodes.CONFLICT, {field: "email"}, "User zaten var");
    }

    const existingPhone = await this.userRepository.findByNumber(phone);
    if (existingPhone) {
      return new Result(
        StatusCodes.CONFLICT,
        {field: "phone"},
        "Phone number zaten kayıtlı"
      );
    }

    if (password.length < 6) {
      return new Result(StatusCodes.BAD_REQUEST, {}, "Şifre çok kısa!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userRepository.saveUser(
      email,
      hashedPassword,
      name,
      surname,
      phone,
      isAdmin || false
    );

    return new Result(StatusCodes.CREATED, {}, "User başarıyla oluşturuldu");
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

    if (user.isAdmin) {
      return new Result(StatusCodes.BAD_REQUEST, null, "Admin normal giriş yapamaz!");
    }

    const JWT_SECRET = process.env.JWT_SECRET || "batuhan";
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        phone: user.phone,
        isAdmin: false,
      },
      JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    return new Result(StatusCodes.OK, token, "Giriş başarılı");
  }

  public async delete(phone: string): Promise<boolean> {
    let num;
    try {
      num = parseInt(phone);
    } catch (error) {
      return false;
    }

    const result = await this.userRepository.delete(num);
    return result.changes > 0;
  }

  public async getAllUsers(): Promise<Result<any>> {
    const users = await this.userRepository.findAll();
    return new Result(StatusCodes.OK, users, "Users retrieved successfully");
  }
}
