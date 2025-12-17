# 🏥 Healthcare Appointment System - Backend

Modern ve güvenli bir sağlık randevu sistemi backend uygulaması. Node.js, TypeScript, Express.js ve SQLite kullanılarak geliştirilmiştir.

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
- [Çalıştırma](#çalıştırma)
- [Proje Yapısı](#proje-yapısı)
- [Environment Variables](#environment-variables)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Database Schema](#database-schema)
- [Güvenlik](#güvenlik)

## ✨ Özellikler

### 👤 Kullanıcı Yönetimi
- ✅ Kullanıcı kaydı (register)
- ✅ Kullanıcı girişi (login)
- ✅ JWT token tabanlı kimlik doğrulama
- ✅ Token validasyonu
- ✅ Admin ve normal kullanıcı rolleri

### 🏥 Randevu Sistemi
- ✅ Randevu oluşturma
- ✅ Randevu listeleme (kullanıcı ve doktor bazlı)
- ✅ Randevu güncelleme (status)
- ✅ Randevu silme
- ✅ Gelecek ve geçmiş randevular
- ✅ Doktor müsaitlik kontrolü

### 👨‍⚕️ Doktor Yönetimi (Admin)
- ✅ Doktor ekleme
- ✅ Doktor silme
- ✅ Doktor listeleme
- ✅ Doktor uzmanlık alanları

### 🔐 Admin Paneli
- ✅ Kullanıcı yönetimi
- ✅ Admin yetkisi verme/kaldırma
- ✅ Randevu istatistikleri
- ✅ Kullanıcı istatistikleri

## 🛠 Teknolojiler

- **Runtime**: Node.js v20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: validator
- **HTTP Status Codes**: http-status-codes
- **Dev Tools**: tsx, nodemon

## 📦 Kurulum

### Gereksinimler

- Node.js v20 veya üzeri
- npm veya yarn

### Adımlar

1. **Repository'yi klonlayın:**
```bash
git clone <repository-url>
cd backend
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın:**
```bash
# .env dosyası oluşturun
echo "JWT_SECRET=your-super-secret-key" > .env
echo "PORT=3000" >> .env
```

4. **Database'i başlatın:**
```bash
# İlk çalıştırmada otomatik oluşturulur
npm run dev
```

## 🚀 Çalıştırma

### Development Mode

```bash
npm run dev
```

Server `http://localhost:3000` adresinde başlayacak.

### Production Mode

```bash
# TypeScript'i derle
npm run build

# Derlenmiş kodu çalıştır
npm start
```

### Temizleme

```bash
# node_modules silme
npm run clear
```

## 📁 Proje Yapısı

```
backend/
├── src/
│   ├── bean/              # Result ve helper sınıflar
│   │   ├── Result.ts
│   │   └── getResult.ts
│   ├── config/            # Konfigürasyon dosyaları
│   │   └── database.ts
│   ├── controller/        # HTTP request handler'ları
│   │   ├── UserController.ts
│   │   ├── AdminController.ts
│   │   └── AppointmentController.ts
│   ├── entity/            # Veri modelleri (interfaces)
│   │   ├── User.ts
│   │   ├── Doctor.ts
│   │   └── Appointment.ts
│   ├── middleware/        # Express middleware'leri
│   │   ├── middleware.ts       # JWT auth
│   │   └── admin.middleware.ts # Admin auth
│   ├── repository/        # Database işlemleri
│   │   ├── UserRepository.ts
│   │   ├── AdminRepository.ts
│   │   └── AppointmentRepository.ts
│   ├── routes/            # Route tanımları
│   │   └── routes.ts
│   ├── service/           # Business logic
│   │   ├── UserService.ts
│   │   ├── AdminService.ts
│   │   └── AppointmentService.ts
│   └── server.ts          # Ana uygulama dosyası
├── tests/                 # Test dosyaları
├── .env                   # Environment variables
├── database.sqlite        # SQLite database
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Environment Variables

`.env` dosyasında tanımlanması gerekenler:

```env
# JWT Secret Key (zorunlu)
JWT_SECRET=your-super-secret-key-here

# Server Port (opsiyonel, default: 3000)
PORT=3000
```

## 📚 API Dokümantasyonu

Detaylı API dokümantasyonu için [API_DOCS.md](./API_DOCS.md) dosyasına bakın.

### Base URL

```
http://localhost:3000
```

### Authentication

Çoğu endpoint JWT token gerektirir. Token'ı header'a ekleyin:

```
Authorization: Bearer <your-jwt-token>
```

### Hızlı Başlangıç

```bash
# Kullanıcı kaydı
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "123456",
    "name": "Ahmet",
    "surname": "Yılmaz",
    "phone": 5551234567
  }'

# Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": 5551234567,
    "password": "123456"
  }'
```

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
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
```

### Doctors Table
```sql
CREATE TABLE doctors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullname TEXT NOT NULL UNIQUE,
  expertise TEXT NOT NULL
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  hour INTEGER NOT NULL,
  status TEXT DEFAULT 'booked',
  patient_name TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  UNIQUE(doctor_id, date, hour)
);
```

## 🔐 Güvenlik

### Implemented Security Features

- ✅ **Password Hashing**: bcrypt ile şifreler hash'leniyor (10 rounds)
- ✅ **JWT Authentication**: Token tabanlı kimlik doğrulama
- ✅ **CORS**: Cross-Origin Resource Sharing etkin
- ✅ **SQL Injection**: Prepared statements kullanılıyor
- ✅ **Input Validation**: validator ile input doğrulama
- ✅ **Role-Based Access**: Admin ve user rolleri
- ✅ **Foreign Key Constraints**: Veri bütünlüğü korunuyor

### Admin Hesabı

Default admin hesabı:
```
Email: admin@admin.com
Phone: 5396415255
Password: admin123
```

**⚠️ ÖNEMLİ**: Production'da bu şifreyi mutlaka değiştirin!

## 🌐 Network Erişimi

Aynı ağdaki cihazlardan erişim için:

```bash
npm run dev
```

Server başladığında network IP'leri gösterilir:

```
🚀 SERVER BAŞLATILDI!

📍 Local:   http://localhost:3000
📍 Local:   http://127.0.0.1:3000

📡 Network IP'ler:
   ✅ http://192.168.1.105:3000
```

### macOS Firewall Ayarları

1. **System Settings** → **Network** → **Firewall**
2. **Options** → **+** → **node** veya **tsx** seç
3. **Allow incoming connections** seç

## 🐛 Troubleshooting

### Port zaten kullanımda

```bash
# Port'u kullanan process'i bul
lsof -i :3000

# Process'i öldür
kill -9 <PID>
```

### Database hataları

```bash
# Database'i sıfırla
rm database.sqlite
npm run dev
```

### JWT token hataları

- Token'ın doğru formatta olduğundan emin olun: `Bearer <token>`
- Token'ın süresi dolmamış olmalı (30 gün)
- JWT_SECRET environment variable'ının doğru olduğundan emin olun

## 📊 Response Format

Tüm API response'ları standart formattadır:

### Başarılı Response
```json
{
  "status": "OK",
  "message": "İşlem başarılı",
  "data": { ... }
}
```

### Hata Response
```json
{
  "status": "FAIL",
  "message": "Hata mesajı",
  "error": "Detaylı hata açıklaması"
}
```

## 🧪 Testing

```bash
# Test'leri çalıştır
npm test
```

## 📝 Notlar

- SQLite database `database.sqlite` dosyasında saklanır
- FOREIGN KEY constraint'leri otomatik aktif
- Token süresi 30 gün
- Randevular UNIQUE constraint ile korunur (aynı doktor, tarih, saat)

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altındadır.

## 👥 Ekip

- Backend Developer: Batuhan Kaş
- Database Design: Batuhan Kaş
- API Documentation: Batuhan Kaş

## 📞 İletişim

Sorularınız için: bkas@student.42kocaeli.com.tr

---

⭐ **Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!** ⭐

