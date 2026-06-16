import { ok } from "@/lib/api-response";

export async function POST() {
  return ok({
    message: "Logout berhasil. Hapus token JWT dari penyimpanan aplikasi.",
  });
}
