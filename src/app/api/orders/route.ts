import { NextResponse } from "next/server";
import { createOrderFromCheckout } from "@/lib/airtable";
import type { CheckoutRequest } from "@/types/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequest;
    const order = await createOrderFromCheckout(body);

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create order.",
      },
      { status: 400 },
    );
  }
}
