CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"nik" varchar(50) NOT NULL,
	"nama" varchar(150) NOT NULL,
	"email" varchar(150),
	"telepon" varchar(50),
	"alamat" text
);
