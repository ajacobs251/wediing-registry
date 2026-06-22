import Image from "next/image";

export default function RsvpThankYouPage() {
  return (
    <div className="page-shell">
      <section className="checkout-card rsvp-thank-you">
        <p className="eyebrow">RSVP received</p>
        <h1>Thank you and we look forward to seeing you at the wedding</h1>
        <div className="rsvp-thank-you-image">
          <Image
            src="/images/home-picture.png"
            alt="Kenzie and Alex"
            fill
            sizes="(max-width: 780px) 100vw, 720px"
            priority
          />
        </div>
      </section>
    </div>
  );
}
