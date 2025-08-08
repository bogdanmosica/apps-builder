#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import * as cheerio from "cheerio";
import fetch from "node-fetch";

interface DocsResult {
  title: string;
  content: string;
  url: string;
  source: string;
}

interface DocumentationSource {
  name: string;
  baseUrl: string;
  searchPaths: string[];
  urlPatterns: {
    [key: string]: string;
  };
}

class OnlineDocsServer {
  private server: Server;
  private docSources: Map<string, DocumentationSource> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: "online-docs-mcp",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupDocSources();
    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
      // Don't crash on errors, just log them
    };

    process.on("SIGINT", async () => {
      try {
        await this.server.close();
      } catch (error) {
        console.error("Error closing server:", error);
      }
      process.exit(0);
    });

    process.on("uncaughtException", (error) => {
      console.error("Uncaught exception:", error);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled rejection at:", promise, "reason:", reason);
    });
  }

  private setupDocSources() {
    // React Documentation
    this.docSources.set("react", {
      name: "React",
      baseUrl: "https://react.dev",
      searchPaths: ["learn", "reference"],
      urlPatterns: {
        hooks: "/reference/react/{query}",
        components: "/reference/react-dom/components/{query}",
        learn: "/learn/{query}",
        reference: "/reference/react/{query}",
      },
    });

    // Next.js Documentation
    this.docSources.set("nextjs", {
      name: "Next.js",
      baseUrl: "https://nextjs.org/docs",
      searchPaths: ["app", "pages", "api-reference"],
      urlPatterns: {
        app: "/app/{query}",
        pages: "/pages/{query}",
        api: "/api-reference/{query}",
        routing: "/app/building-your-application/routing/{query}",
        "data-fetching": "/app/building-your-application/data-fetching/{query}",
      },
    });

    // TypeScript Documentation
    this.docSources.set("typescript", {
      name: "TypeScript",
      baseUrl: "https://www.typescriptlang.org/docs",
      searchPaths: ["handbook", "reference"],
      urlPatterns: {
        handbook: "/handbook/{query}",
        reference: "/reference/{query}",
        config: "/tsconfig/{query}",
      },
    });

    // Tailwind CSS Documentation
    this.docSources.set("tailwind", {
      name: "Tailwind CSS",
      baseUrl: "https://tailwindcss.com/docs",
      searchPaths: ["installation", "components", "utilities"],
      urlPatterns: {
        utilities: "/{query}",
        components: "/components/{query}",
        config: "/configuration/{query}",
      },
    });

    // Vercel Documentation
    this.docSources.set("vercel", {
      name: "Vercel",
      baseUrl: "https://vercel.com/docs",
      searchPaths: ["concepts", "functions", "deployments"],
      urlPatterns: {
        concepts: "/concepts/{query}",
        functions: "/functions/{query}",
        deployments: "/deployments/{query}",
      },
    });

    // TanStack Query Documentation
    this.docSources.set("tanstack-query", {
      name: "TanStack Query",
      baseUrl: "https://tanstack.com/query/v5/docs",
      searchPaths: ["framework", "reference", "examples"],
      urlPatterns: {
        guides: "/framework/react/guides/{query}",
        reference: "/framework/react/reference/{query}",
        examples: "/examples/{query}",
        overview: "/framework/react/overview/{query}",
        blog: "/framework/react/community/tkdodos-blog/{query}",
      },
    });

    // Turborepo Documentation
    this.docSources.set("turborepo", {
      name: "Turborepo",
      baseUrl: "https://turbo.build/repo/docs",
      searchPaths: ["guides", "reference", "handbook", "core-concepts"],
      urlPatterns: {
        guides: "/guides/{query}",
        handbook: "/handbook/{query}",
        reference: "/reference/{query}",
        "core-concepts": "/core-concepts/{query}",
        getting_started: "/getting-started/{query}",
      },
    });

    // shadcn/ui Documentation
    this.docSources.set("shadcn-ui", {
      name: "shadcn/ui",
      baseUrl: "https://ui.shadcn.com/docs",
      searchPaths: ["components", "installation", "theming", "monorepo"],
      urlPatterns: {
        components: "/components/{query}",
        installation: "/installation/{query}",
        theming: "/theming/{query}",
        examples: "/examples/{query}",
        charts: "/charts/{query}",
        monorepo: "/monorepo/{query}",
      },
    });

    // PostgreSQL Documentation
    this.docSources.set("postgresql", {
      name: "PostgreSQL",
      baseUrl: "https://www.postgresql.org/docs/current",
      searchPaths: ["sql", "functions", "admin"],
      urlPatterns: {
        sql: "/sql-{query}.html",
        functions: "/functions-{query}.html",
        reference: "/{query}.html",
        tutorial: "/tutorial-{query}.html",
        admin: "/admin-{query}.html",
      },
    });

    // Drizzle ORM Documentation
    this.docSources.set("drizzle", {
      name: "Drizzle ORM",
      baseUrl: "https://orm.drizzle.team/docs",
      searchPaths: ["get-started", "sql-schema-declaration", "queries"],
      urlPatterns: {
        schema: "/sql-schema-declaration/{query}",
        queries: "/queries/{query}",
        migrations: "/migrations/{query}",
        "get-started": "/get-started/{query}",
        performance: "/performance/{query}",
      },
    });

    // Stripe Documentation
    this.docSources.set("stripe", {
      name: "Stripe",
      baseUrl: "https://docs.stripe.com",
      searchPaths: ["api", "payments", "billing", "connect"],
      urlPatterns: {
        api: "/api/{query}",
        payments: "/payments/{query}",
        billing: "/billing/{query}",
        connect: "/connect/{query}",
        checkout: "/checkout/{query}",
        webhooks: "/webhooks/{query}",
      },
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "fetch_docs",
            description:
              "Fetch content from online documentation pages (React, Next.js, TypeScript, Tailwind, Vercel, TanStack Query, Turborepo, shadcn/ui, PostgreSQL, Drizzle ORM, Stripe)",
            inputSchema: {
              type: "object",
              properties: {
                source: {
                  type: "string",
                  description: "Documentation source",
                  enum: [
                    "react",
                    "nextjs",
                    "typescript",
                    "tailwind",
                    "vercel",
                    "tanstack-query",
                    "turborepo",
                    "shadcn-ui",
                    "postgresql",
                    "drizzle",
                    "stripe",
                  ],
                },
                query: {
                  type: "string",
                  description:
                    "Search query or specific page path (e.g., 'hooks', 'useState', 'routing')",
                },
                section: {
                  type: "string",
                  description: "Specific section to search in (optional)",
                },
              },
              required: ["source", "query"],
            },
          },
          {
            name: "search_docs",
            description: "Search across multiple documentation sources",
            inputSchema: {
              type: "object",
              properties: {
                searchTerm: {
                  type: "string",
                  description: "Term to search for in documentation",
                },
                sources: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: [
                      "react",
                      "nextjs",
                      "typescript",
                      "tailwind",
                      "vercel",
                      "tanstack-query",
                      "turborepo",
                      "shadcn-ui",
                      "postgresql",
                      "drizzle",
                      "stripe",
                    ],
                  },
                  description:
                    "Documentation sources to search (optional, defaults to all)",
                },
                limit: {
                  type: "number",
                  description:
                    "Maximum number of results to return (default: 5)",
                  minimum: 1,
                  maximum: 20,
                },
              },
              required: ["searchTerm"],
            },
          },
          {
            name: "list_doc_sources",
            description:
              "List all available documentation sources and their sections",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!args) {
        throw new McpError(ErrorCode.InvalidParams, "Arguments are required");
      }

      try {
        if (name === "fetch_docs") {
          const result = await this.fetchDocs(
            args.source as string,
            args.query as string,
            args.section as string,
          );
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } else if (name === "search_docs") {
          const results = await this.searchDocs(
            args.searchTerm as string,
            (args.sources as string[]) || [
              "react",
              "nextjs",
              "typescript",
              "tailwind",
              "vercel",
              "tanstack-query",
              "turborepo",
              "shadcn-ui",
              "postgresql",
              "drizzle",
              "stripe",
            ],
            (args.limit as number) || 5,
          );
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(results, null, 2),
              },
            ],
          };
        } else if (name === "list_doc_sources") {
          const sources = this.listDocSources();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(sources, null, 2),
              },
            ],
          };
        } else {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${errorMessage}`,
        );
      }
    });
  }

  private listDocSources() {
    const sources: Record<string, unknown> = {};

    for (const [key, source] of this.docSources.entries()) {
      sources[key] = {
        name: source.name,
        baseUrl: source.baseUrl,
        sections: Object.keys(source.urlPatterns),
        searchPaths: source.searchPaths,
      };
    }

    return {
      availableSources: sources,
      totalSources: this.docSources.size,
    };
  }

  private async fetchDocs(
    sourceName: string,
    query: string,
    section?: string,
  ): Promise<DocsResult> {
    const source = this.docSources.get(sourceName);
    if (!source) {
      throw new Error(`Unknown documentation source: ${sourceName}`);
    }
    let url: string;

    // Construct URL based on query and section
    if (section && source.urlPatterns[section]) {
      url =
        source.baseUrl + source.urlPatterns[section].replace("{query}", query);
    } else {
      // Smart URL construction based on source patterns
      const patterns = Object.entries(source.urlPatterns);
      let matchedPattern = patterns[0]; // Default to first pattern

      // Try to find best matching pattern
      for (const [key, pattern] of patterns) {
        if (
          query.toLowerCase().includes(key.toLowerCase()) ||
          key.toLowerCase().includes(query.toLowerCase())
        ) {
          matchedPattern = [key, pattern];
          break;
        }
      }

      const pattern =
        matchedPattern?.[1] ||
        Object.values(source.urlPatterns)[0] ||
        "/{query}";
      url = source.baseUrl + pattern.replace("{query}", query);
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        // Try alternative patterns for the same source
        for (const [, pattern] of Object.entries(source.urlPatterns)) {
          const altUrl = source.baseUrl + pattern.replace("{query}", query);
          const altResponse = await fetch(altUrl);
          if (altResponse.ok) {
            const html = await altResponse.text();
            return this.parseDocsContent(html, altUrl, source.name);
          }
        }

        throw new Error(
          `Failed to fetch ${source.name} docs for "${query}". Status: ${response.status}`,
        );
      }

      const html = await response.text();
      return this.parseDocsContent(html, url, source.name);
    } catch (error) {
      throw new Error(
        `Error fetching ${source.name} docs: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async searchDocs(
    searchTerm: string,
    sources: string[],
    limit: number,
  ): Promise<DocsResult[]> {
    const results: DocsResult[] = [];

    for (const sourceName of sources) {
      if (results.length >= limit) break;

      const source = this.docSources.get(sourceName);
      if (!source) continue;

      // Search through common patterns for each source
      const searchQueries = this.getSearchQueriesForTerm(searchTerm, source);

      for (const query of searchQueries) {
        if (results.length >= limit) break;

        try {
          const result = await this.fetchDocs(sourceName, query);
          if (result.content.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push(result);
          }
        } catch {}
      }
    }

    return results;
  }

  private getSearchQueriesForTerm(
    searchTerm: string,
    source: DocumentationSource,
  ): string[] {
    const queries: string[] = [];
    const lowerTerm = searchTerm.toLowerCase();

    // Add the search term itself
    queries.push(searchTerm);

    // Add queries based on source-specific patterns
    if (source.name === "React") {
      if (lowerTerm.includes("hook") || lowerTerm.startsWith("use")) {
        queries.push("hooks", searchTerm.replace(/^use/, "").toLowerCase());
      }
      if (lowerTerm.includes("component")) {
        queries.push("components");
      }
    } else if (source.name === "Next.js") {
      if (lowerTerm.includes("route") || lowerTerm.includes("router")) {
        queries.push("routing");
      }
      if (lowerTerm.includes("data") || lowerTerm.includes("fetch")) {
        queries.push("data-fetching");
      }
    } else if (source.name === "TanStack Query") {
      if (
        lowerTerm.startsWith("use") &&
        (lowerTerm.includes("query") || lowerTerm.includes("mutation"))
      ) {
        // API reference for hooks like useQuery, useMutation
        queries.push(searchTerm);
      }
      if (lowerTerm.includes("key") || lowerTerm.includes("keys")) {
        queries.push("query-keys");
      }
      if (lowerTerm.includes("cache") || lowerTerm.includes("caching")) {
        queries.push("caching");
      }
      if (lowerTerm.includes("mutation")) {
        queries.push("mutations");
      }
    } else if (source.name === "Turborepo") {
      if (lowerTerm.includes("cache") || lowerTerm.includes("caching")) {
        queries.push("caching");
      }
      if (lowerTerm.includes("task") || lowerTerm.includes("script")) {
        queries.push("running-tasks");
      }
      if (lowerTerm.includes("config")) {
        queries.push("configuration");
      }
    } else if (source.name === "shadcn/ui") {
      if (
        lowerTerm.includes("component") ||
        lowerTerm.includes("button") ||
        lowerTerm.includes("input") ||
        lowerTerm.includes("dialog") ||
        lowerTerm.includes("card") ||
        lowerTerm.includes("dropdown")
      ) {
        // Search for UI components
        queries.push(searchTerm.toLowerCase());
      }
      if (lowerTerm.includes("install") || lowerTerm.includes("setup")) {
        queries.push("installation");
      }
      if (
        lowerTerm.includes("theme") ||
        lowerTerm.includes("dark") ||
        lowerTerm.includes("color")
      ) {
        queries.push("theming");
      }
      if (lowerTerm.includes("monorepo") || lowerTerm.includes("workspace")) {
        queries.push("turborepo");
      }
    } else if (source.name === "PostgreSQL") {
      if (
        lowerTerm.includes("select") ||
        lowerTerm.includes("insert") ||
        lowerTerm.includes("update") ||
        lowerTerm.includes("delete")
      ) {
        queries.push(searchTerm.toLowerCase());
      }
      if (
        lowerTerm.includes("index") ||
        lowerTerm.includes("table") ||
        lowerTerm.includes("constraint")
      ) {
        queries.push(searchTerm.toLowerCase());
      }
      if (lowerTerm.includes("function") || lowerTerm.includes("aggregate")) {
        queries.push("functions");
      }
    } else if (source.name === "Drizzle ORM") {
      if (
        lowerTerm.includes("schema") ||
        lowerTerm.includes("table") ||
        lowerTerm.includes("column")
      ) {
        queries.push(searchTerm.toLowerCase());
      }
      if (
        lowerTerm.includes("query") ||
        lowerTerm.includes("select") ||
        lowerTerm.includes("insert")
      ) {
        queries.push(searchTerm.toLowerCase());
      }
      if (lowerTerm.includes("migration") || lowerTerm.includes("migrate")) {
        queries.push("migrations");
      }
      if (lowerTerm.includes("relation") || lowerTerm.includes("join")) {
        queries.push("relations");
      }
    } else if (source.name === "Stripe") {
      if (
        lowerTerm.includes("payment") ||
        lowerTerm.includes("charge") ||
        lowerTerm.includes("intent")
      ) {
        queries.push("payment_intents", "charges");
      }
      if (lowerTerm.includes("subscription") || lowerTerm.includes("billing")) {
        queries.push("subscriptions", "billing");
      }
      if (lowerTerm.includes("webhook") || lowerTerm.includes("event")) {
        queries.push("webhooks");
      }
      if (lowerTerm.includes("customer") || lowerTerm.includes("account")) {
        queries.push("customers");
      }
      if (lowerTerm.includes("checkout") || lowerTerm.includes("session")) {
        queries.push("checkout");
      }
    }

    return queries.slice(0, 3); // Limit queries per source
  }

  private parseDocsContent(
    html: string,
    url: string,
    source: string,
  ): DocsResult {
    const $ = cheerio.load(html);

    // Extract title
    const title =
      $("h1").first().text().trim() ||
      $("title").text().trim() ||
      `${source} Documentation`;

    // Extract main content
    const mainContent = $("main").first();
    let content = "";

    if (mainContent.length) {
      // Remove navigation and other non-content elements
      mainContent.find("nav, .sidebar, .toc, .breadcrumbs").remove();

      // Extract text content while preserving some structure
      content = mainContent
        .find("p, h1, h2, h3, h4, h5, h6, li, code, pre")
        .map((_, el) => {
          const $el = $(el);
          const tagName = el.tagName.toLowerCase();
          const text = $el.text().trim();

          if (tagName.startsWith("h")) {
            return `\n## ${text}\n`;
          } else if (tagName === "code") {
            return `\`${text}\``;
          } else if (tagName === "pre") {
            return `\n\`\`\`\n${text}\n\`\`\`\n`;
          } else if (tagName === "li") {
            return `- ${text}`;
          }
          return text;
        })
        .get()
        .join("\n")
        .replace(/\n{3,}/g, "\n\n");
    }

    if (!content) {
      content = `${$("body").text().trim().substring(0, 2000)}...`;
    }

    return {
      title,
      content: content || "No content found",
      url,
      source,
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Online Docs MCP server running on stdio");
  }
}

const server = new OnlineDocsServer();
server.run().catch(console.error);
