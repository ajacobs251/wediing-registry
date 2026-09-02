import { NextResponse } from "next/server";
import { sendRsvpNotification } from "@/lib/email";
import { hasRsvpAccess } from "@/lib/rsvp-access";

export const dynamic = "force-dynamic";

type RsvpRequest = {
  name?: string;
  email?: string;
  foodAllergies?: string;
  isAttending?: boolean;
};

export async function POST(request: Request) {
  if (!(await hasRsvpAccess())) {
    return NextResponse.json(
      { error: "Wedding RSVP access is required." },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as RsvpRequest;

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 },
      );
    }

    if (!body.email?.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    if (!body.isAttending) {
      return NextResponse.json(
        { error: "Please confirm you are going to the wedding." },
        { status: 400 },
      );
    }

    await sendRsvpNotification({
      name: body.name,
      email: body.email,
      foodAllergies: body.foodAllergies ?? "",
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send RSVP.",
      },
      { status: 400 },
    );
  }
}
