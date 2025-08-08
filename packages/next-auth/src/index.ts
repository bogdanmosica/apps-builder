import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import { initAuthConfig } from "./auth.config";

//const postmarkClient = new Client(process.env.POSTMARK_API_TOKEN ?? '');
const _postmarkClient = () => ({
  sendEmailWithTemplate: async (_options: any) => {},
  ErrorCode: 0,
  Message: "Success",
});

export type TGetAuthConfig = {
  productName: string;
  config?: NextAuthConfig;
};

export const nextAuthHandlers = ({
  productName = "",
  config = { providers: [] },
}: TGetAuthConfig) => NextAuth(initAuthConfig({ productName, config }));
