import { NextResponse } from "next/server";

import {
  AMAZON_WEDDING_DECORATIONS_LIST_URL,
  fetchWeddingDecorationsItems,
} from "@/lib/wedding-decorations";

export const runtime = "nodejs";
export const revalidate = 600;

export async function GET() {
  const result = await fetchWeddingDecorationsItems({ revalidateSeconds: revalidate });

  return NextResponse.json(
    {
      listUrl: AMAZON_WEDDING_DECORATIONS_LIST_URL,
      items: result.items,
      fetchedAt: result.fetchedAt,
      note: result.note,
    },
    { status: 200 },
  );
}
