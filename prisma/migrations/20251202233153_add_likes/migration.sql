-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "laporanId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    CONSTRAINT "Like_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES "Laporan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_laporanId_deviceId_key" ON "Like"("laporanId", "deviceId");
