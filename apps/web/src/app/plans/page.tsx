"use client"
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

import { useBooking } from "@/components/BookingContext";



function Check() {
  return <span aria-hidden className="text-[#CBB79A]">✓</span>;
}

export default function PlansPage() {
   const { open } = useBooking();
  return (
    <>
      <Nav />

      <main className="container py-14 md:py-20">
        <header className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl leading-tight font-[var(--font-serif)]">Plans & Pricing</h1>
          <p className="mt-4 text-white/70">
            Clear, flexible plans designed for local businesses. No long-term contracts—upgrade or pause any time.
          </p>
        </header>

        {/* Pricing grid */}
        <section className="mt-10 grid md:grid-cols-3 gap-6 items-stretch">
          {/* Starter */}
          <div className="card p-6 flex flex-col">
            <h2 className="text-xl font-[var(--font-serif)]">Starter</h2>
            <p className="mt-1 text-white/60 text-sm">For new businesses getting online</p>
            <div className="mt-4 text-3xl font-semibold">$399<span className="text-base font-normal text-white/60">/mo</span></div>

            <ul className="mt-6 space-y-2 text-white/80 text-sm">
              <li><Check /> Social media: 6 posts/mo</li>
              <li><Check /> Basic Google Business Profile</li>
              <li><Check /> On-page SEO essentials</li>
              <li><Check /> Basic website updates</li>
              <li><Check /> Monthly performance summary</li>
            </ul>

            <a href="/contact" className="btn btn-primary mt-auto">Get Started</a>
          </div>

          {/* Growth (highlight) */}
          <div className="card-light p-6 text-[#0F0F10] flex flex-col ring-2 ring-[#CBB79A]">
            <h2 className="text-xl font-[var(--font-serif)]">Growth</h2>
            <p className="mt-1 text-black/60 text-sm">Best for steady lead generation</p>
            <div className="mt-4 text-3xl font-semibold">$899<span className="text-base font-normal text-black/60">/mo</span></div>

            <ul className="mt-6 space-y-2 text-black/80 text-sm">
              <li><Check /> Social media: 12 posts/mo</li>
              <li><Check /> Google Ads (Search/Local) management</li>
              <li><Check /> Conversion tracking & reports</li>
              <li><Check /> SEO improvements & content suggestions</li>
              <li><Check /> Website updates & speed checks</li>
              <li><Check /> Priority support</li>
            </ul>

            <a href="/contact" className="btn btn-primary mt-auto">Choose Growth</a>
          </div>

          {/* Pro */}
          <div className="card p-6 flex flex-col">
            <h2 className="text-xl font-[var(--font-serif)]">Pro</h2>
            <p className="mt-1 text-white/60 text-sm">For aggressive growth & custom needs</p>
            <div className="mt-4 text-3xl font-semibold">$1,799<span className="text-base font-normal text-white/60">/mo</span></div>

            <ul className="mt-6 space-y-2 text-white/80 text-sm">
              <li><Check /> Social media: 20 posts/mo + boosts</li>
              <li><Check /> Google Ads & retargeting</li>
              <li><Check /> Local SEO & content plan</li>
              <li><Check /> Landing pages & A/B tests</li>
              <li><Check /> Advanced analytics dashboard</li>
              <li><Check /> Dedicated strategist</li>
            </ul>

            <a href="/contact" className="btn btn-primary mt-auto">Go Pro</a>
          </div>
        </section>

        {/* Guarantee / FAQ mini */}
        <section className="mt-14 grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-[var(--font-serif)]">Simple, Flexible, Transparent</h3>
            <p className="mt-2 text-white/70">
              No long-term contracts. Pause or change plans any time. We’ll recommend the plan that fits your goals and budget.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-[var(--font-serif)]">What’s the right plan for me?</h3>
            <p className="mt-2 text-white/70">
              New businesses love <strong>Starter</strong>. If you want steady leads, choose <strong>Growth</strong>.
              Need advanced campaigns and testing? Go <strong>Pro</strong>.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-12 text-center">
          <div className="hr my-8" />
          <h2 className="text-3xl font-[var(--font-serif)]">Have questions?</h2>
          <p className="mt-3 text-white/70 max-w-2xl mx-auto">
            Book a free discovery call. We’ll review your goals and suggest the best plan.
          </p>
          <button onClick={open} className="btn btn-primary mt-6">
            Book Your Free Discovery Call
          </button>
        </section>
      </main>

      <Footer />
    </>
  );
}
