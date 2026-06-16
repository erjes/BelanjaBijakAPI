import { ZodError } from "zod";
import { badRequest, ok, parseZodError } from "@/lib/api-response";
import { compareSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = compareSchema.parse(body);
    const unitCostA = payload.productA.harga / payload.productA.ukuranIsi;
    const unitCostB = payload.productB.harga / payload.productB.ukuranIsi;
    const difference = Math.abs(unitCostA - unitCostB);

    let winner: "A" | "B" | "equal" = "equal";
    if (unitCostA < unitCostB) {
      winner = "A";
    } else if (unitCostB < unitCostA) {
      winner = "B";
    }

    return ok({
      unitCostA,
      unitCostB,
      difference,
      winner,
      message:
        winner === "equal"
          ? "Harga per unit kedua produk sama."
          : `Produk ${winner} lebih hemat.`,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest("Payload perbandingan tidak valid", parseZodError(error));
    }

    return badRequest("Payload harus berupa JSON valid");
  }
}
