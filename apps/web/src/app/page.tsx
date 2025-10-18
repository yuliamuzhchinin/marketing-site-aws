import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />

      {/* HERO */}
      <header className="container py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: portrait card */}
          <div className="card overflow-hidden">
            <Image
              src="/hero-portrait.jpg" // add this image to /public
              alt="Founder portrait"
              width={900}
              height={1100}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* Right: copy on dark */}
          <div className="p-2 md:p-4">
            <p className="uppercase text-xs tracking-[0.2em] text-ink/60">
              Hello, my name is <span className="text-ink">Lora</span>
            </p>
            <h1 className="mt-3 text-4xl md:text-5xl leading-tight">
              Social Media Branding Strategist <span className="italic">for Entrepreneurs</span>
            </h1>
            <p className="mt-5 text-ink/70 max-w-prose">
              We craft elegant brands and performance campaigns that make small businesses unforgettable.
              Stand out from the crowd with strategy, content, and ads that actually convert.
            </p>
            <div className="mt-8 flex gap-3">
              <a href="/guide.pdf" className="btn btn-primary">Download My Free Guide</a>
              <a href="/contact" className="btn btn-ghost">Contact</a>
            </div>
          </div>
        </div>
      </header>

      {/* INTRO SPLIT (light on dark) */}
      <section className="container mt-6">
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <div className="card-light p-8 md:p-10">
            <h2 className="text-3xl">Together, We’ll Make <span className="italic">your</span> Brand Shine</h2>
            <p className="mt-4 text-canvas/80">
              In today’s digital world, social media has become an essential platform for businesses to connect with
              their audience. We specialize in clear strategy, elevated visuals, and effective ads built for local results.
            </p>
            <a href="/contact" className="btn btn-primary mt-6 inline-flex">Book a Call</a>
          </div>
          <div className="card overflow-hidden">
            <Image
              src="/livingroom.jpg" // add to /public
              alt="Styled living room"
              width={1200}
              height={900}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="container mt-16">
        <div className="text-center px-2">
          <div className="text-sand text-2xl">★★★★★</div>
          <blockquote className="mt-6 text-2xl md:text-[28px] leading-relaxed text-ink/90 font-serif italic">
            “Working with Solstice has been a game-changer for our social media presence.
            Their expertise in branding and understanding of our target audience truly
            transformed our online identity.”
          </blockquote>
          <p className="mt-4 text-ink/60 text-sm tracking-wideish uppercase">— Sarah M., CEO Fashion Boutique</p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="container mt-16">
        <h2 className="text-3xl">Work with Me</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="font-serif text-xl">Google Ads</h3>
            <p className="mt-2 text-ink/70">High-intent Local & Search campaigns focused on calls and bookings.</p>
          </div>
          <div className="card p-6">
            <h3 className="font-serif text-xl">Social Media</h3>
            <p className="mt-2 text-ink/70">Content, creative, and paid social that build trust and awareness.</p>
          </div>
          <div className="card p-6">
            <h3 className="font-serif text-xl">Brand & Strategy</h3>
            <p className="mt-2 text-ink/70">Messaging, visuals, and positioning that clarify your value.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mt-16 mb-20 text-center">
        <div className="hr my-10"></div>
        <h2 className="text-3xl">Ready to grow?</h2>
        <p className="mt-3 text-ink/70 max-w-2xl mx-auto">
          Book a free 20-minute strategy call. We’ll show you how to get more local customers.
        </p>
        <a href="/contact" className="btn btn-primary mt-6">Book a Call</a>
      </section>

      <Footer />
    </>
  );
}
