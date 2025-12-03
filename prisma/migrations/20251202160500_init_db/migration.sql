-- CreateTable
CREATE TABLE "Pelapor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" TEXT NOT NULL,
    "lastReportTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Laporan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "foto" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pelaporId" TEXT NOT NULL,
    CONSTRAINT "Laporan_pelaporId_fkey" FOREIGN KEY ("pelaporId") REFERENCES "Pelapor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Komentar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isi" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "laporanId" TEXT NOT NULL,
    "pelaporId" TEXT NOT NULL,
    "parentId" TEXT,
    CONSTRAINT "Komentar_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES "Laporan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Komentar_pelaporId_fkey" FOREIGN KEY ("pelaporId") REFERENCES "Pelapor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Komentar_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Komentar" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'moderator'
);

-- CreateIndex
CREATE UNIQUE INDEX "Pelapor_deviceId_key" ON "Pelapor"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
