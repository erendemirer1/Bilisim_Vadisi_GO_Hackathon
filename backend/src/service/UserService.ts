import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repository/UserRepository.js";
import { User } from "../entity/User.js";
import { StatusCodes } from "http-status-codes";
import Result from "../bean/Result.js";
import validator, { isNumeric } from "validator";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(user: User): Promise<Result<any>> {
    const { email, password, name, surname, phone } = user;

    if (!email || !password || !name || !surname || !phone) {
      return new Result(
        StatusCodes.BAD_REQUEST,
        null,
        "Email, password, name, surname and phone are required"
      );
    }

    if (!validator.isAlpha(name) || !validator.isAlpha(surname)) {
      return new Result(
        StatusCodes.BAD_REQUEST,
        null,
        "Invalid name or surname"
      );
    }

    if (!validator.isEmail(email)) {
      return new Result(StatusCodes.BAD_REQUEST, null, "Invalid email");
    }

    const phoneStr = String(phone);
    if (
      !validator.isNumeric(phoneStr) ||
      phoneStr.length != 10 ||
      !phoneStr.startsWith("5")
    ) {
      return new Result(StatusCodes.BAD_REQUEST, null, "Invalid phone number");
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      return new Result(StatusCodes.CONFLICT, null, "User already exists");
    }

    const existingPhone = await this.userRepository.findByNumber(phone);
    if (existingPhone) {
      return new Result(
        StatusCodes.CONFLICT,
        null,
        "Phone number already exists"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userRepository.saveUser(
      email,
      hashedPassword,
      name,
      surname,
      phone
    );

    return new Result(StatusCodes.CREATED, {}, "User created successfully");
  }

  async login(phone: number, password: string): Promise<Result<any>> {
    const user = await this.userRepository.findByNumber(phone);
    if (!user) {
      return new Result(StatusCodes.UNAUTHORIZED, null, "User not found!");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Result(StatusCodes.UNAUTHORIZED, null, "Wrong Password!");
    }

    const JWT_SECRET = process.env.JWT_SECRET || "batuhan";
    const token = jwt.sign(
      {
        email: user.email,
        name: user.name,
        surname: user.surname,
        phone: user.phone,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return new Result(StatusCodes.OK, token, "Login successful");
  }

  async delete(phone: string): Promise<boolean> {
    let num;
    try {
      num = parseInt(phone);
    } catch (error) {
      return false;
    }

    const result = await this.userRepository.delete(num);
    return result.changes > 0;
  }
}

