import { RsvpForm } from "@/components/rsvp-form";

export default function RsvpPage() {
  return (
    <div className="page-shell">
      <section className="section-heading">
        <p className="eyebrow">RSVP</p>
        <h1>Let us know you&apos;re coming</h1>
        <p>
          Fill out your name, email, and any food allergies so we can plan for
          the wedding day.
        </p>
      </section>
      <RsvpForm />
    </div>
  );
}
