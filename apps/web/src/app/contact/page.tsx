"use client";
import React, { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Unknown error");
      setStatus("✅ Sent! We will get back to you soon.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send";
      setStatus(`❌ ${msg}`);
    }
  };

  return (
    <main className="container py-16">
  <h1 className="text-4xl">Contact</h1>
  <p className="mt-3 text-ink/70 max-w-prose">Tell us a bit about your business…</p>

  <form /* your existing submit handler */ className="card p-6 mt-8 space-y-4">
    {/* inputs ... */}
    <button className="btn btn-primary">Send</button>
  </form>
</main>
  );
}
