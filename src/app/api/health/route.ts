import { ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export function GET() {
  return ok({
    status: "ok",
    service: "Belanja Bijak API",
    timestamp: new Date().toISOString(),
  });
}
