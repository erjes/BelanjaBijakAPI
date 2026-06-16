import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(6),
  photoUrl: z.string().trim().url().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(1),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  photoUrl: z.string().trim().url().nullable().optional(),
});

export const postCreateSchema = z
  .object({
    text: z.string().trim().min(1),
    imageUrl: z.string().trim().url().optional(),
    imageDataUrl: z
      .string()
      .trim()
      .regex(/^data:image\/(png|jpeg|jpg|webp);base64,/i, "imageDataUrl harus berupa data URL gambar base64")
      .max(1_500_000)
      .optional(),
  })
  .refine((payload) => payload.imageUrl || payload.imageDataUrl, {
    message: "Kirim salah satu dari imageUrl atau imageDataUrl",
    path: ["imageUrl"],
  });

export const postUpdateSchema = z
  .object({
    text: z.string().trim().min(1).optional(),
    imageUrl: z.string().trim().url().nullable().optional(),
    imageDataUrl: z
      .string()
      .trim()
      .regex(/^data:image\/(png|jpeg|jpg|webp);base64,/i, "imageDataUrl harus berupa data URL gambar base64")
      .max(1_500_000)
      .nullable()
      .optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Minimal satu field harus diubah",
  });
