import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    { success: true, data, error: null },
    { status: 200, ...init }
  );
}

export function created<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    { success: true, data, error: null },
    { status: 201, ...init }
  );
}

/** 회원가입/로그인 등 기존 API용: (code, message, status, details) */
export function fail(
  code: string,
  message: string,
  status = 400,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: {
        code,
        message,
        details: details ?? null,
      },
    },
    { status }
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          message: "입력값 검증에 실패했습니다.",
          code: "VALIDATION_ERROR",
          details: error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  console.error("[API_ERROR]", error);

  return NextResponse.json(
    {
      success: false,
      data: null,
      error: {
        message: "서버 내부 오류가 발생했습니다.",
        code: "INTERNAL_SERVER_ERROR",
      },
    },
    { status: 500 }
  );
}
