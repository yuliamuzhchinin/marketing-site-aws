"use client";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useBooking } from "@/components/BookingContext";


function openBooking() {
  // fire the global event Nav listens to
  window.dispatchEvent(new Event("open-booking"));
}

export default function Home() {
  const { open } = useBooking();
  return (
    <>
      <Nav />

      {/* HERO */}
      <header className="container py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: portrait card */}
          <div className="card overflow-hidden">
            <Image
              src="/home_image.jpg"
              alt="Local marketing strategist"
              width={900}
              height={1100}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* Right: copy */}
          <div className="p-2 md:p-4">
            <p className="uppercase text-xs tracking-[0.2em] text-white/60">TrendNest Media</p>
            <h1 className="mt-3 text-4xl md:text-5xl leading-tight font-[var(--font-serif)]">
              Grow Your Local Business with Smarter Digital Marketing
            </h1>
            <p className="mt-5 text-white/70 max-w-prose">
              We help small and local businesses attract more customers through effective{" "}
              <strong>social media</strong>, <strong>Google Ads</strong>, <strong>SEO</strong>, and{" "}
              <strong>website design</strong>. Get more calls, bookings, and visibility—without the guesswork.
            </p>
            <div className="mt-8 flex gap-3">
              {/* keep Services link as-is */}
              <a href="/services" className="btn btn-primary">Our Services</a>
              {/* if you want a secondary "Book" here too, use a button: */}
              {/* <button type="button" className="btn btn-ghost" onClick={openBooking}>Book a Call</button> */}
            </div>
          </div>
        </div>
      </header>

      {/* INTRO SPLIT (light on dark) */}
      <section className="container mt-6">
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <div className="card-light p-8 md:p-10">
            <h2 className="text-3xl font-[var(--font-serif)]">Together, We’ll Make Your Brand Shine</h2>
            <p className="mt-4 text-[#0F0F10]/80">
              TrendNest Media is a small-business marketing agency focused on helping local brands stand out online.
              We blend creative strategy with proven advertising tools—Google & Meta Ads, local SEO, and
              conversion-focused web design—so your business gets seen by the right people at the right time.
            </p>
            <button type="button" onClick={open} className="btn btn-primary mt-6 inline-flex">
              Book a Free Discovery Call
            </button>
          </div>
          <div className="card overflow-hidden">
            <Image
              src="/landscape_home_image.jpg"
              alt="Studio workspace"
              width={1200}
              height={900}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* QUOTE / TESTIMONIAL */}
      <section className="container mt-16 text-center px-2">
        <div className="text-[#CBB79A] text-2xl">★★★★★</div>
        <blockquote className="mt-6 text-2xl md:text-[28px] leading-relaxed text-white/90 font-[var(--font-serif)] italic">
          “TrendNest helped us double our local inquiries within two months. Their Google Ads and website redesign made a huge difference.”
        </blockquote>
        <p className="mt-4 text-white/60 text-sm tracking-[0.02em] uppercase">— Sarah J., Small Business Owner</p>
      </section>

      {/* SERVICES */}
      <section className="container mt-16">
        <h2 className="text-3xl font-[var(--font-serif)]">What We Do</h2>
        <p className="mt-3 text-white/70 max-w-2xl">Digital solutions that help your business grow—built for local results.</p>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="text-xl font-[var(--font-serif)]">Social Media Marketing</h3>
            <p className="mt-2 text-white/70">Build a consistent presence that connects with your audience. We plan content, post, and manage engagement across Facebook, Instagram, and more.</p>
          </div>
          <div className="card p-6">
            <h3 className="text-xl font-[var(--font-serif)]">SEO Optimization</h3>
            <p className="mt-2 text-white/70">Rank higher on Google and reach nearby customers. We improve site structure, speed, and content to drive organic traffic and calls.</p>
          </div>
          <div className="card p-6">
            <h3 className="text-xl font-[var(--font-serif)]">Google Ads & Local Campaigns</h3>
            <p className="mt-2 text-white/70">Maximize your ad spend with targeted Search & Local campaigns optimized for calls and bookings—all tracked and reported clearly.</p>
          </div>
          <div className="card p-6">
            <h3 className="text-xl font-[var(--font-serif)]">Web Development & Maintenance</h3>
            <p className="mt-2 text-white/70">Professional websites that load fast, look great on mobile, and convert visitors into customers. We handle updates, security, and hosting.</p>
          </div>
          <div className="card p-6">
            <h3 className="text-xl font-[var(--font-serif)]">Custom Requests</h3>
            <p className="mt-2 text-white/70">Need a landing page, tracking, or automation? We tailor solutions to your goals and budget.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mt-16 mb-20 text-center">
        <div className="hr my-10" />
        <h2 className="text-3xl font-[var(--font-serif)]">Ready to Grow Your Business?</h2>
        <p className="mt-3 text-white/70 max-w-2xl mx-auto">
          Schedule a free strategy call to see how digital marketing can bring you more customers—and less stress.
        </p>
        <button type="button" onClick={open} className="btn btn-primary mt-6">
          Book Your Call
        </button>
      </section>

      <Footer />
    </>
  );
}
