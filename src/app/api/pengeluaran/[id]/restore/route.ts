import { badRequest, notFound, ok, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { parseId } from "@/lib/schemas";

export const dynamic = "force-dynamic";

type Params = {
  params: {
    id: string;
  };
};

export async function POST(_request: Request, { params }: Params) {
  const parsedId = parseId(params.id);
  if (!parsedId.success) {
    return badRequest("ID pengeluaran tidak valid");
  }

  try {
    const item = await prisma.pengeluaran.update({
      where: { id: parsedId.data },
      data: { isDeleted: false },
    });

    return ok(item);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return notFound();
    }

    return serverError();
  }
}
