import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ApiError = {
  error: string;
  details?: unknown;
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function created<T>(data: T) {
  return ok(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(error: string, details?: unknown) {
  return NextResponse.json<ApiError>({ error, details }, { status: 400 });
}

export function notFound(error = "Data tidak ditemukan") {
  return NextResponse.json<ApiError>({ error }, { status: 404 });
}

export function serverError(error = "Terjadi kesalahan pada server") {
  return NextResponse.json<ApiError>({ error }, { status: 500 });
}

export function parseZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
