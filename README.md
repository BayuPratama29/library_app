# 📚 Library Management System - Backend API

Backend API untuk sistem manajemen perpustakaan yang mendukung peminjaman dan pembelian buku dengan fitur lengkap untuk admin dan student.

## 🚀 Fitur Utama

### 👨‍🎓 Student Features

- ✅ Register & Login

- ✅ Browse katalog buku dengan pagination, search, dan filter

- ✅ Tambah buku ke keranjang (rent/purchase)

- ✅ Checkout dan pembayaran

- ✅ Upload bukti pembayaran

- ✅ Riwayat transaksi

- ✅ Profile management

### 👨‍💼 Admin Features

- ✅ Manajemen buku (CRUD)

- ✅ Manajemen kategori

- ✅ Approve/Reject peminjaman

- ✅ Konfirmasi pembayaran

- ✅ Manajemen pengembalian buku

- ✅ Track buku yang terlambat dikembalikan

- ✅ Dashboard & statistik

## 🔐 Security Features

JWT Authentication

- Password hashing dengan bcrypt

- Role-based access control (Admin/Student)

- Rate limiting untuk API endpoints

- Input validation dengan Joi

- Helmet.js untuk security headers


## 🛠️ Tech Stack

- Runtime: Node.js

- Framework: Express.js

- Database: MySQL

- Authentication: JWT (JSON Web Tokens)

- Validation: Joi

- File Upload: Multer

- Logging: Winston & Morgan

- Security: Helmet, bcrypt, express-rate-limit


## 📋 Prerequisites
Pastikan sudah terinstall:

- Node.js (v14 atau lebih tinggi)
  
- MySQL (v8.0 atau lebih tinggi)
  
- npm atau yarn

