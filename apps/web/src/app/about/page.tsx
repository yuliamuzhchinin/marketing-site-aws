"use client";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useBooking } from "@/components/BookingContext";

export default function AboutClient() {
  const { open } = useBooking();

  return (
    <>
      <Nav />

      <main className="container py-16 md:py-24">
        {/* Intro */}
        <section className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-[var(--font-serif)]">About TrendNest Media</h1>
          <p className="mt-4 text-white/70">
            We’re a dedicated team of digital marketing specialists helping local businesses
            grow through effective strategy, creative design, and data-driven execution.
          </p>
        </section>

        {/* Team philosophy */}
        <section className="mt-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-[var(--font-serif)]">A Team That Works as One</h2>
            <p className="mt-4 text-white/70">
              Our specialists cover <strong>social media</strong>, <strong>SEO</strong>,{" "}
              <strong>Google Ads</strong>, and <strong>web development</strong>—collaborating
              end-to-end to deliver the right solution for your goals and budget.
            </p>
            <p className="mt-4 text-white/70">
              From discovery to launch, we align on strategy, execute quickly, and
              measure what matters: calls, bookings, and growth.
            </p>
          </div>

          <div className="card overflow-hidden">
            <Image
              src="/team-meeting.jpg"  // add this to /public
              alt="TrendNest Media team collaborating"
              width={1200}
              height={800}
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Mission + CTA */}
        <section className="mt-20 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-[var(--font-serif)]">Our Mission</h2>
          <p className="mt-4 text-white/70">
            Give small and local businesses the same quality marketing and web presence
            big brands rely on—without the complexity or inflated costs.
          </p>
        </section>

        <section className="mt-20 text-center">
          <div className="hr my-10" />
          <h2 className="text-3xl font-[var(--font-serif)]">Let’s Build Your Success Story</h2>
          <p className="mt-3 text-white/70 max-w-2xl mx-auto">
            Ready to grow? Book a free discovery call and we’ll outline a plan for you.
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
