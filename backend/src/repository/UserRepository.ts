import { db } from "../config/database.js";
import { User } from "../entity/User.js";

export class UserRepository {
  async findAll(): Promise<User[]> {
    return db.prepare("SELECT * FROM users").all() as User[];
  }

  async findById(id: number): Promise<User | null> {
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    const user = stmt.get(id) as User | undefined;
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    const user = stmt.get(email) as User | undefined;
    return user || null;
  }

  async findByNumber(number: number): Promise<User | null> {
    return db
      .prepare("SELECT * FROM users WHERE phone = ?")
      .get(number) as User | null;
  }

  async saveUser(email: string, password: string, name: string, surname: string, phone: number) {
    db
      .prepare("INSERT INTO users (email, password, name, surname, phone) VALUES (?, ?, ?, ?, ?)")
      .run(email, password, name, surname, phone);
  }

  async delete(id: number) {
    return db.prepare("DELETE FROM users WHERE phone = ?").run(id);
  }
}
