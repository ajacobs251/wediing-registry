import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 600;

const AMAZON_LIST_URL = "https://www.amazon.com/wedding/guest-view/10ETH89QZ8L8R";
const AMAZON_REGISTRY_ID = "10ETH89QZ8L8R";

type AmazonRegistryItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  itemUrl: string | null;
  purchasedCount: number | null;
  requestedCount: number | null;
};

function decodeHtml(text: string): string {
  return text
    .replaceAll("&quot;", '"')
    .replaceAll("&#34;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ")
    .replaceAll(/&#x([0-9a-fA-F]+);/g, (_match, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replaceAll(/&#(\d+);/g, (_match, dec) => String.fromCharCode(parseInt(dec, 10)))
    .trim();
}

function toAbsoluteAmazonUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `https://www.amazon.com${url}`;
  }

  return `https://www.amazon.com/${url}`;
}

function extractTitle(block: string): string {
  // Gift card funds (ex: "Pet Fund")
  const fundTitleMatch = block.match(/<span class=\"a-size-medium\">\s*([^<]+?)\s*<\/span>/i);
  if (fundTitleMatch) {
    return decodeHtml(fundTitleMatch[1]);
  }

  // Normal items (Product UI) - title is typically in <h2 ...><span>Title</span></h2>
  const productTitleMatch = block.match(
    /data-cy=\"title-recipe\"[\s\S]*?<h2[^>]*>\s*<span[^>]*>([^<]+?)<\/span>/i,
  );
  if (productTitleMatch) {
    return decodeHtml(productTitleMatch[1]);
  }

  const ariaTitleMatch = block.match(/<h2[^>]*aria-label=\"([^\"]+?)\"/i);
  if (ariaTitleMatch) {
    return decodeHtml(ariaTitleMatch[1]);
  }

  return "";
}

function parseAmazonRegistryWidgetHtml(html: string): AmazonRegistryItem[] {
  // Amazon sometimes includes additional classes on this container; match loosely.
  const blocks = html
    .split(/<div class=\"a-section a-spacing-none gr-single-faceout[^\"]*\">/i)
    .slice(1);

  const items: AmazonRegistryItem[] = [];

  for (const block of blocks) {
    const itemIdMatch = block.match(
      /data-faceout-select=\"\{&quot;itemid&quot;:&quot;([^&]+?)&quot;\}\"/i,
    );
    const rawItemId = itemIdMatch ? decodeHtml(itemIdMatch[1]) : null;

    // item IDs look like: ASIN:B0FSKQNF95|ATVPDKIKX0DER
    const id = rawItemId ?? null;

    const title = extractTitle(block);

    const imageMatchA = block.match(
      /<img[^>]*class=\"gr-faceout-image\"[^>]*src=\"([^\"]+)\"/i,
    );
    const imageMatchB = block.match(
      /<img[^>]*src=\"([^\"]+)\"[^>]*class=\"gr-faceout-image\"/i,
    );
    const rawImageUrl = imageMatchA?.[1] ?? imageMatchB?.[1] ?? null;
    const imageUrl = rawImageUrl ? decodeHtml(rawImageUrl) : null;

    const hrefMatch =
      block.match(/href=\"([^\"]*\/dp\/[^\"]+)\"/i) ??
      block.match(/href=\"([^\"]*\/gp\/product\/[^\"]+)\"/i);
    const itemUrl = hrefMatch ? toAbsoluteAmazonUrl(decodeHtml(hrefMatch[1])) : null;

    const purchasedMatch = block.match(
      /gr-faceout-purchased-quantity[^>]*>\s*(\d+)\s*<\/span>\s*of\s*(\d+)/i,
    );
    const purchasedCount = purchasedMatch ? Number(purchasedMatch[1]) : null;
    const requestedCount = purchasedMatch ? Number(purchasedMatch[2]) : null;

    if (!id || !title) {
      continue;
    }

    items.push({
      id,
      title,
      imageUrl,
      itemUrl,
      purchasedCount: Number.isFinite(purchasedCount) ? purchasedCount : null,
      requestedCount: Number.isFinite(requestedCount) ? requestedCount : null,
    });
  }

  // Dedupe by id (some faceouts repeat select wrappers)
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

export async function GET() {
  // "faceouts" variant includes the main thumbnail image in the server HTML.
  const widgetUrl = `https://www.amazon.com/registries/gl/widget/product-grid-container/faceouts/${AMAZON_REGISTRY_ID}?eventType=wedding&ctaType=PurchaseItem`;

  try {
    const response = await fetch(widgetUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
      next: {
        revalidate,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          listUrl: AMAZON_LIST_URL,
          items: [],
          fetchedAt: new Date().toISOString(),
          note: `Amazon returned ${response.status}.`,
        },
        { status: 200 },
      );
    }

    const html = await response.text();
    const items = parseAmazonRegistryWidgetHtml(html);

    return NextResponse.json(
      {
        listUrl: AMAZON_LIST_URL,
        items,
        fetchedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        listUrl: AMAZON_LIST_URL,
        items: [],
        fetchedAt: new Date().toISOString(),
        note: "Unable to load Amazon registry items.",
      },
      { status: 200 },
    );
  }
}
