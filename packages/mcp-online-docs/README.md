# MCP Online Docs Server

A Model Context Protocol (MCP) server that provides comprehensive access to multiple online documentation sources for modern web development.

## Overview

This MCP server enables AI assistants and developers to fetch real-time documentation from popular web development frameworks and tools, ensuring access to the latest information and best practices.

## Features

- **Multi-source Documentation Access**: Fetch from React, Next.js, TypeScript, Tailwind, Vercel, TanStack Query, Turborepo, and more
- **Intelligent Search**: Search across multiple documentation sources simultaneously
- **Real-time Content**: Always get the latest documentation directly from official sources
- **Structured Responses**: Clean, formatted content optimized for AI consumption

## Available Tools

### mcp_online-docs-m_fetch_docs
Fetches content from specific documentation pages.

**Parameters:**
- `source` (required): Documentation source (`react`, `nextjs`, `typescript`, `tailwind`, `vercel`, `tanstack-query`, `turborepo`)
- `query` (required): Search query or specific page path (e.g., 'hooks', 'useState', 'app-router')
- `section` (optional): Specific section to search in (varies by source)

### mcp_online-docs-m_search_docs
Searches across multiple documentation sources.

**Parameters:**
- `searchTerm` (required): Term to search for across documentation
- `sources` (optional): Array of sources to search (defaults to all)
- `limit` (optional): Maximum number of results to return (default: 5, max: 20)

### mcp_online-docs-m_list_doc_sources
Lists all available documentation sources and their sections.

## Installation

```bash
# Install dependencies
pnpm install

# Build the server
pnpm build

# Start the server
pnpm start
```

## Usage

### VS Code Integration
This server is configured for use with VS Code through the MCP configuration:

```jsonc
// .vscode/mcp.json
{
  "servers": {
    "online-docs-mcp": {
      "command": "node",
      "args": ["packages/mcp-online-docs/dist/index.js"],
      "env": {}
    }
  }
}
```

### Claude Desktop Configuration
Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "online-docs-mcp": {
      "command": "node",
      "args": ["/packages/mcp-online-docs/dist/index.js"],
      "env": {}
    }
  }
}
```

## Examples

### Fetch Next.js App Router Documentation
```json
{
  "tool": "mcp_online-docs-m_fetch_docs",
  "arguments": {
    "source": "nextjs",
    "query": "app router routing",
    "section": "app"
  }
}
```

### Search React Hooks Across Sources
```json
{
  "tool": "mcp_online-docs-m_search_docs",
  "arguments": {
    "searchTerm": "useEffect hooks",
    "sources": ["react", "nextjs"],
    "limit": 5
  }
}
```

### Get Available Documentation Sources
```json
{
  "tool": "mcp_online-docs-m_list_doc_sources",
  "arguments": {}
}
```

## Development

```bash
# Development with watch mode
pnpm dev

# Build for production
pnpm build

# Clean build artifacts
pnpm clean

# Start the built server
pnpm start
```

## Supported Documentation Sources

This server provides access to the following official documentation sources:

| Source | Description | Base URL | Sections |
|--------|-------------|----------|----------|
| **react** | Official React documentation | react.dev | hooks, components, learn, reference |
| **nextjs** | Official Next.js documentation | nextjs.org/docs | app, pages, api, routing, data-fetching |
| **typescript** | Official TypeScript documentation | typescriptlang.org/docs | handbook, reference, config |
| **tailwind** | Official Tailwind CSS documentation | tailwindcss.com/docs | utilities, components, config |
| **vercel** | Official Vercel platform documentation | vercel.com/docs | concepts, functions, deployments |
| **tanstack-query** | TanStack Query documentation + TkDodo's blog | tanstack.com/query/v5/docs | guides, reference, examples, blog |
| **turborepo** | Official Turborepo documentation | turbo.build/repo/docs | guides, handbook, reference, core |
| **shadcn-ui** | shadcn/ui component library documentation | ui.shadcn.com/docs | components, installation, theming, monorepo |
| **postgresql** | Official PostgreSQL database documentation | postgresql.org/docs/current | sql, functions, admin, tutorial |
| **drizzle** | Official Drizzle ORM documentation | orm.drizzle.team/docs | schema, queries, migrations, get-started |
| **stripe** | Official Stripe payments documentation | docs.stripe.com | api, payments, billing, connect, webhooks |

### Key Features by Source

- **React**: Complete API reference, hooks documentation, and learning guides
- **Next.js**: App Router, Pages Router, API routes, deployment guides
- **TypeScript**: Language handbook, compiler options, advanced types
- **Tailwind CSS**: Utility classes, component examples, configuration
- **Vercel**: Platform concepts, serverless functions, deployment
- **TanStack Query**: Data fetching patterns, caching strategies, TkDodo's expert insights
- **Turborepo**: Monorepo management, build optimization, code generation
- **shadcn/ui**: React component library, design system, monorepo setup
- **PostgreSQL**: SQL reference, database administration, performance tuning
- **Drizzle ORM**: Type-safe SQL, schema definitions, database migrations
- **Stripe**: Payment processing, subscription billing, webhook handling

## Architecture

- **Built with**: TypeScript, MCP SDK, Cheerio for HTML parsing
- **Transport**: stdio (standard input/output)
- **Error Handling**: Graceful fallbacks and informative error messages
- **Content Processing**: Intelligent content extraction and formatting
- **Rate Limiting**: Respectful request handling to documentation sources

## Use Cases

- **AI Assistant Integration**: Provide real-time documentation access to AI models
- **Development Workflow**: Quick access to official documentation during coding
- **Learning and Research**: Comprehensive search across multiple tech stacks
- **Code Generation**: Informed code suggestions based on latest documentation
- **Best Practices**: Access to expert insights and official recommendations

## Contributing

This package is part of the apps-builder monorepo workspace. Follow the established patterns for:

- TypeScript strict mode
- ESM module format
- Workspace package structure
- Error handling and logging