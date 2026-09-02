"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RsvpAccessForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to verify the password.");
      }

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to verify the password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="checkout-card form-grid rsvp-form rsvp-access-form"
      onSubmit={handleSubmit}
    >
      <div className="field">
        <label htmlFor="rsvpPassword">Wedding password</label>
        <input
          id="rsvpPassword"
          autoComplete="current-password"
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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
        {isSubmitting ? "Checking..." : "Continue"}
      </button>
    </form>
  );
}
