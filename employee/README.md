<div align="center">

<img src="https://i0.wp.com/boomerangmediagroup.co.uk/wp-content/uploads/2019/08/360-logo-for-slideshow.png?ssl=1" style="background-color: white; border-radius: 12px; padding: 10px" alt="Logo"/>

# Payroll

Application Inovasi 360

[![Planner](https://img.shields.io/badge/Planner-darkgreen?style=for-the-badge)](https://planner.cloud.microsoft/inovasi360.id/en-US/Home/Planner/#/plantaskboard?groupId=0e067c55-2c4a-4b5d-a479-14f532c9a6de&planId=Bz5XxsvOY0e-O9sX_KVt88kAHKrV)

</div>

## About the Project

HR Payroll 360 adalah aplikasi web yang menyediakan antarmuka yang sederhana dan ramah pengguna untuk staf sumber daya manusia (Human Resources) untuk mengelola data karyawan, gaji, dan tugas lainnya yang terkait. Aplikasi ini dirancang untuk memudahkan proses SDM dan mengurangi _human errors_. Aplikasi ini juga menyediakan platform yang aman dan handal untuk menyimpan dan mengelola data karyawan.

## Build With

-  ![Node JS](https://img.shields.io/badge/Node_JS_20.18.0-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
-  ![Express JS](https://img.shields.io/badge/Express_JS-000000?style=for-the-badge&logo=express&logoColor=white)
-  ![Typescript](https://img.shields.io/badge/Typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
-  ![Postgresql](https://img.shields.io/badge/Postgresql-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

## Getting Started

Memulai dengan HR Payroll 360 API sangat mudah. Cukup ikuti instruksi di bawah ini.

### Prerequisite

#### Install Node JS

Unduh Node JS dari [website resmi](https://nodejs.org/en). Pastikan Anda mendownload versi 20.18.10 (LTS).

> Alternatifnya Anda bisa mendownload Node JS menggunakan [package manager](https://nodejs.org/en/download/package-manager) atau Node Version Manager (NVM) [for windows](https://github.com/coreybutler/nvm-windows).

### Installation

#### Clone the repository

Pergi ke direktori kerja Anda dan clone repository dengan perintah berikut.

```bash
git clone https://gitlab.com/bigio/inovasi360/hrpayroll360/hrpayroll360-api.git
```

#### Setting .env file

Minta file `.env` dari project lead. File tersebut harus berisi variabel berikut.

```bash
DB_HOST = "xxxxxxxx"
DB_PORT = "xxxxxxxx"
DB_USER = "xxxxxxxx"
DB_PASSWORD = "xxxxxxxx"
DB_NAME = "xxxxxxxx"
```

#### Install required packages

1. Jalankan perintah berikut di direktori project.

   ```bash
   npm install
   ```

2. Pastikan folder `node_modules` sudah terbuat.

Anda seharusnya bisa menjalankan project ini sekarang.

## Usage

### Run the project locally

```bash
npm run dev
```

### Run Linter

```bash
npm run lint
```

### Run Testing

```bash
npm test
```

### API Documentation

Kami menggunakan OpenAPI (Swagger) untuk menghasilkan dokumentasi API yang lengkap untuk proyek ini. Dengan Swagger, kami dapat menyediakan dokumentasi yang jelas, terstruktur, dan interaktif sehingga memudahkan pengembang untuk memahami dan berinteraksi dengan endpoint API kami secara efisien.

Untuk melihat dokumentasi API lengkap, kunjungi Swagger UI di `<your_base_url>/api-docs`.

### Migration

#### **Buat file migration**

Untuk membuat file migration jalankan perintah berikut:

```bash
npx sequelize-cli migration:generate --name <name>
```

Ganti `<name>` dengan nama migrasi Anda. Contohnya `create-employee`.

Migration file akan terbuat di folder `src/plugins/database/migrations` dengan nama `xxxxxx-<name>.js`. Contohnya `xxxxxx-create-employee.js`. `xxxxx` adalah timestamp file dibuat.

Sesuaikan isi file tersebut. Pada bagian fungsi `async up` isi perintah untuk mengubah database (create atau alter). Contoh:

```js
await queryInterface.createTable('table_name', { id: Sequelize.INTEGER })
```

Pada bagian fungsi `async down` isi perintah untuk mengembalikan database (rollback, revert). Contoh:

```js
await queryInterface.dropTable('table_name')
```

#### **Proses Migration**

Untuk menjalankan proses migrasi, jalankan perintah berikut:

```bash
npm run migrate
```

Untuk me-rollback proses migrasi, jalankan perintah berikut:

```bash
npm run migrate:undo
```

#### **Buat file seeder**

Untuk membuat file migration jalankan perintah berikut:

```bash
npx sequelize-cli seed:generate --name <name>
```

Ganti `<name>` dengan nama seeder Anda. Contohnya `insert-employee`.

Migration file akan terbuat di folder `src/plugins/database/seeders` dengan nama `xxxxxx-<name>.js`. Contohnya `xxxxxx-insert-employee.js`. `xxxxx` adalah timestamp file dibuat.

Sesuaikan isi file tersebut. Pada bagian fungsi `async up` isi perintah untuk mengubah database atau table (insert atau update). Contoh:

```js
await queryInterface.bulkInsert(
   'mst_employees',
   [
      {
         name: 'John Doe',
         address: 'New York City'
      },
      {
         name: 'John Cena',
         address: 'Cipaku'
      }
   ],
   {}
)
```

Pada bagian fungsi `async down` isi perintah untuk mengembalikan database atau table (rollback, revert). Contoh:

```js
await queryInterface.bulkDelete('mst_employees', null, {})
```

#### **Proses Seeding**

Untuk menjalankan proses seeding, jalankan perintah berikut:

```bash
npm run seed
```

Untuk me-rollback proses seeding, jalankan perintah berikut:

```bash
npm run seed:undo
```

### Working with Database

1. Jalankan Database Management System (DBMS) favorit Anda. Kami merekomendasikan menggunakan [HeidiSQL](https://www.heidisql.com/) karena gratis, mudah digunakan, dan mendukung beberapa database engine.
2. Masukkan hostname, user, password, port, dan nama database (tanyakan ke project lead). Lalu klik `open`.

> **PERINGATAN**. Jangan menggunakan perintah `drop` atau `delete` tanpa izin dari project lead.

## Contributing

Kami menyambut kontribusi pada proyek ini! Jika Anda ingin berkontribusi, silakan ikuti pedoman berikut.

1. Clone repository ini

   ```bash
   git clone https://gitlab.com/bigio/inovasi360/hrpayroll360/hrpayroll360-api.git
   ```

2. Buat branch baru dari `main`. Nama branch harus mengikuti struktur berikut:

   -  Nama branch harus diawali dengan salah satu tipe fitur.
   -  Contoh, `feat/employee-api` atau `fix/upload-employee-data`.

3. Tulis code Anda.
4. Uji perubahan Anda. Pastikan untuk menguji semua kemungkinan dan kesalahan.
5. Buat commit

   ```bash
   git commit -m <YOUR_COMMIT_MESSAGE>
   ```

   > Sebelum membuat commit, pastikan branch Anda up to date dengan branch main.
   >
   > Jika branch Anda ketinggalan dari branch main, pertama-tama stash perubahan Anda.
   >
   > ```bash
   > git stash -u -m "stash name"
   > ```
   >
   > Lalu pull dari main.
   >
   > ```bash
   > git pull origin main
   > ```
   >
   > Dan terakhir terapkan perubahan Anda.
   >
   > ```bash
   > git stash pop
   > ```

   > Commit message **harus memiliki makna** dan tidak boleh asal-asalan. Selain itu, commit message harus mengikuti format yang telah ditetapkan di [Mekanik Git Workflow Notion](https://bevel-biplane-398.notion.site/Git-Workflow-bb384a3bcdf74af8b74ae249156cc6cd) dan [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).

   Contoh commit message yang baik:

   -  feat: add employee management api
   -  fix(employee-management): update filter validation for find employee with search params

6. Push commit Anda ke repository.

   ```bash
   git push origin <branch-name>
   ```

7. Buat merge request.

   Buat merge request dari branch `<branch-name>` ke `main`

   Set `assignee` ke orang yang bertanggung jawab untuk merging commit dan set `reviewer` ke orang yang bertanggung jawab untuk menyetujui request.

8. Minta reviewer untuk meninjau kode Anda.
9. Jika reviewer menemukan masalah dengan kode Anda, Anda perlu melakukan perbaikan dan push commit baru dengan langkah yang sama seperti sebelumnya (dari langkah 3). Tetapi Anda tidak perlu membuat merge request baru.

   > Anda mungkin akan diminta untuk melakukan squash commit Anda jika lebih dari satu commit.

10.   Setelah kode Anda ditinjau dan disetujui, reviewer akan menggabungkan kode Anda ke branch main.

## Deployment

Kami menggunakan [jenkins](https://www.jenkins.io/) untuk deployment. Jenkins adalah server otomasi yang mengotomasi proses build, test dan deployment. Dalam proyek ini, kami menggunakan jenkins untuk mengotomasi proses build dan deployment.

### Development

Setelah branch Anda digabungkan ke branch main, minta project lead untuk memulai proses deployment.

### Production

Sementara belum ada deployment ke production.
