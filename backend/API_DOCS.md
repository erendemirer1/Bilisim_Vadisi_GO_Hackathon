# 📚 API Documentation

Healthcare Appointment System Backend API dokümantasyonu.

## 📌 Base URL

```
http://localhost:3000
```

## 🔑 Authentication

Korumalı endpoint'ler JWT token gerektirir. Token'ı HTTP header'a ekleyin:

```
Authorization: Bearer <your-jwt-token>
```

### Token Alma

`/login` endpoint'inden dönen token'ı kullanın.

---

## 📋 İçindekiler

- [User Endpoints](#user-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Appointment Endpoints](#appointment-endpoints)
- [Health Check](#health-check)
- [Error Codes](#error-codes)

---

## 👤 User Endpoints

### 1. Kullanıcı Kaydı (Register)

Yeni kullanıcı oluşturur.

**Endpoint:** `POST /register`

**Auth Required:** ❌ No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "123456",
  "name": "Ahmet",
  "surname": "Yılmaz",
  "phone": 5551234567,
  "isAdmin": false
}
```

**Validasyonlar:**
- ✅ `email`: Geçerli email formatı
- ✅ `password`: Minimum 6 karakter
- ✅ `name`: Sadece harfler (Türkçe karakter desteği)
- ✅ `surname`: Sadece harfler (Türkçe karakter desteği)
- ✅ `phone`: 10 haneli, 5 ile başlamalı
- ✅ `isAdmin`: Admin kaydı için özel email domain gerekli (`@admin.com`, `@hospital.com`, `@gov.tr`)

**Success Response:** `201 Created`
```json
{
  "status": "OK",
  "message": "User başarıyla oluşturuldu",
  "data": {}
}
```

**Error Responses:**

`400 Bad Request` - Validasyon hatası
```json
{
  "status": "FAIL",
  "message": "Email, password, name, surname and phone are required"
}
```

`409 Conflict` - Email veya telefon zaten kayıtlı
```json
{
  "status": "FAIL",
  "message": "Email zaten kayıtlı",
  "data": { "field": "email" }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmet@example.com",
    "password": "123456",
    "name": "Ahmet",
    "surname": "Yılmaz",
    "phone": 5551234567
  }'
```

---

### 2. Kullanıcı Girişi (Login)

Kullanıcı girişi yapar ve JWT token döner.

**Endpoint:** `POST /login`

**Auth Required:** ❌ No

**Request Body:**
```json
{
  "phone": 5551234567,
  "password": "123456"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "OK",
  "message": "Giriş başarılı",
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Token içeriği:
```json
{
  "email": "user@example.com",
  "name": "Ahmet",
  "surname": "Yılmaz",
  "phone": 5551234567,
  "isAdmin": false,
  "exp": 1735689600
}
```

**Error Responses:**

`401 Unauthorized` - Yanlış telefon veya şifre
```json
{
  "status": "FAIL",
  "message": "Kullanıcı bulunamadı!",
  "data": { "field": "phone" }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": 5551234567,
    "password": "123456"
  }'
```

---

### 3. Token Validasyonu

Token'ın geçerli olup olmadığını kontrol eder.

**Endpoint:** `GET /validate`

**Auth Required:** ✅ Yes (Bearer token)

**Request Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response:** `200 OK`
```json
{
  "status": "OK",
  "message": "Token is valid",
  "data": {
    "email": "user@example.com",
    "name": "Ahmet",
    "surname": "Yılmaz",
    "phone": 5551234567,
    "isAdmin": false
  }
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "status": "FAIL",
  "message": "Invalid or expired token"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/validate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Kullanıcı Sil

Kullanıcıyı telefon numarasına göre siler.

**Endpoint:** `DELETE /delete`

**Auth Required:** ✅ Yes (middleware)

**Request Body:**
```json
{
  "phone": "5551234567"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "OK",
  "message": "User deleted successfully"
}
```

**Error Response:** `404 Not Found`
```json
{
  "status": "FAIL",
  "message": "Failed to delete user"
}
```

---

### 5. Health Check

Server'ın çalışıp çalışmadığını kontrol eder.

**Endpoint:** `GET /health`

**Auth Required:** ❌ No

**Success Response:** `200 OK`
```json
{
  "status": "OK"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/health
```

---

## 👨‍💼 Admin Endpoints

### 1. Admin Girişi

Admin kullanıcıları için giriş (normal login ile aynı).

**Endpoint:** `POST /login`

**Auth Required:** ❌ No

**Request Body:**
```json
{
  "phone": 5396415255,
  "password": "admin123"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "OK",
  "message": "Giriş başarılı",
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Default Admin:**
- Email: `admin@admin.com`
- Phone: `5396415255`
- Password: `admin123`
- `isAdmin`: `true`

---

### 2. Doktor Ekle

Sisteme yeni doktor ekler.

**Endpoint:** `POST /admin/doctor`

**Auth Required:** ✅ Yes (Admin only - adminMiddleware)

**Request Body:**
```json
{
  "fullname": "Dr. Mehmet Öz",
  "expertise": "Kardiyoloji"
}
```

**Success Response:** `201 Created`
```json
{
  "status": "OK",
  "message": "Doktor başarıyla eklendi",
  "data": {
    "doctorId": 4
  }
}
```

**Error Response:** `409 Conflict` - Doktor zaten var
```json
{
  "status": "FAIL",
  "message": "Bu isimde bir doktor zaten var"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/admin/doctor \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Dr. Mehmet Öz",
    "expertise": "Kardiyoloji"
  }'
```

---

### 3. Doktor Sil

Doktoru sistemden siler.

**Endpoint:** `DELETE /admin/doctor`

**Auth Required:** ✅ Yes (Admin only)

**Request Body:**
```json
{
  "doctorId": 4
}
```

**Success Response:** `200 OK`
```json
{
  "status": "OK",
  "message": "Doktor başarıyla silindi"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/admin/doctor \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"doctorId": 4}'
```

---

### 4. Tüm Doktorları Listele

Sistemdeki tüm doktorları listeler.

**Endpoint:** `GET /admin/doctor`

**Auth Required:** ✅ Yes (middleware)

**Success Response:** `200 OK`
```json
{
  "status": "OK",
  "message": "Doktorlar başarıyla getirildi",
  "data": [
    {
      "id": 1,
      "fullname": "Dr. Mehmet Öz",
      "expertise": "Nöroloji"
    },
    {
      "id": 2,
      "fullname": "Dr. Elif Demir",
      "expertise": "Dahiliye"
    },
    {
      "id": 3,
      "fullname": "Dr. Ayşe Yılmaz",
      "expertise": "Kardiyoloji"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/admin/doctor \
  -H "Authorization: Bearer <token>"
```

---

## 📅 Appointment Endpoints

### 1. Randevu Oluştur

Yeni randevu oluşturur.

**Endpoint:** `POST /api/appointment`

**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "user_id": 1,
  "doctor_id": 2,
  "date": "2025-12-25",
  "hour": 14,
  "patient_name": "Ahmet Yılmaz"
}
```

**Validasyonlar:**
- ✅ `date`: YYYY-MM-DD formatı, geçmiş tarih olamaz
- ✅ `hour`: 0-23 arası
- ✅ Aynı doktor, tarih ve saatte randevu yoksa

**Success Response:** `201 Created`
```json
{
  "status": "OK",
  "message": "Randevu başarıyla oluşturuldu",
  "data": {
    "appointmentId": 15
  }
}
```

**Error Responses:**

`400 Bad Request` - Geçmiş tarih
```json
{
  "status": "FAIL",
  "message": "Geçmiş tarihe randevu alınamaz"
}
```

`409 Conflict` - Randevu zaten var
```json
{
  "status": "FAIL",
  "message": "Bu tarih ve saatte randevu zaten alınmış",
  "data": { "field": "appointment" }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/appointment \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "doctor_id": 2,
    "date": "2025-12-25",
    "hour": 14,
    "patient_name": "Ahmet Yılmaz"
  }'
```

---

### 2. Tüm Randevuları Listele

Sistemdeki tüm randevuları listeler.

**Endpoint:** `GET /api/appointments`

**Auth Required:** ✅ Yes

**Success Response:** `200 OK`
```json
{
  "status": "OK",
  "message": "Randevular başarıyla getirildi",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "doctor_id": 2,
      "date": "2025-12-25",
      "hour": 14,
      "status": "booked",
      "patient_name": "Ahmet Yılmaz",
      "createdAt": "2025-12-17T10:00:00.000Z"
    }
  ]
}
```

**Status değerleri:**
- `booked`: Randevu alındı
- `completed`: Randevu tamamlandı
- `cancelled`: Randevu iptal edildi

---

### 3. Randevu Detayı (Admin)

ID'ye göre randevu detayını getirir.

**Endpoint:** `GET /api/admin/appointment/:id`

**Auth Required:** ✅ Yes (Admin only)

**URL Parameters:**
- `id`: Randevu ID'si

**Success Response:** `200 OK`
```json
{
  "status": "OK",
  "message": "Randevu başarıyla getirildi",
  "data": {
    "id": 1,
    "user_id": 1,
    "doctor_id": 2,
    "date": "2025-12-25",
    "hour": 14,
    "status": "booked",
    "patient_name": "Ahmet Yılmaz"
  }
}
```

---

### 4. Kullanıcının Randevularını Getir

Giriş yapmış kullanıcının tüm randevularını getirir.

**Endpoint:** `GET /api/appointment`

**Auth Required:** ✅ Yes

**Success Response:** `200 OK`
```json
{
  "status": "OK",
  "message": "Kullanıcının randevuları başarıyla getirildi",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "doctor_id": 2,
      "doctor_name": "Dr. Elif Demir",
      "doctor_expertise": "Dahiliye",
      "date": "2025-12-25",
      "hour": 14,
      "status": "booked",
      "patient_name": "Ahmet Yılmaz"
    }
  ]
}
```

---

### 5. Randevu Sil

Randevuyu siler veya iptal eder.

**Endpoint:** `DELETE /api/appointment/:id`

**Auth Required:** ✅ Yes

**URL Parameters:**
- `id`: Randevu ID'si

**Success Response:** `200 OK`
```json
{
  "status": "OK",
  "message": "Randevu başarıyla silindi"
}
```

**Error Response:** `404 Not Found`
```json
{
  "status": "FAIL",
  "message": "Randevu bulunamadı"
}
```

---

## 👨‍⚕️ Doctor Endpoints

### 1. Doktorun Randevularını Getir

Belirli bir doktorun tüm randevularını getirir.

**Endpoint:** `GET /api/doctor/:doctorId`

**Auth Required:** ✅ Yes

**URL Parameters:**
- `doctorId`: Doktor ID'si

**Success Response:** `200 OK`
```json
{
  "status": "OK",
  "message": "Doktorun randevuları başarıyla getirildi",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "user_name": "Ahmet",
      "user_surname": "Yılmaz",
      "user_phone": 5551234567,
      "doctor_id": 2,
      "date": "2025-12-25",
      "hour": 14,
      "status": "booked",
      "patient_name": "Ahmet Yılmaz"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/doctor/2 \
  -H "Authorization: Bearer <token>"
```

---

## ❌ Error Codes

### HTTP Status Codes

| Code | Anlamı | Açıklama |
|------|--------|----------|
| 200 | OK | İstek başarılı |
| 201 | Created | Kaynak başarıyla oluşturuldu |
| 400 | Bad Request | Geçersiz istek parametresi |
| 401 | Unauthorized | Authentication gerekli |
| 403 | Forbidden | Yetki yok (admin gerekli) |
| 404 | Not Found | Kaynak bulunamadı |
| 409 | Conflict | Çakışma (duplicate data) |
| 500 | Internal Server Error | Sunucu hatası |

### Common Error Response Format

```json
{
  "status": "FAIL",
  "message": "Hata mesajı",
  "data": {
    "field": "hatanın oluştuğu alan"
  }
}
```

### Authentication Errors

**Token eksik:**
```json
{
  "status": "FAIL",
  "error": "No token provided"
}
```

**Token geçersiz:**
```json
{
  "status": "FAIL",
  "error": "Invalid or expired token"
}
```

**Admin yetkisi gerekli:**
```json
{
  "status": "FAIL",
  "error": "Bu işlem için admin yetkisi gerekli"
}
```

---

## 📊 Response Examples

### Başarılı Response (with data)
```json
{
  "status": "OK",
  "message": "İşlem başarılı",
  "data": {
    "id": 1,
    "name": "Ahmet"
  }
}
```

### Başarılı Response (without data)
```json
{
  "status": "OK",
  "message": "İşlem başarılı"
}
```

### Hata Response
```json
{
  "status": "FAIL",
  "message": "Hata açıklaması",
  "data": {
    "field": "hangi alan"
  }
}
```

---

## 🧪 Test Examples

### Postman Collection

```json
{
  "info": {
    "name": "Healthcare API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"123456\",\n  \"name\": \"Test\",\n  \"surname\": \"User\",\n  \"phone\": 5551234567\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/register",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "register"]
        }
      }
    }
  ]
}
```

---

## 📝 Notes

- Tüm tarihler ISO 8601 formatında (`YYYY-MM-DD`)
- Telefon numaraları integer olarak saklanır
- JWT token'lar 30 gün geçerli
- Password minimum 6 karakter
- Admin email domain'leri: `@admin.com`, `@hospital.com`, `@gov.tr`

---

## 🔄 Changelog

### v1.0.0 (2025-12-17)
- ✅ Initial release
- ✅ User authentication
- ✅ Admin panel
- ✅ Appointment system
- ✅ Doctor management

---

## 📧 Support

Sorularınız için: [email@example.com]

---

**Son Güncelleme:** 17 Aralık 2025

