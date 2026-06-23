import Link from "next/link";

import { WeddingDecorationsItems } from "@/components/wedding-decorations-items";

const AMAZON_LIST_URL = "https://www.amazon.com/wedding/guest-view/10ETH89QZ8L8R";

export default function WeddingDecorationsPage() {
  return (
    <div className="page-shell">
      <section className="section-heading">
        <p className="eyebrow">Registry</p>
        <h1>Wedding Decorations</h1>
        <p>
          Here is an option for those to contribute to help decorate the wedding. You can view the
          list here.
        </p>
        <div className="actions">
          <a
            className="button secondary small"
            href={AMAZON_LIST_URL}
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
        <WeddingDecorationsItems listUrl={AMAZON_LIST_URL} />
      </section>
    </div>
  );
}
