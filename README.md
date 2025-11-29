# README

## Progress yang Sudah Dikerjakan

Anda dapat melihat hasil pekerjaan yang telah saya selesaikan pada tautan berikut:

👉 **https://fungsitama.zenio.id/**

> Catatan: Tautan ini akan diperbarui setelah deployment final tersedia.

## Setup Project

Ikuti langkah-langkah berikut untuk menjalankan project secara lokal:

1. Download/clone repository ini
2. Buat file baru .env yang berisikan DATABASE_URL

   ```bash
   DATABASE_URL='postgresql_url'
   ```

3. Jalankan beberapa perintah di bawah ini

   ```bash
   # Install packages
   npm install

   # Generate database baru sesuai schema
   npx drizzle-kit generate
   npx drizzle-kit push

   # Jalankan project
   npm run dev
   ```
