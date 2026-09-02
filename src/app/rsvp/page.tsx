import type { Metadata } from "next";

import { RsvpAccessForm } from "@/components/rsvp-access-form";
import { RsvpForm } from "@/components/rsvp-form";
import { hasRsvpAccess } from "@/lib/rsvp-access";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RsvpPage() {
  const hasAccess = await hasRsvpAccess();

  if (!hasAccess) {
    return (
      <div className="page-shell">
        <section className="section-heading rsvp-access-heading">
          <p className="eyebrow">Private guest access</p>
          <h1>Enter the wedding password</h1>
          <p>Use the password provided with your invitation to continue.</p>
        </section>
        <RsvpAccessForm />
      </div>
    );
  }

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
