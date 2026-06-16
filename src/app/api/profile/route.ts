import { ZodError } from "zod";
import { badRequest, notFound, ok, parseZodError, serverError } from "@/lib/api-response";
import { getAuthenticatedUserId, sanitizeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/user-schemas";

export async function GET() {
  const userId = getAuthenticatedUserId();
  if (!userId) {
    return Response.json({ error: "Token user tidak valid" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return notFound("Profil tidak ditemukan");
    }

    return ok(sanitizeUser(user));
  } catch {
    return serverError();
  }
}

export async function PATCH(request: Request) {
  const userId = getAuthenticatedUserId();
  if (!userId) {
    return Response.json({ error: "Token user tidak valid" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = profileUpdateSchema.parse(body);
    const user = await prisma.user.update({
      where: { id: userId },
      data: payload,
    });

    return ok(sanitizeUser(user));
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest("Payload profil tidak valid", parseZodError(error));
    }

    return serverError();
  }
}
