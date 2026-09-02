import { NextResponse } from "next/server";
import {
  createRsvpAccessToken,
  isRsvpAccessConfigured,
  isRsvpPasswordValid,
  RSVP_ACCESS_COOKIE,
  RSVP_SESSION_LIFETIME_SECONDS,
} from "@/lib/rsvp-access";

export const dynamic = "force-dynamic";

type RsvpAccessRequest = {
  password?: unknown;
};

export async function POST(request: Request) {
  if (!isRsvpAccessConfigured()) {
    console.error(
      "RSVP access is unavailable because RSVP_PASSWORD is missing or RSVP_SESSION_SECRET is missing or shorter than 32 characters.",
    );

    return NextResponse.json(
      { error: "Guest access is temporarily unavailable." },
      { status: 503 },
    );
  }

  let body: RsvpAccessRequest;

  try {
    body = (await request.json()) as RsvpAccessRequest;
  } catch {
    return NextResponse.json(
      { error: "Enter the wedding password." },
      { status: 400 },
    );
  }

  if (
    typeof body.password !== "string" ||
    body.password.length === 0 ||
    body.password.length > 256
  ) {
    return NextResponse.json(
      { error: "Enter the wedding password." },
      { status: 400 },
    );
  }

  if (!isRsvpPasswordValid(body.password)) {
    return NextResponse.json(
      { error: "That password is not correct." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: RSVP_ACCESS_COOKIE,
    value: createRsvpAccessToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: RSVP_SESSION_LIFETIME_SECONDS,
    path: "/",
  });

  return response;
}
