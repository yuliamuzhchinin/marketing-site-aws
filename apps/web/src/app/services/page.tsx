import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — TrendNest Media",
  description:
    "Social media marketing, Google Ads, SEO, and web development for small and local businesses. Explore our services and see how we can grow your visibility.",
  keywords: [
    "local marketing services",
    "social media management",
    "Google Ads management",
    "local SEO",
    "web design and maintenance",
    "small business marketing"
  ],
};

export default function ServicesPage() {
  return (
    <>
      <Nav />

      <main className="container py-14 md:py-20">
        {/* Header */}
        <header className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl leading-tight font-[var(--font-serif)]">
            Services for Small & Local Businesses
          </h1>
          <p className="mt-4 text-white/70">
            Practical, results-focused marketing: social media, Google Ads, SEO, and a fast, professional website.
            We tailor the mix to your goals and budget.
          </p>
          <div className="mt-6">
            <a href="/plans" className="btn btn-primary">See Plans & Pricing</a>
          </div>
        </header>

        {/* Services grid */}
        <section className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article className="card p-6">
            <h2 className="text-xl font-[var(--font-serif)]">Social Media Marketing</h2>
            <p className="mt-2 text-white/70">
              Consistent content and engagement on Facebook, Instagram, and TikTok.
              We plan, design, post, and report—so your brand stays top-of-mind locally.
            </p>
            <ul className="mt-4 text-sm text-white/70 list-disc pl-5 space-y-1">
              <li>Content calendar & assets</li>
              <li>Caption writing & hashtags</li>
              <li>Community engagement</li>
              <li>Monthly performance report</li>
            </ul>
          </article>

          <article className="card p-6">
            <h2 className="text-xl font-[var(--font-serif)]">Google Ads & Local Campaigns</h2>
            <p className="mt-2 text-white/70">
              High-intent search and Local Ads built to drive calls and bookings. We manage keywords,
              creative, budgets, and conversion tracking.
            </p>
            <ul className="mt-4 text-sm text-white/70 list-disc pl-5 space-y-1">
              <li>Search & Local campaigns</li>
              <li>Keyword research & negatives</li>
              <li>Conversion tracking & reports</li>
              <li>Ongoing optimization</li>
            </ul>
          </article>

          <article className="card p-6">
            <h2 className="text-xl font-[var(--font-serif)]">SEO (Local & On-Page)</h2>
            <p className="mt-2 text-white/70">
              Improve rankings and appear in local searches. We fix technical issues, optimize content,
              and build a strong local profile.
            </p>
            <ul className="mt-4 text-sm text-white/70 list-disc pl-5 space-y-1">
              <li>Google Business Profile optimization</li>
              <li>On-page SEO & site speed</li>
              <li>Content recommendations</li>
              <li>Citations & local signals</li>
            </ul>
          </article>

          <article className="card p-6">
            <h2 className="text-xl font-[var(--font-serif)]">Web Development</h2>
            <p className="mt-2 text-white/70">
              Modern, mobile-first websites that load fast and convert. Built for clarity, speed, and easy updates.
            </p>
            <ul className="mt-4 text-sm text-white/70 list-disc pl-5 space-y-1">
              <li>Design & copywriting</li>
              <li>Conversion-focused pages</li>
              <li>Analytics & call tracking</li>
              <li>Hosting & deployment on AWS</li>
            </ul>
          </article>

          <article className="card p-6">
            <h2 className="text-xl font-[var(--font-serif)]">Website Maintenance</h2>
            <p className="mt-2 text-white/70">
              Keep your site healthy and secure. We handle updates, backups, uptime monitoring,
              and small content changes.
            </p>
            <ul className="mt-4 text-sm text-white/70 list-disc pl-5 space-y-1">
              <li>Monthly updates & patches</li>
              <li>Backups & uptime checks</li>
              <li>Content tweaks & minor fixes</li>
              <li>Security hardening</li>
            </ul>
          </article>

          <article className="card p-6">
            <h2 className="text-xl font-[var(--font-serif)]">Custom Requests</h2>
            <p className="mt-2 text-white/70">
              Need something special? Landing pages, email automation, analytics dashboards, or integrations—
              we’ll scope and build it.
            </p>
            <ul className="mt-4 text-sm text-white/70 list-disc pl-5 space-y-1">
              <li>Lead funnels & landing pages</li>
              <li>Email & CRM automations</li>
              <li>Custom analytics & dashboards</li>
              <li>3rd-party integrations</li>
            </ul>
          </article>
        </section>

        {/* CTA */}
        <section className="mt-12 text-center">
          <div className="hr my-8" />
          <h2 className="text-3xl font-[var(--font-serif)]">See Plans & Pricing</h2>
          <p className="mt-3 text-white/70 max-w-2xl mx-auto">
            Simple plans designed for small businesses. Pick what fits today—upgrade any time.
          </p>
          <a href="/plans" className="btn btn-primary mt-6">See Plans</a>
        </section>
      </main>

      <Footer />
    </>
  );
}
