import Link from "next/link";
import Image from "next/image";
import { ImageSlideshow } from "@/components/image-slideshow";
import { getPublicProducts } from "@/lib/airtable";
import { formatCurrency } from "@/lib/money";

const slideshowImages = Array.from({ length: 13 }, (_, index) => ({
  src: `/images/slideshow/slide-${String(index + 1).padStart(2, "0")}.jpg`,
  alt: `Wedding slideshow photo ${index + 1}`,
}));

export default async function Home() {
  const products = await getPublicProducts();
  const activeProducts = products.filter((product) => product.isActive);
  const categories = Array.from(new Set(activeProducts.map((product) => product.type)));
  const featuredProducts = activeProducts.slice(0, 3);
  return (
    <div className="page-shell">
      <ImageSlideshow images={slideshowImages} />
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Wedding Website for Kenzie and Alex</p>
          <h1>Wedding in Blue:</h1>
          <h1>A Symphony of Love</h1>
          <div className="hero-actions">
            <Link className="button primary" href="/products">
              Browse Registry
            </Link>
            <Link className="button secondary" href="/cart">
              View cart
            </Link>
          </div>
        </div>
        <div className="hero-image-card">
          <Image
            src="/images/home-picture.png"
            alt="Kenzie and Alex dressed for Wedding in Blue"
            fill
            sizes="(max-width: 780px) 100vw, 420px"
            className="hero-image"
            priority
          />
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Our Story</h2>
          <p className="eyebrow">Makenzie and Alex met in July of 2024 and have been inseparable since. Their love of music and adventure together united them and in that same spirit they have explored and built their life together. From traveling to see cowboys to hosting parties, there is nothing they can&apos;t do. The world is big but finding each other made it feel small. Like it was meant to be.</p>
          <p className="eyebrow">Makenzie works as an Underwriter and Alex works as a Software Engineer. They have shared each other&apos;s worlds and dreams and have only seen happiness and hope in each other. Each of them are gifted in music and art and love to show it any time they can. This will be seen in the self-made invitations and website as well as the heartfelt music curation. Everything you will see and experience will reflect their unique bond and shared passions.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Categories</p>
          <h2>Shop by type</h2>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link className="category-card" href={`/products#${category}`} key={category}>
              <span>{category}</span>
              <small>
                {
                  activeProducts.filter((product) => product.type === category)
                    .length
                }{" "}
                items
              </small>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Featured</p>
          <h2>Ready for the celebration</h2>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <article className="product-card compact" key={product.id}>
              <div className="product-image-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.imageUrl} alt="" className="product-image" />
              </div>
              <div className="product-card-body">
                <p className="product-type">{product.type}</p>
                <h3>{product.name}</h3>
                <p className="product-price">{formatCurrency(product.priceCents)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
