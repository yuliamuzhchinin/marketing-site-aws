// apps/functions/contact-submit/index.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { randomUUID } from "crypto";

/** --- Clients & env --- */
const ddbDoc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ses = new SESv2Client({ region: process.env.SES_REGION || process.env.AWS_REGION });

const BLOG_TABLE = process.env.BLOG_TABLE!;
const LEADS_TABLE = process.env.LEADS_TABLE!;
const SES_FROM = process.env.SES_FROM!;
const SES_TO = process.env.SES_TO!;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "https://www.trendnestmedia.com,http://localhost:3000";

/** --- Types --- */
type LeadBody = { name?: string; email?: string; phone?: string; message?: string };
type Post = {
  id: string;           // UUID — stays as the DynamoDB partition key
  slug: string;         // "5-google-ads-tips-for-local-businesses" — used in URLs
  title: string;
  subtitle?: string;
  excerpt?: string;     // Short preview shown on the blog listing page
  html: string;
  imageUrl?: string;
  publishedAt: string;  // ISO string
  published: boolean;   // true = live, false = draft
};

/** --- Helpers --- */
function pickAllowOrigin() {
  return ALLOW_ORIGIN.includes(",") ? ALLOW_ORIGIN.split(",")[0] : ALLOW_ORIGIN;
}
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": pickAllowOrigin(),
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
function ok(data: any) {
  return { statusCode: 200, headers: { "Content-Type": "application/json", ...corsHeaders() }, body: JSON.stringify({ ok: true, ...data }) };
}
function bad(status: number, error: string) {
  return { statusCode: status, headers: { "Content-Type": "application/json", ...corsHeaders() }, body: JSON.stringify({ ok: false, error }) };
}
const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

/** --- Handler (HTTP API v2) --- */
export const handler = async (event: any) => {
  const method = event?.requestContext?.http?.method as string;   // "GET" | "POST" | "OPTIONS"
  const path = event?.requestContext?.http?.path as string;       // "/contact", "/blog", "/blog/123"
  const id = event?.pathParameters?.id as string | undefined;

  // Preflight
  if (method === "OPTIONS") return { statusCode: 200, headers: corsHeaders(), body: "" };

  /** ---------------- BLOG ROUTES ---------------- */
  // GET /blog (list)
  if (method === "GET" && path.endsWith("/blog") && !id) {
    const scan = await ddbDoc.send(new ScanCommand({ TableName: BLOG_TABLE }));
    const items = (scan.Items ?? []) as Post[];
    items.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
    return ok({ items });
  }

  // POST /blog (create)  — keep only for internal testing; protect/remove for prod
  if (method === "POST" && path.endsWith("/blog") && !id) {
    const body = JSON.parse(event.body || "{}");
    if (!body?.title || !body?.html) return bad(400, "title and html required");

    const item: Post = {
      id: randomUUID(),
      title: String(body.title).trim(),
      subtitle: body.subtitle?.trim(),
      html: String(body.html),
      imageUrl: body.imageUrl,
      publishedAt: new Date().toISOString(),
    };
    await ddbDoc.send(new PutCommand({ TableName: BLOG_TABLE, Item: item }));
    return ok({ id: item.id });
  }

  // GET /blog/{id}
  if (method === "GET" && id && /\/blog\/[^/]+$/.test(path)) {
    const out = await ddbDoc.send(new GetCommand({ TableName: BLOG_TABLE, Key: { id } }));
    if (!out.Item) return bad(404, "Not found");
    return ok({ item: out.Item });
  }

  /** ---------------- CONTACT ROUTE ---------------- */
  // POST /contact
  if (method === "POST" && path.endsWith("/contact")) {
    if (!event.body) return bad(400, "Missing body");
    const body: LeadBody = JSON.parse(event.body);

    if (!body.name || !body.email || !body.message) return bad(400, "name, email, and message are required");
    if (body.name.length > 120) return bad(400, "Name too long");
    if (!isEmail(body.email)) return bad(400, "Invalid email");
    if (body.message.length > 5000) return bad(400, "Message too long");

    const leadId = "lead_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    const now = new Date().toISOString();
    const msg = body.message ?? "Booking intent via Book Call modal";

    await ddbDoc.send(
      new PutCommand({
        TableName: LEADS_TABLE,
        Item: {
          leadId,
          name: body.name,
          email: body.email,
          phone: body.phone ?? "",
          message: msg,
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
            Subject: { Data: `New lead from ${body.name}` },
            Body: {
              Text: {
                Data: `A new lead was submitted:

Name: ${body.name}
Email: ${body.email}
Phone: ${body.phone ?? ""}

Message:
${body.message}

Lead ID: ${leadId}
Time: ${now}`,
              },
            },
          },
        },
      })
    );
    console.log("SES MessageId:", result.MessageId);
    return ok({ id: leadId });
  }

  /** ---------------- FALLBACK ---------------- */
  return bad(405, "Unsupported route");
};
