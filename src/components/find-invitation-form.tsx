"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function FindInvitationForm() {
  const router = useRouter();
  const [lookupValue, setLookupValue] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rsvp/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lookup: lookupValue }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to find your invitation.");
      }

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to find your invitation.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="checkout-card form-grid rsvp-form invitation-lookup-form"
      onSubmit={handleSubmit}
    >
      <div className="field">
        <label htmlFor="invitationLookup">Full name or street address</label>
        <input
          id="invitationLookup"
          autoComplete="off"
          maxLength={256}
          placeholder="Enter your full name or street address"
          required
          value={lookupValue}
          onChange={(event) => setLookupValue(event.target.value)}
        />
      </div>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="button primary full"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Searching..." : "Find My Invitation"}
      </button>
    </form>
  );
}
