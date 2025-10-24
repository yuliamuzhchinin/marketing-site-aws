"use client";
import React, { useState } from "react";

export default function ContactPage() {
  return (
    <main className="container py-16">
      <h1 className="text-4xl font-[var(--font-serif)]">Contact</h1>
      <p className="mt-3 text-white/70 max-w-prose">
        Prefer a quick call? Use the “Book a Call” button at the top right to save your details
        and pick a time instantly. You can also email us at <strong>hello@trendnestmedia.com</strong>.
      </p>
    </main>
  );
}

