import { ZodError } from "zod";
import { badRequest, noContent, notFound, ok, parseZodError, serverError } from "@/lib/api-response";
import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseId } from "@/lib/schemas";
import { postUpdateSchema } from "@/lib/user-schemas";

export const dynamic = "force-dynamic";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: Params) {
  const userId = getAuthenticatedUserId();
  if (!userId) {
    return Response.json({ error: "Token user tidak valid" }, { status: 401 });
  }

  const parsedId = parseId(params.id);
  if (!parsedId.success) {
    return badRequest("ID post tidak valid");
  }

  try {
    const item = await prisma.post.findFirst({
      where: {
        id: parsedId.data,
        userId,
      },
    });

    if (!item) {
      return notFound("Post tidak ditemukan");
    }

    return ok(item);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const userId = getAuthenticatedUserId();
  if (!userId) {
    return Response.json({ error: "Token user tidak valid" }, { status: 401 });
  }

  const parsedId = parseId(params.id);
  if (!parsedId.success) {
    return badRequest("ID post tidak valid");
  }

  try {
    const body = await request.json();
    const payload = postUpdateSchema.parse(body);
    const item = await prisma.post.updateMany({
      where: {
        id: parsedId.data,
        userId,
      },
      data: payload,
    });

    if (item.count === 0) {
      return notFound("Post tidak ditemukan");
    }

    const updated = await prisma.post.findUnique({
      where: { id: parsedId.data },
    });

    return ok(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest("Payload post tidak valid", parseZodError(error));
    }

    return serverError();
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = getAuthenticatedUserId();
  if (!userId) {
    return Response.json({ error: "Token user tidak valid" }, { status: 401 });
  }

  const parsedId = parseId(params.id);
  if (!parsedId.success) {
    return badRequest("ID post tidak valid");
  }

  try {
    const item = await prisma.post.deleteMany({
      where: {
        id: parsedId.data,
        userId,
      },
    });

    if (item.count === 0) {
      return notFound("Post tidak ditemukan");
    }

    return noContent();
  } catch {
    return serverError();
  }
}
