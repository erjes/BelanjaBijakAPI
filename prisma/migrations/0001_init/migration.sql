CREATE TABLE "pengeluaran" (
  "id" SERIAL NOT NULL,
  "namaBarang" TEXT NOT NULL,
  "harga" DOUBLE PRECISION NOT NULL,
  "jumlah" INTEGER NOT NULL,
  "tanggal" TEXT NOT NULL,
  "kategori" TEXT NOT NULL,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "pengeluaran_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "keranjang_belanja" (
  "id" SERIAL NOT NULL,
  "namaProduk" TEXT NOT NULL,
  "perkiraanHarga" DOUBLE PRECISION NOT NULL,
  "ukuranIsi" DOUBLE PRECISION NOT NULL,
  "isChecked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "keranjang_belanja_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pengeluaran_tanggal_isDeleted_idx" ON "pengeluaran"("tanggal", "isDeleted");
