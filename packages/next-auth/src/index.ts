import { initAuthConfig } from "./auth.config";
import db from "@workspace/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { NextAuthConfig, NextAuthResult } from "next-auth";
// import Nodemailer from 'next-auth/providers/nodemailer';
import GitHub from "next-auth/providers/github";
import { Client } from "postmark";

//const postmarkClient = new Client(process.env.POSTMARK_API_TOKEN ?? '');
const postmarkClient = () => ({
  sendEmailWithTemplate: async (options: any) => {
    console.log({ options });
  },
  ErrorCode: 0,
  Message: "Success",
});

export type TGetAuthConfig = {
  productName: string;
  config?: NextAuthConfig;
  db: typeof db;
};

export const nextAuthHandlers = ({
  productName = "",
  config = { providers: [] },
  db,
}: TGetAuthConfig) =>
  NextAuth(
    initAuthConfig({ productName, config, db }),
  );
