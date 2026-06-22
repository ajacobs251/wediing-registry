"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RsvpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [foodAllergies, setFoodAllergies] = useState("");
  const [isAttending, setIsAttending] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          foodAllergies,
          isAttending,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to send RSVP.");
      }

      router.push("/rsvp/thank-you");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to send RSVP.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="checkout-card form-grid rsvp-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="foodAllergies">Food allergies</label>
        <textarea
          id="foodAllergies"
          placeholder="List any food allergies or write none."
          value={foodAllergies}
          onChange={(event) => setFoodAllergies(event.target.value)}
        />
      </div>
      <label className="checkbox-field">
        <input
          required
          type="checkbox"
          checked={isAttending}
          onChange={(event) => setIsAttending(event.target.checked)}
        />
        <span>I am going to the wedding</span>
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <button
        className="button primary full"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
