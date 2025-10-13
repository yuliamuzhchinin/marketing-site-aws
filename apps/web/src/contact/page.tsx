"use client";
import React, { useState } from "react";

/**
 * This page displays a contact form that will later call
 * your AWS API Gateway endpoint. For now it just checks a
 * local /api/health route.
 */

export default function ContactPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error("Health check failed");
      setStatus("✅ Simulated send OK — backend not deployed yet.");
    } catch (err) {
      setStatus("❌ Local check failed (expected until backend exists).");
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 760, margin: "0 auto" }}>
      <h1>Contact — Marketing Services</h1>
      <p>Fill out this form and we’ll reach out to local businesses.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Phone (optional)"
          value={form.phone}
          onChange={handleChange}
        />
        <textarea
          name="message"
          placeholder="How we can help…"
          value={form.message}
          onChange={handleChange}
          rows={6}
          required
        />
        <button type="submit">Send</button>
      </form>

      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </main>
  );
}
