import { ZodError } from "zod";
import { badRequest, noContent, notFound, ok, parseZodError, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { parseId, pengeluaranUpdateSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: Params) {
  const parsedId = parseId(params.id);
  if (!parsedId.success) {
    return badRequest("ID pengeluaran tidak valid");
  }

  try {
    const item = await prisma.pengeluaran.findUnique({
      where: { id: parsedId.data },
    });

    if (!item) {
      return notFound();
    }

    return ok(item);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const parsedId = parseId(params.id);
  if (!parsedId.success) {
    return badRequest("ID pengeluaran tidak valid");
  }

  try {
    const body = await request.json();
    const payload = pengeluaranUpdateSchema.parse(body);

    const item = await prisma.pengeluaran.update({
      where: { id: parsedId.data },
      data: payload,
    });

    return ok(item);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest("Payload pengeluaran tidak valid", parseZodError(error));
    }

    if (isRecordNotFound(error)) {
      return notFound();
    }

    return serverError();
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const parsedId = parseId(params.id);
  if (!parsedId.success) {
    return badRequest("ID pengeluaran tidak valid");
  }

  const { searchParams } = new URL(request.url);
  const permanent = searchParams.get("permanent") === "true";

  try {
    if (permanent) {
      await prisma.pengeluaran.delete({
        where: { id: parsedId.data },
      });
    } else {
      await prisma.pengeluaran.update({
        where: { id: parsedId.data },
        data: { isDeleted: true },
      });
    }

    return noContent();
  } catch (error) {
    if (isRecordNotFound(error)) {
      return notFound();
    }

    return serverError();
  }
}

function isRecordNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}
