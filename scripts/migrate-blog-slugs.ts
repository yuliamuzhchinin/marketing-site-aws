/**
 * scripts/migrate-blog-slugs.ts
 *
 * One-time migration: adds `slug`, `published`, and `excerpt`
 * to all existing blog posts in DynamoDB.
 *
 * Usage:
 *   BLOG_TABLE=your-table-name npx ts-node scripts/migrate-blog-slugs.ts
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const BLOG_TABLE = process.env.BLOG_TABLE;

if (!BLOG_TABLE) {
  throw new Error("BLOG_TABLE environment variable must be set");
}

// -------------------------------------------------------
// Slugify: turns "5 Google Ads Tips!" → "5-google-ads-tips"
// -------------------------------------------------------
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")   // remove special chars
    .replace(/\s+/g, "-")           // spaces → hyphens
    .replace(/-+/g, "-")            // collapse multiple hyphens
    .trim();
}

// -------------------------------------------------------
// Derive a short excerpt from the post's HTML content
// -------------------------------------------------------
function excerptFromHtml(html: string, maxLength = 160): string {
  // Strip all HTML tags, collapse whitespace
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

// -------------------------------------------------------
// Main
// -------------------------------------------------------
async function migrate() {
  console.log(`\n📦 Scanning table: ${BLOG_TABLE}\n`);

  const scan = await client.send(new ScanCommand({ TableName: BLOG_TABLE }));
  const posts = scan.Items ?? [];

  console.log(`Found ${posts.length} post(s)\n`);

  for (const post of posts) {
    const alreadyMigrated = typeof post.slug === "string" && post.slug.length > 0;

    if (alreadyMigrated) {
      console.log(`⏭️  Skipping "${post.title}" — already has slug: "${post.slug}"`);
      continue;
    }

    const slug = slugify(post.title ?? post.id);
    const excerpt = post.excerpt ?? excerptFromHtml(post.html ?? "");

    console.log(`✏️  Migrating: "${post.title}"`);
    console.log(`   slug    → "${slug}"`);
    console.log(`   excerpt → "${excerpt.slice(0, 60)}..."`);

    await client.send(
      new UpdateCommand({
        TableName: BLOG_TABLE,
        Key: { id: post.id },
        UpdateExpression:
          "SET #slug = :slug, #published = :published, #excerpt = :excerpt",
        // Use ExpressionAttributeNames to avoid reserved word conflicts
        ExpressionAttributeNames: {
          "#slug": "slug",
          "#published": "published",
          "#excerpt": "excerpt",
        },
        ExpressionAttributeValues: {
          ":slug": slug,
          ":published": true,
          ":excerpt": excerpt,
        },
        // Safety: only update if slug doesn't already exist
        ConditionExpression: "attribute_not_exists(#slug)",
      })
    );

    console.log(`   ✅ Done\n`);
  }

  console.log("🎉 Migration complete!\n");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});