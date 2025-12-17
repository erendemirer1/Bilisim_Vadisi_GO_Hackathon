import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../../database.sqlite");
export const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

export const initializeDatabase = () => {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        surname TEXT NOT NULL,
        phone INTEGER UNIQUE NOT NULL,
        isAdmin INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO users 
        (id, email, password, name, surname, phone, isAdmin, createdAt, updatedAt) 
        VALUES ('1', 'admin@admin.com', '$2b$10$PrPefOFCEWd4DV6rphh.We3wNwvcGuVSR1KHN/SL9NOCLhtH2km22', 
                'Admin', 'User', 5396415255, 1,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL UNIQUE,
        expertise TEXT NOT NULL
      );
      INSERT INTO doctors (fullname, expertise) VALUES ('Dr. Mehmet Öz', 'Nöroloji') ON CONFLICT DO NOTHING;
      INSERT INTO doctors (fullname, expertise) VALUES ('Dr. Elif Demir', 'Dahiliye') ON CONFLICT DO NOTHING;
      INSERT INTO doctors (fullname, expertise) VALUES ('Dr. Ayşe Yılmaz', 'Kardiyoloji') ON CONFLICT DO NOTHING;
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        date TEXT NOT NULL, -- YYYY-MM-DD format
        hour INTEGER NOT NULL, -- 24 hour format
        status TEXT DEFAULT 'booked', -- booked, completed, cancelled
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        UNIQUE(doctor_id, date, hour)
      );
    `);

    console.log("✅ Database connection established");
  } catch (error) {
    console.error("❌ Error during database initialization:", error);
    throw error;
  }
};

