import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { badRequest, created, parseZodError, serverError } from "@/lib/api-response";
import { getJwtSecret, signJwt } from "@/lib/jwt";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { sanitizeUser } from "@/lib/auth";
import { registerSchema } from "@/lib/user-schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = registerSchema.parse(body);
    const passwordHash = await hashPassword(payload.password);

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        passwordHash,
        photoUrl: payload.photoUrl,
      },
    });
    const token = await signJwt(
      {
        sub: String(user.id),
        role: "user",
        email: user.email,
      },
      getJwtSecret(),
    );

    return created({
      user: sanitizeUser(user),
      token,
      tokenType: "Bearer",
      expiresIn: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest("Payload register tidak valid", parseZodError(error));
    }

    if (isUniqueConstraintError(error)) {
      return badRequest("Email sudah terdaftar");
    }

    return serverError();
  }
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
