import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Blog — TrendNest Media",
  description: "Tips on SEO, websites, and automations for local businesses.",
};

// Explicitly tell Next this page is static
export const dynamic = "force-static";

type Post = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  publishedAt: string;
};

async function fetchPosts(): Promise<Post[]> {
  const api = process.env.NEXT_PUBLIC_API_URL;

  // If API URL isn't set at build time, just return empty list
  if (!api) return [];

  // ❌ no more { cache: "no-store" }
  // This will be treated as a static fetch at build time
  const res = await fetch(`${api}/blog`);

  if (!res.ok) return [];

  const data = await res.json();
  return data.items ?? [];
}

export default async function BlogPage() {
  const posts = await fetchPosts();

  return (
    <>
      <Nav />
      <main className="container py-16 md:py-24">
        <h1 className="text-4xl font-[var(--font-serif)]">Learn From Us</h1>
        <p className="mt-3 text-white/70">
          Practical tips for getting found online.
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <a
              key={p.id}
              href={`/blog/${p.id}`}
              className="card overflow-hidden block"
            >
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-full h-44 object-cover"
                />
              )}
              <div className="p-5">
                <h2 className="text-xl font-[var(--font-serif)]">
                  {p.title}
                </h2>
                {p.subtitle && (
                  <p className="mt-1 text-white/70 text-sm">{p.subtitle}</p>
                )}
                <p className="mt-2 text-xs text-white/50">
                  {new Date(p.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </a>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}