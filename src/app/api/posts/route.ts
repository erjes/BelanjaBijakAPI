import { ZodError } from "zod";
import { badRequest, created, ok, parseZodError, serverError } from "@/lib/api-response";
import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postCreateSchema } from "@/lib/user-schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = getAuthenticatedUserId();
  if (!userId) {
    return Response.json({ error: "Token user tidak valid" }, { status: 401 });
  }

  try {
    const items = await prisma.post.findMany({
      where: { userId },
      orderBy: { id: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            photoUrl: true,
          },
        },
      },
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

export async function POST(request: Request) {
  const userId = getAuthenticatedUserId();
  if (!userId) {
    return Response.json({ error: "Token user tidak valid" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = postCreateSchema.parse(body);
    const item = await prisma.post.create({
      data: {
        ...payload,
        userId,
      },
    });

    return created(item);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest("Payload post tidak valid", parseZodError(error));
    }

    return serverError();
  }
}
