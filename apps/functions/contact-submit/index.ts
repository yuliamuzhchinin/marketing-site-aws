// apps/functions/contact-submit/index.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { randomUUID } from "crypto";

/** --- Clients & env --- */
const ddbDoc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ses = new SESv2Client({
  region: process.env.SES_REGION || process.env.AWS_REGION,
});

const BLOG_TABLE   = process.env.BLOG_TABLE!;
const LEADS_TABLE  = process.env.LEADS_TABLE!;
const SES_FROM     = process.env.SES_FROM!;
const SES_TO       = process.env.SES_TO!;
const BLOG_API_KEY = process.env.BLOG_API_KEY!;
const ALLOW_ORIGIN =
  process.env.ALLOW_ORIGIN ||
  "https://www.trendnestmedia.com,http://localhost:3000";

/** --- Types --- */
type Post = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  body: string;
  imageUrl?: string;
  publishedAt: string;
  published: boolean;
};

type LeadBody = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

/** --- Helpers --- */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function excerptFromText(text: string, maxLength = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

function pickAllowOrigin() {
  return ALLOW_ORIGIN.includes(",")
    ? ALLOW_ORIGIN.split(",")[0]
    : ALLOW_ORIGIN;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin":  pickAllowOrigin(),
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,x-api-key",
  };
}

function ok(data: object) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
    body: JSON.stringify({ ok: true, ...data }),
  };
}

function bad(status: number, error: string) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
    body: JSON.stringify({ ok: false, error }),
  };
}

const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

/** --- Handler (HTTP API v2) --- */
export const handler = async (event: any) => {
  const method = event?.requestContext?.http?.method as string;
  const path   = event?.requestContext?.http?.path as string;
  const slug   = event?.pathParameters?.slug as string | undefined;

  // ── Preflight ──────────────────────────────────────────────
  if (method === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }

  // ── GET /blog — list published posts ───────────────────────
  if (method === "GET" && path.endsWith("/blog") && !slug) {
    const scan = await ddbDoc.send(
      new ScanCommand({
        TableName: BLOG_TABLE,
        FilterExpression: "#pub = :true",
        ExpressionAttributeNames: { "#pub": "published" },
        ExpressionAttributeValues: { ":true": true },
      })
    );

    const items = (scan.Items ?? []) as Post[];

    items.sort((a, b) =>
      (b.publishedAt || "").localeCompare(a.publishedAt || "")
    );

    const summary = items.map(({ id, slug, title, subtitle, excerpt, imageUrl, publishedAt }) => ({
      id, slug, title, subtitle, excerpt, imageUrl, publishedAt,
    }));

    return ok({ items: summary });
  }

  // ── GET /blog/{slug} — fetch single post by slug ────────────
  if (method === "GET" && slug && /\/blog\/[^/]+$/.test(path)) {
    const result = await ddbDoc.send(
      new QueryCommand({
        TableName: BLOG_TABLE,
        IndexName: "slug-index",
        KeyConditionExpression: "#slug = :slug",
        FilterExpression: "#pub = :true",
        ExpressionAttributeNames: {
          "#slug": "slug",
          "#pub":  "published",
        },
        ExpressionAttributeValues: {
          ":slug": slug,
          ":true": true,
        },
        Limit: 1,
      })
    );

    const post = result.Items?.[0] as Post | undefined;
    if (!post) return bad(404, "Post not found");

    return ok({ item: post });
  }

  // ── POST /blog — create a new post (protected) ──────────────
  if (method === "POST" && path.endsWith("/blog") && !slug) {
    const apiKey =
      event?.headers?.["x-api-key"] || event?.headers?.["X-Api-Key"];

    if (!apiKey || apiKey !== BLOG_API_KEY) {
      return bad(401, "Unauthorized");
    }

    // Use "payload" to avoid conflict with the "body" post field
    const payload = JSON.parse(event.body || "{}");

    if (!payload?.title || !payload?.body) {
      return bad(400, "title and body are required");
    }

    let postSlug = slugify(String(payload.title).trim());

    // Handle slug collisions
    const existing = await ddbDoc.send(
      new QueryCommand({
        TableName: BLOG_TABLE,
        IndexName: "slug-index",
        KeyConditionExpression: "#slug = :slug",
        ExpressionAttributeNames: { "#slug": "slug" },
        ExpressionAttributeValues: { ":slug": postSlug },
        Limit: 1,
      })
    );

    if ((existing.Items?.length ?? 0) > 0) {
      postSlug = `${postSlug}-${Date.now()}`;
    }

    const excerpt =
      payload.excerpt?.trim() ||
      payload.subtitle?.trim() ||
      excerptFromText(String(payload.body));

    const item: Post = {
      id:          randomUUID(),
      slug:        postSlug,
      title:       String(payload.title).trim(),
      subtitle:    payload.subtitle?.trim(),
      excerpt,
      body:        String(payload.body),
      imageUrl:    payload.imageUrl,
      publishedAt: new Date().toISOString(),
      published:   payload.published !== false,
    };

    await ddbDoc.send(
      new PutCommand({ TableName: BLOG_TABLE, Item: item })
    );

    return ok({ id: item.id, slug: item.slug });
  }

  // ── POST /contact ───────────────────────────────────────────
  if (method === "POST" && path.endsWith("/contact")) {
    if (!event.body) return bad(400, "Missing body");

    const contactPayload: LeadBody = JSON.parse(event.body);

    if (!contactPayload.name || !contactPayload.email || !contactPayload.message) {
      return bad(400, "name, email, and message are required");
    }
    if (contactPayload.name.length > 120)    return bad(400, "Name too long");
    if (!isEmail(contactPayload.email))       return bad(400, "Invalid email");
    if (contactPayload.message.length > 5000) return bad(400, "Message too long");

    const leadId =
      "lead_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    const now = new Date().toISOString();

    await ddbDoc.send(
      new PutCommand({
        TableName: LEADS_TABLE,
        Item: {
          leadId,
          name:      contactPayload.name,
          email:     contactPayload.email,
          phone:     contactPayload.phone ?? "",
          message:   contactPayload.message,
          createdAt: now,
        },
      })
    );

    const result = await ses.send(
      new SendEmailCommand({
        FromEmailAddress: SES_FROM,
        Destination: { ToAddresses: [SES_TO] },
        Content: {
          Simple: {
            Subject: { Data: `New lead from ${contactPayload.name}` },
            Body: {
              Text: {
                Data: `A new lead was submitted:\n\nName: ${contactPayload.name}\nEmail: ${contactPayload.email}\nPhone: ${contactPayload.phone ?? ""}\n\nMessage:\n${contactPayload.message}\n\nLead ID: ${leadId}\nTime: ${now}`,
              },
            },
          },
        },
      })
    );

    console.log("SES MessageId:", result.MessageId);
    return ok({ id: leadId });
  }

  /** Fallback */
  return bad(405, "Unsupported route");
};