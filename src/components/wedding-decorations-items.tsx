"use client";

import { useEffect, useMemo, useState } from "react";

type AmazonRegistryItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  itemUrl: string | null;
  purchasedCount: number | null;
  requestedCount: number | null;
};

type ApiResponse = {
  listUrl: string;
  items: AmazonRegistryItem[];
  fetchedAt: string;
  note?: string;
};

export function WeddingDecorationsItems({ listUrl }: { listUrl: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [data, setData] = useState<ApiResponse | null>(null);

  const effectiveListUrl = useMemo(() => data?.listUrl ?? listUrl, [data?.listUrl, listUrl]);
  const items = data?.items ?? [];

  useEffect(() => {
    if (status !== "idle") {
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    async function load() {
      setStatus("loading");

      try {
        const response = await fetch("/api/wedding-decorations", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load.");
        }

        const json = (await response.json()) as ApiResponse;
        if (!isMounted) {
          return;
        }

        setData(json);
        setStatus("loaded");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setStatus("error");
      }
    }

    load();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [status]);

  return (
    <div>
      <div className="actions">
        <button
          type="button"
          className="button secondary small"
          onClick={() => {
            setData(null);
            setStatus("idle");
          }}
          disabled={status === "loading"}
        >
          Refresh items
        </button>
      </div>

      {status === "loading" ? (
        <p className="muted" role="status">
          Loading items...
        </p>
      ) : null}

      {status === "error" ? (
        <p className="muted" role="status">
          We couldn&apos;t load the item list right now. Please use the Go to Amazon button above.
        </p>
      ) : null}

      {status === "loaded" && items.length === 0 ? (
        <p className="muted" role="status">
          Item display is unavailable right now. Please use the Go to Amazon button above.
        </p>
      ) : null}

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
                  href={effectiveListUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  View Item
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
