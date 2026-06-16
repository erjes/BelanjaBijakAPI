import { ZodError, z } from "zod";
import { badRequest, ok, parseZodError } from "@/lib/api-response";
import { getJwtSecret, signJwt } from "@/lib/jwt";

const tokenRequestSchema = z.object({
  secret: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = tokenRequestSchema.parse(body);
    const jwtSecret = getJwtSecret();

    if (payload.secret !== jwtSecret) {
      return Response.json({ error: "Secret tidak valid" }, { status: 401 });
    }

    const token = await signJwt(
      {
        sub: "belanja-bijak-app",
        role: "app",
      },
      jwtSecret,
    );

    return ok({
      token,
      tokenType: "Bearer",
      expiresIn: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest("Payload token tidak valid", parseZodError(error));
    }

    if (error instanceof Error && error.message.includes("JWT_SECRET")) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return badRequest("Payload harus berupa JSON valid");
  }
}
