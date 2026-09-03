import { NextResponse } from "next/server";
import {
  createRsvpAccessToken,
  isRsvpAccessConfigured,
  RSVP_ACCESS_COOKIE,
  RSVP_SESSION_LIFETIME_SECONDS,
} from "@/lib/rsvp-access";
import { isRsvpInvitationLookupValid } from "@/lib/rsvp-invitations";

export const dynamic = "force-dynamic";

type RsvpAccessRequest = {
  lookup?: unknown;
};

export async function POST(request: Request) {
  if (!isRsvpAccessConfigured()) {
    console.error(
      "RSVP access is unavailable because RSVP_SESSION_SECRET is missing or shorter than 32 characters.",
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
      { error: "Enter your full name or street address." },
      { status: 400 },
    );
  }

  if (
    typeof body.lookup !== "string" ||
    body.lookup.length === 0 ||
    body.lookup.length > 256
  ) {
    return NextResponse.json(
      { error: "Enter your full name or street address." },
      { status: 400 },
    );
  }

  if (!isRsvpInvitationLookupValid(body.lookup)) {
    return NextResponse.json(
      {
        error:
          "We couldn't find an invitation matching that information. Check the spelling and try again.",
      },
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
