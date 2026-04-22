// apps/web/src/app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";


export const dynamicParams = false; // allow new slugs without a full rebuild

const API = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL;

if (!API) {
  throw new Error("API_URL or NEXT_PUBLIC_API_URL must be set");
}

type Post = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  body: string;       // plain text / markdown — no HTML
  imageUrl?: string;
  publishedAt?: string;
  published: boolean;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Converts plain text with line breaks into readable paragraphs.
 * Each blank-line-separated block becomes a <p>.
 * Lines starting with "# " or "## " become headings.
 * Lines starting with "- " or "* " become list items.
 */
function renderBody(text: string): string {
  const blocks = text.split(/\n{2,}/); // split on blank lines

  return blocks
    .map((block) => {
      const lines = block.trim().split("\n");

      // Heading 2: ## Title
      if (lines[0].startsWith("## ")) {
        return `<h2>${escapeHtml(lines[0].slice(3))}</h2>`;
      }

      // Heading 3: ### Title
      if (lines[0].startsWith("### ")) {
        return `<h3>${escapeHtml(lines[0].slice(4))}</h3>`;
      }

      // Unordered list: lines starting with - or *
      const isListBlock = lines.every(
        (l) => l.startsWith("- ") || l.startsWith("* ") || l.trim() === ""
      );
      if (isListBlock) {
        const items = lines
          .filter((l) => l.startsWith("- ") || l.startsWith("* "))
          .map((l) => `<li>${escapeHtml(l.slice(2))}</li>`)
          .join("\n");
        return `<ul>${items}</ul>`;
      }

      // Default: paragraph
      const content = lines
        .map((l) => escapeHtml(l))
        .join("<br />");
      return `<p>${content}</p>`;
    })
    .join("\n");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic: *text*
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline link: [text](url)
    .replace(
      /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
}

// ─── Data fetching ───────────────────────────────────────────────────────────

async function fetchPost(slug: string): Promise<Post | null> {
  const res = await fetch(`${API}/blog/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.item as Post;
}

export async function generateStaticParams() {
  const res = await fetch(`${API}/blog`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items ?? []).map((post: Post) => ({ slug: post.slug }));
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) {
    return {
      title: "Post not found — TrendNest Media",
      description: "This post could not be found.",
    };
  }

  return {
    title: `${post.title} — TrendNest Media`,
    description: post.excerpt ?? post.subtitle ?? post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? post.subtitle ?? post.title,
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
      type: "article",
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) {
    return (
      <>
        <Nav />
        <main className="container py-16">
          <h1 className="text-3xl font-[var(--font-serif)] mb-4">
            Post not found
          </h1>
          <Link href="/blog" className="btn btn-primary">
            ← Back to blog
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const renderedBody = renderBody(post.body ?? "");

  return (
    <>
      <Nav />
      <main className="container py-16 max-w-3xl">
        {/* Breadcrumb */}
        <p className="text-sm uppercase text-white/50 tracking-[0.2em]">
          Blog · TrendNest Media
        </p>

        {/* Title */}
        <h1 className="mt-3 text-4xl font-[var(--font-serif)]">
          {post.title}
        </h1>

        {/* Subtitle */}
        {post.subtitle && (
          <p className="mt-3 text-white/70 text-lg">{post.subtitle}</p>
        )}

        {/* Date */}
        {post.publishedAt && (
          <p className="mt-2 text-xs text-white/50">
            Published{" "}
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}

        {/* Hero image */}
        {post.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl}
            alt={post.title}
            className="mt-8 w-full rounded-xl object-cover max-h-96"
          />
        )}

        {/* Body */}
        <article
          className="
            prose prose-invert
            max-w-none
            mt-8
            prose-headings:font-[var(--font-serif)]
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-[15px] prose-p:leading-relaxed prose-p:mt-3 prose-p:mb-3
            prose-ul:mt-3 prose-ul:mb-4 prose-li:mt-1
            prose-strong:text-white
            prose-a:text-[#CBB79A] prose-a:underline
          "
          dangerouslySetInnerHTML={{ __html: renderedBody }}
        />

        {/* Back link */}
        <div className="mt-12">
          <Link href="/blog" className="btn btn-ghost">
            ← Back to all articles
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}