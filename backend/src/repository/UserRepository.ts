import { db } from "../config/database.js";
import { User } from "../entity/User.js";

export class UserRepository {
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

  async saveUser(email: string, password: string, name: string, surname: string, phone: number, isAdmin: boolean) {
    db
      .prepare("INSERT INTO users (email, password, name, surname, phone, isAdmin) VALUES (?, ?, ?, ?, ?, ?)")
      .run(email, password, name, surname, phone, isAdmin ? 1 : 0);
  }

  async delete(id: number) {
    return db.prepare("DELETE FROM users WHERE phone = ?").run(id);
  }

  async findAll(): Promise<User[]> {
    return db.prepare("SELECT id, email, name, surname, phone, isAdmin FROM users ORDER BY id ASC").all() as User[];
  }
}
