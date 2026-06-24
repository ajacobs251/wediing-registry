import Link from "next/link";

import {
  AMAZON_WEDDING_DECORATIONS_LIST_URL,
  fetchWeddingDecorationsItems,
} from "@/lib/wedding-decorations";

export const runtime = "nodejs";
export const revalidate = 600;

export default async function WeddingDecorationsPage() {
  const { items, note } = await fetchWeddingDecorationsItems({ revalidateSeconds: revalidate });

  return (
    <div className="page-shell">
      <section className="section-heading">
        <h1>Amazon Wedding Registry</h1>
        <p>
          Here is an option for those who would like to contribute to the wedding. Any contribution is greatly appreciated.
          <br />
          Thank you - Kenzie and Alex.
        </p>
        <div className="actions">
          <a
            className="button secondary small"
            href={AMAZON_WEDDING_DECORATIONS_LIST_URL}
            target="_blank"
            rel="noreferrer noopener"
          >
            Go to Amazon
          </a>
          <Link className="button secondary small" href="/products">
            Back to Registry
          </Link>
        </div>
      </section>

      <section className="external-registry-panel" aria-label="Wedding Decorations items">
        {note ? <p className="muted">{note}</p> : null}

        {items.length ? (
          <div className="product-grid external-registry-grid">
            {items.map((item) => (
              <article className="product-card compact external-registry-item" key={item.id}>
                <div className="product-image-wrap">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="product-image" loading="lazy" />
                  ) : (
                    <div className="external-registry-image-placeholder">No image</div>
                  )}
                </div>
                <div className="product-card-body">
                  <h3>{item.title}</h3>
                  {item.requestedCount !== null && item.purchasedCount !== null ? (
                    <p className="muted">
                      {item.purchasedCount} of {item.requestedCount} purchased
                    </p>
                  ) : null}
                  <a
                    className="button primary full"
                    href={AMAZON_WEDDING_DECORATIONS_LIST_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    View Item
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">Items are temporarily unavailable. Please use the Go to Amazon button above.</p>
        )}
      </section>
    </div>
  );
}
