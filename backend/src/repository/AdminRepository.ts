import { db } from "../config/database.js";
import { User } from "../entity/User.js";
import { Doctor } from "../entity/Doctor.js";

export class AdminRepository {
  async findAllDoctors(): Promise<User[]> {
    return db.prepare("SELECT * FROM doctors ORDER BY id ASC").all() as User[];
  }

  async deleteDoctor(id: number) {
    return db.prepare("DELETE FROM doctors WHERE id = ?").run(id);
  }

  async findDoctorByFullname(fullname: string) {
    return db.prepare("SELECT * FROM doctors WHERE fullname = ?").get(fullname);
  }

  async saveDoctor(doctor: Doctor) {
    return db.prepare("INSERT INTO doctors (fullname, expertise) VALUES (?, ?)").run(doctor.fullname, doctor.expertise);
  }

  async findDoctorById(id: number) {
    return db.prepare("SELECT * FROM doctors WHERE id = ?").get(id);
  }

}

