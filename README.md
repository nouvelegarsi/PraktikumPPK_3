# ExpenseTracker

Aplikasi manajemen keuangan pribadi berbasis web yang memungkinkan mahasiswa mencatat pemasukan dan pengeluaran secara online. Sistem ini menyediakan autentikasi akun dengan session & cookie, manajemen transaksi dengan kategori, filter transaksi, serta dashboard ringkasan saldo.

## User Story

Sebagai mahasiswa, saya ingin mencatat pemasukan dan pengeluaran saya melalui aplikasi web yang mudah digunakan, sehingga saya dapat memantau kondisi keuangan pribadi saya kapan saja tanpa perlu mencatat manual di kertas.

## Daftar SRS

| Kode | Deskripsi | Acceptance Criteria |
|---|---|---|
| SRS-001 | Register akun (nama, email, password). | - Form register memiliki field nama, email, password<br>- Email harus unik (ditolak jika sudah terdaftar)<br>- Password minimal 8 karakter<br>- Password disimpan dalam bentuk hash, bukan plaintext |
| SRS-002 | Login dengan email & password, membuat session baru. | - Login gagal jika email/password salah, tanpa memberi tahu mana yang salah<br>- Login berhasil membuat record session di database<br>- Session ID dikirim ke browser lewat cookie httpOnly |
| SRS-003 | Session tetap berlaku selama belum kedaluwarsa. | - Pengguna tetap login walau tab/browser dibuka ulang selama cookie masih valid<br>- Session punya waktu kedaluwarsa (expires_at)<br>- Session yang sudah lewat expires_at dianggap tidak valid |
| SRS-004 | Middleware proteksi halaman yang butuh autentikasi. | - Akses ke /dashboard, /transaksi, /pengaturan tanpa session valid → redirect ke /login<br>- Middleware mengecek session di setiap request ke halaman terproteksi |
| SRS-005 | Logout mengakhiri session. | - Klik logout menghapus record session di database<br>- Cookie session dihapus dari browser<br>- Setelah logout, akses ke halaman terproteksi kembali redirect ke /login |
| SRS-006 | Tambah transaksi baru. | - Form transaksi punya field jenis, kategori, jumlah, tanggal, deskripsi (opsional)<br>- Transaksi baru otomatis terhubung ke user_id yang sedang login<br>- Jumlah harus berupa angka positif |
| SRS-007 | Melihat daftar transaksi milik sendiri. | - Hanya menampilkan transaksi dengan user_id sesuai session yang login<br>- Transaksi ditampilkan terurut berdasarkan tanggal terbaru |
| SRS-008 | Mengubah transaksi. | - Hanya bisa mengubah transaksi milik sendiri (dicek dari session, bukan dari input form)<br>- Percobaan mengubah transaksi user lain ditolak (403) |
| SRS-009 | Menghapus transaksi. | - Hanya bisa menghapus transaksi milik sendiri<br>- Percobaan menghapus transaksi user lain ditolak (403) |
| SRS-010 | Filter transaksi berdasarkan jenis. | - Tersedia filter: semua / pemasukan / pengeluaran<br>- Daftar transaksi diperbarui sesuai filter tanpa reload halaman |
| SRS-011 | Dashboard ringkasan keuangan. | - Menampilkan nama pengguna, saldo, total pemasukan, total pengeluaran<br>- Menampilkan 5 transaksi terbaru<br>- Saldo = total pemasukan − total pengeluaran |
| SRS-012 | Cookie preferensi pengguna (tema & bahasa). | - Preferensi tema (dark/light) tersimpan di cookie<br>- Preferensi bahasa (ID/EN) tersimpan di cookie<br>- Preferensi otomatis diterapkan saat aplikasi dibuka kembali |
| SRS-013 | Halaman pengaturan preferensi. | - Pengguna dapat mengubah tema & bahasa dari halaman pengaturan<br>- Perubahan langsung tersimpan ke cookie |

## Kebutuhan Non-Fungsional

| Kode | Deskripsi | Acceptance Criteria |
|---|---|---|
| SRS-015 | Password harus di-hash (misal menggunakan `bcrypt`) dan tidak pernah disimpan dalam bentuk *plaintext*. | Keamanan Otentikasi |
| SRS-016 | Cookie session harus menggunakan flag `httpOnly` dan `secure` (di lingkungan *production*) agar tidak dapat diakses melalui JavaScript sisi klien (mencegah XSS). | Keamanan Session & Cookie |
| SRS-017 | Session harus memiliki batas waktu kedaluwarsa (*expiration time*, misal 1–7 hari). | Manajemen Sesi |
| SRS-018 | Semua query transaksi wajib difilter berdasarkan `user_id` yang terverifikasi dari session, bukan dari parameter yang dikirim oleh klien (mencegah IDOR). | Otorisasi & Akses Data |

## Menjalankan Proyek

Proyek ini menggunakan **Next.js (App Router)**, **PostgreSQL**, dan **Prisma 7** sebagai ORM.

### Prasyarat
- Node.js terpasang
- PostgreSQL sudah berjalan (lokal atau cloud)

### Langkah instalasi

```bash
# 1. Clone repository
git clone <url-repo-kamu>
cd expense-tracker

# 2. Install dependencies
npm install

# 3. Salin file environment lalu isi DATABASE_URL
cp .env.example .env
```

Isi `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker"
```

```bash
# 4. Jalankan migrasi database (membuat tabel sesuai schema.prisma)
npx prisma migrate dev

# 5. Generate Prisma Client
npx prisma generate

# 6. Jalankan development server
npm run dev
```

Buka `http://localhost:3000` di browser.

> Catatan: Prisma 7 menggunakan Prisma Client baru (`prisma-client`, bukan `prisma-client-js`) sebagai default — pastikan `generator client` di `schema.prisma` menyesuaikan.

## Struktur Folder

```
expense-tracker/
├── prisma/
│   └── schema.prisma       # Skema database (users, sessions, categories, transactions)
├── app/
│   ├── login/              # Halaman login
│   ├── register/           # Halaman register
│   ├── dashboard/          # Halaman dashboard ringkasan
│   ├── transaksi/          # Halaman manajemen transaksi
│   ├── pengaturan/         # Halaman preferensi (tema & bahasa)
│   └── api/                # Route handlers (auth, transaksi, dll)
├── lib/
│   ├── db.js               # Koneksi Prisma Client
│   └── session.js          # Helper session & cookie
├── middleware.js           # Proteksi halaman terautentikasi
├── .env.example            # Contoh environment variable
└── README.md                # Dokumentasi proyek
```
