import { ZodError } from "zod";
import { badRequest, ok, parseZodError, serverError } from "@/lib/api-response";
import { getJwtSecret, signJwt } from "@/lib/jwt";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { sanitizeUser } from "@/lib/auth";
import { loginSchema } from "@/lib/user-schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = loginSchema.parse(body);
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user || !(await verifyPassword(payload.password, user.passwordHash))) {
      return Response.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const token = await signJwt(
      {
        sub: String(user.id),
        role: "user",
        email: user.email,
      },
      getJwtSecret(),
    );

    return ok({
      user: sanitizeUser(user),
      token,
      tokenType: "Bearer",
      expiresIn: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest("Payload login tidak valid", parseZodError(error));
    }

    return serverError();
  }
}
