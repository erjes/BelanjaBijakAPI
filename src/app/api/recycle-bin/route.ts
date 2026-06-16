import { ok, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.pengeluaran.findMany({
      where: { isDeleted: true },
      orderBy: { id: "desc" },
    });

    return ok({
      items,
      summary: {
        count: items.length,
      },
    });
  } catch {
    return serverError();
  }
}
