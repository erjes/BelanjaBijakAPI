import { ZodError } from "zod";
import { badRequest, created, ok, parseZodError, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { keranjangCreateSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.keranjangBelanja.findMany({
      orderBy: { id: "desc" },
    });

    const totalPerkiraan = items
      .filter((item) => !item.isChecked)
      .reduce((sum, item) => sum + item.perkiraanHarga, 0);

    return ok({
      items,
      summary: {
        count: items.length,
        uncheckedCount: items.filter((item) => !item.isChecked).length,
        totalPerkiraan,
      },
    });
  } catch {
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = keranjangCreateSchema.parse(body);
    const item = await prisma.keranjangBelanja.create({ data: payload });

    return created(item);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest("Payload keranjang tidak valid", parseZodError(error));
    }

    return serverError();
  }
}
