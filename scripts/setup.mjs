#!/usr/bin/env node

/**
 * ---------------------------------------------------------------------------------
 * This script is for setting up the template and bootstrapping your project locally.
 *
 * You may safely delete this file after you are done preparing your project.
 * Nothing in here is required to run or build your production application!
 *
 * If you wish, remove `scripts/prepare.mjs` and any references to it after first use.
 * ---------------------------------------------------------------------------------
 */

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, readFileSync, writeFileSync } from "fs";
import * as p from "@clack/prompts";
import dotenv from "dotenv";
import contentfulManagement from "contentful-management";

const { createClient } = contentfulManagement;

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const envPath = resolve(rootDir, ".env.local");

// Load .env.local using dotenv
dotenv.config({ path: envPath });

// ============================================
// HELPER: Update .env.local file
// ============================================
function updateEnvFile(key, value) {
  process.env[key] = value;

  let content = existsSync(envPath) ? readFileSync(envPath, "utf-8") : "";
  const regex = new RegExp(`^${key}=.*$`, "m");

  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    if (content && !content.endsWith("\n")) content += "\n";
    content += `${key}=${value}\n`;
  }

  writeFileSync(envPath, content);
}

// ============================================
// Sample data
// ============================================
const sampleArticles = [
  {
    title: "Getting Started with Next.js 16",
    slug: "getting-started-nextjs-16",
    summary:
      "Learn how to build modern web applications with Next.js 16, featuring Cache Components, React Compiler support, and Turbopack.",
    authorName: "Sarah Chen",
    categoryName: "Tutorial",
    details: {
      nodeType: "document",
      data: {},
      content: [
        {
          nodeType: "paragraph",
          data: {},
          content: [
            {
              nodeType: "text",
              value:
                "Next.js 16 represents a significant leap forward in React framework development. With the introduction of Cache Components, developers now have fine-grained control over caching strategies at the component level.",
              marks: [],
              data: {},
            },
          ],
        },
        {
          nodeType: "heading-2",
          data: {},
          content: [{ nodeType: "text", value: "What's New in Next.js 16", marks: [], data: {} }],
        },
        {
          nodeType: "paragraph",
          data: {},
          content: [
            {
              nodeType: "text",
              value:
                "The headline feature is Cache Components, which allow you to define caching behavior per component rather than per page. This enables partial prerendering where static content is served instantly while dynamic content streams in.",
              marks: [],
              data: {},
            },
          ],
        },
        {
          nodeType: "paragraph",
          data: {},
          content: [
            {
              nodeType: "text",
              value:
                "Combined with the React Compiler and Turbopack, you'll experience faster development builds and optimized production bundles without manual memoization.",
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
  },
  {
    title: "Understanding Cache Components",
    slug: "understanding-cache-components",
    summary:
      "Deep dive into Cache Components and learn how to implement efficient caching strategies for content-driven applications.",
    authorName: "Marcus Johnson",
    categoryName: "Deep Dive",
    details: {
      nodeType: "document",
      data: {},
      content: [
        {
          nodeType: "paragraph",
          data: {},
          content: [
            {
              nodeType: "text",
              value:
                "Cache Components solve a fundamental problem in web development: how to serve content fast while keeping it fresh. Traditional approaches force you to choose between static (fast but stale) or dynamic (fresh but slow).",
              marks: [],
              data: {},
            },
          ],
        },
        {
          nodeType: "heading-2",
          data: {},
          content: [{ nodeType: "text", value: "The Power of Cache Tags", marks: [], data: {} }],
        },
        {
          nodeType: "paragraph",
          data: {},
          content: [
            {
              nodeType: "text",
              value:
                'By tagging cached data with identifiers (like Contentful entry IDs), you can invalidate specific cache entries when content changes. This means clicking "Publish" in your CMS immediately updates the live site.',
              marks: [],
              data: {},
            },
          ],
        },
        {
          nodeType: "paragraph",
          data: {},
          content: [
            {
              nodeType: "text",
              value:
                "The best part? You can mix cached and dynamic content on the same page. Article content can be cached while view counters update in real-time.",
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
  },
  {
    title: "Contentful and Next.js: A Perfect Match",
    slug: "contentful-nextjs-perfect-match",
    summary:
      "Discover why Contentful and Next.js work so well together for building scalable, content-driven websites.",
    authorName: "Emily Rodriguez",
    categoryName: "Integration",
    details: {
      nodeType: "document",
      data: {},
      content: [
        {
          nodeType: "paragraph",
          data: {},
          content: [
            {
              nodeType: "text",
              value:
                "Contentful's headless CMS approach pairs naturally with Next.js. Content editors get a powerful, flexible interface while developers maintain full control over the frontend experience.",
              marks: [],
              data: {},
            },
          ],
        },
        {
          nodeType: "heading-2",
          data: {},
          content: [
            { nodeType: "text", value: "Real-Time Updates with Webhooks", marks: [], data: {} },
          ],
        },
        {
          nodeType: "paragraph",
          data: {},
          content: [
            {
              nodeType: "text",
              value:
                "When editors publish content in Contentful, webhooks notify your Next.js application to invalidate the relevant cache. Users always see fresh content without sacrificing performance.",
              marks: [],
              data: {},
            },
          ],
        },
        {
          nodeType: "paragraph",
          data: {},
          content: [
            {
              nodeType: "text",
              value:
                "This architecture scales effortlessly. Whether you have 10 or 10,000 articles, the caching layer ensures consistent, fast delivery from edge locations worldwide.",
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
  },
];

// ============================================
// STEP 1: Collect and validate tokens
// ============================================
async function collectAndValidateTokens() {
  let spaceId = process.env.CONTENTFUL_SPACE_ID;
  let accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  let managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

  while (true) {
    if (!spaceId) {
      p.log.info("Create a space → https://app.contentful.com/spaces/new");
      spaceId = await p.text({
        message: "Space ID",
        placeholder: "e.g. abc123xyz (from URL after /spaces/)",
      });
      if (p.isCancel(spaceId)) process.exit(0);
    }

    if (!accessToken) {
      p.log.info(`Get API keys → https://app.contentful.com/spaces/${spaceId}/api/keys`);
      accessToken = await p.password({
        message: "Content Delivery API token",
        placeholder: "e.g. aBcD1234... (click 'Add API key' if needed)",
      });
      if (p.isCancel(accessToken)) process.exit(0);
    }

    if (!managementToken) {
      p.log.info("Get CMA token → https://app.contentful.com/account/profile/cma_tokens");
      managementToken = await p.password({
        message: "Content Management API token",
        placeholder: "e.g. CFPAT-... (click 'Generate personal token')",
      });
      if (p.isCancel(managementToken)) process.exit(0);
    }

    const spinner = p.spinner();
    spinner.start("Validating tokens...");

    try {
      const client = createClient({ accessToken: managementToken });
      const space = await client.getSpace(spaceId);
      const environment = await space.getEnvironment("master");

      updateEnvFile("CONTENTFUL_SPACE_ID", spaceId);
      updateEnvFile("CONTENTFUL_ACCESS_TOKEN", accessToken);
      updateEnvFile("CONTENTFUL_MANAGEMENT_TOKEN", managementToken);

      spinner.stop("Tokens validated ✓");
      return { client, space, environment };
    } catch (err) {
      spinner.stop("Validation failed");
      const status = err.sys?.status || err.status;

      if (status === 401) {
        p.log.error("Management token is invalid or expired");
        managementToken = null;
      } else if (status === 404) {
        p.log.error("Space not found. Check your Space ID");
        spaceId = null;
      } else if (status === 403) {
        p.log.error("Access denied. Token may not have access to this space");
        managementToken = null;
      } else {
        p.log.error(`Connection failed: ${err.message}`);
      }
    }
  }
}

// ============================================
// STEP 2: Setup content type
// ============================================
const requiredFields = [
  { id: "title", name: "Title", type: "Symbol", required: true },
  { id: "slug", name: "Slug", type: "Symbol", required: true, validations: [{ unique: true }] },
  { id: "summary", name: "Summary", type: "Symbol" },
  { id: "details", name: "Details", type: "RichText" },
  { id: "date", name: "Date", type: "Date" },
  { id: "articleImage", name: "Article Image", type: "Link", linkType: "Asset" },
  { id: "authorName", name: "Author Name", type: "Symbol" },
  { id: "categoryName", name: "Category Name", type: "Symbol" },
];

async function setupContentType(environment) {
  const spinner = p.spinner();

  while (true) {
    try {
      const existing = await environment.getContentType("article");
      const existingIds = existing.fields.map((f) => f.id);
      const missing = requiredFields.filter((f) => !existingIds.includes(f.id));

      if (missing.length === 0) {
        if (!existing.sys.publishedVersion) {
          spinner.start("Publishing content type...");
          await existing.publish();
          spinner.stop("Content type published ✓");
        } else {
          p.log.info("Content type 'article' already exists");
        }
        return;
      }

      p.log.warn(`Missing fields: ${missing.map((f) => f.id).join(", ")}`);
      const shouldDelete = await p.confirm({
        message: "Delete and recreate content type?",
      });

      if (p.isCancel(shouldDelete) || !shouldDelete) {
        p.log.info("Keeping existing content type");
        return;
      }

      spinner.start("Deleting content type...");
      try {
        if (existing.sys.publishedVersion) await existing.unpublish();
        await existing.delete();
        spinner.stop("Deleted ✓");
      } catch (deleteErr) {
        spinner.stop("Delete failed");
        p.log.error(deleteErr.message);
        p.log.warn("There may be entries using this content type. Delete them first.");

        const retry = await p.confirm({ message: "Try again?" });
        if (p.isCancel(retry) || !retry) {
          p.log.info("Keeping existing content type");
          return;
        }
        continue;
      }
    } catch {
      // Content type doesn't exist - create it
      spinner.start("Creating content type...");
      const contentType = await environment.createContentTypeWithId("article", {
        name: "Article",
        displayField: "title",
        description: "Knowledge base article",
        fields: requiredFields,
      });
      await contentType.publish();
      spinner.stop("Content type created ✓");
      return;
    }
  }
}

// ============================================
// STEP 3: Create sample articles
// ============================================
async function createArticles(environment, defaultLocale) {
  for (const article of sampleArticles) {
    while (true) {
      try {
        const existingEntries = await environment.getEntries({
          content_type: "article",
          "fields.slug": article.slug,
        });

        if (existingEntries.items.length > 0) {
          p.log.info(`Article '${article.title}' already exists`);
          break;
        }

        const spinner = p.spinner();
        spinner.start(`Creating '${article.title}'...`);

        const fields = {
          title: { [defaultLocale]: article.title },
          slug: { [defaultLocale]: article.slug },
          summary: { [defaultLocale]: article.summary },
          details: { [defaultLocale]: article.details },
          date: { [defaultLocale]: new Date().toISOString().split("T")[0] },
          authorName: { [defaultLocale]: article.authorName },
          categoryName: { [defaultLocale]: article.categoryName },
        };

        const entry = await environment.createEntry("article", { fields });
        await entry.publish();
        spinner.stop(`Created '${article.title}' ✓`);
        break;
      } catch (err) {
        p.log.error(`Failed to create '${article.title}': ${err.message}`);
        const action = await p.select({
          message: "What to do?",
          options: [
            { value: "retry", label: "Retry" },
            { value: "skip", label: "Skip" },
          ],
        });

        if (p.isCancel(action) || action === "skip") break;
      }
    }
  }
}

// ============================================
// MAIN
// ============================================
async function main() {
  p.intro("🚀 Contentful Setup");

  // Step 1: Tokens
  p.log.step("Step 1: API Tokens");
  const { environment } = await collectAndValidateTokens();

  // Get default locale
  const locales = await environment.getLocales();
  const defaultLocale = locales.items.find((l) => l.default)?.code || "en-US";

  // Step 2: Content type
  p.log.step("Step 2: Content Type");
  await setupContentType(environment);

  // Step 3: Articles
  p.log.step("Step 3: Sample Articles");
  await createArticles(environment, defaultLocale);

  p.outro(`Setup complete! Run 'pnpm dev' to start.`);
}

main().catch((err) => {
  p.log.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
