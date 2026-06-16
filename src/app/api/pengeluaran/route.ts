import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { badRequest, created, ok, parseZodError, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { monthSchema, pengeluaranCreateSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bulan = searchParams.get("bulan");
  const includeDeleted = searchParams.get("includeDeleted") === "true";

  const where: Prisma.PengeluaranWhereInput = {};

  if (bulan) {
    const parsedMonth = monthSchema.safeParse(bulan);
    if (!parsedMonth.success) {
      return badRequest("Parameter bulan tidak valid", parseZodError(parsedMonth.error));
    }

    where.tanggal = {
      startsWith: parsedMonth.data,
    };
  }

  if (!includeDeleted) {
    where.isDeleted = false;
  }

  try {
    const items = await prisma.pengeluaran.findMany({
      where,
      orderBy: { id: "desc" },
    });

    const total = items.reduce((sum, item) => sum + item.harga * item.jumlah, 0);

    return ok({
      items,
      summary: {
        count: items.length,
        total,
      },
    });
  } catch {
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = pengeluaranCreateSchema.parse(body);
    const item = await prisma.pengeluaran.create({ data: payload });

    return created(item);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest("Payload pengeluaran tidak valid", parseZodError(error));
    }

    return serverError();
  }
}
