"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBooking } from "@/components/BookingContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Work With Us" },
  { href: "/plans", label: "Plans" }
  
];

export default function Nav() {
  const path = usePathname();
  const { open } = useBooking();

  return (
    <nav className="border-b border-white/10">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-xl tracking-wide">TRENDNEST MEDIA</Link>

        <ul className="hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`hover:text-ink ${path === l.href ? "text-ink" : "text-ink/70"}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <button onClick={open} className="btn btn-primary">Book a Call</button>
      </div>
    </nav>
  );
}
