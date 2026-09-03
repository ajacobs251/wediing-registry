import type { Metadata } from "next";

import { FindInvitationForm } from "@/components/find-invitation-form";
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
          <p className="eyebrow">Guest RSVP</p>
          <h1>Find My Invitation</h1>
          <p>
            Enter the full name of an invited guest or the street address where
            the invitation was sent.
          </p>
        </section>
        <FindInvitationForm />
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
