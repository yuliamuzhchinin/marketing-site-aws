import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";

type Post = {
  id: string;
  title: string;
  subtitle?: string;
  html: string;
  imageUrl?: string;
  publishedAt: string;
};

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL!;

/** --- Build-time: fetch all IDs for static export --- */
async function fetchAllPosts(): Promise<Post[]> {
  const res = await fetch(`${API}/blog`, { cache: "force-cache" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items ?? []) as Post[];
}

// This is what Next wanted for output: "export"
export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  return posts.map((p) => ({ id: p.id }));
}

/** --- Runtime/build: fetch single post by id --- */
async function fetchPost(id: string): Promise<Post | null> {
  const res = await fetch(`${API}/blog/${id}`, { cache: "force-cache" });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.item ?? null) as Post | null;
}

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const post = await fetchPost(params.id);
  if (!post) return { title: "Post not found — TrendNest Media" };
  return {
    title: `${post.title} — TrendNest Media`,
    description: post.subtitle || "Blog article",
  };
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const post = await fetchPost(params.id);
  if (!post) return notFound();

  return (
    <>
      <Nav />
      <main className="container py-16 md:py-24">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-[var(--font-serif)]">{post.title}</h1>
          {post.subtitle && <p className="mt-2 text-white/70">{post.subtitle}</p>}
          <p className="mt-2 text-xs text-white/50">
            {new Date(post.publishedAt).toLocaleDateString()}
          </p>

          {post.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt={post.title}
              className="mt-6 w-full rounded-lg object-cover"
            />
          )}

          <div
            className="prose prose-invert mt-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
