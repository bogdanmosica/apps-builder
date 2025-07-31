import type { NextConfig } from "next/types";

//const withMDX = MDX();
/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
	reactStrictMode: true,
	typescript: {
    ignoreBuildErrors: true,
  },
	eslint: {
		ignoreDuringBuilds: true,
	},
	output: process.env.DOCKER ? "standalone" : undefined,
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
	images: {
		remotePatterns: [
			{ hostname: "files.stripe.com" },
			{ hostname: "d1wqzb5bdbcre6.cloudfront.net" },
			{ hostname: "*.blob.vercel-storage.com" },
		],
		formats: ["image/avif", "image/webp"],
	},
	transpilePackages: ["next-mdx-remote", "commerce-kit", "@workspace/ui", "@workspace/prisma"],
	rewrites: async () => [
		{
			source: "/stats/:match*",
			destination: "https://eu.umami.is/:match*",
		},
	],
};

//export default withMDX(nextConfig);
export default nextConfig;
