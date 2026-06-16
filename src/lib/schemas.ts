import { z } from "zod";

export const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format bulan harus yyyy-MM");

export const dateSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, "Format tanggal harus yyyy-MM-dd");

const positiveNumber = z.coerce.number().positive();
const positiveInt = z.coerce.number().int().positive();

export const pengeluaranCreateSchema = z.object({
  namaBarang: z.string().trim().min(1),
  harga: positiveNumber,
  jumlah: positiveInt,
  tanggal: dateSchema,
  kategori: z.string().trim().min(1),
});

export const pengeluaranUpdateSchema = pengeluaranCreateSchema.partial().extend({
  isDeleted: z.boolean().optional(),
});

export const keranjangCreateSchema = z.object({
  namaProduk: z.string().trim().min(1),
  perkiraanHarga: positiveNumber,
  ukuranIsi: positiveNumber,
  isChecked: z.boolean().optional(),
});

export const keranjangUpdateSchema = keranjangCreateSchema.partial();

export const compareSchema = z.object({
  productA: z.object({
    harga: positiveNumber,
    ukuranIsi: positiveNumber,
  }),
  productB: z.object({
    harga: positiveNumber,
    ukuranIsi: positiveNumber,
  }),
});

export function parseId(value: string) {
  return z.coerce.number().int().positive().safeParse(value);
}
