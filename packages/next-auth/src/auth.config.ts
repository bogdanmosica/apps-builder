import type { NextAuthConfig } from "next-auth";
import type { TGetAuthConfig } from "./index";
import { providers } from "./providers";

export const initAuthConfig = ({ productName, config }: TGetAuthConfig) =>
  ({
    session: {
      strategy: "jwt",
    },
    // pages: {
    //   signIn: '/login',
    // },
    providers: [...providers, ...(config?.providers ?? [])],
    callbacks: {
      async session({ token, session }: any) {
        // console.log({ session, token });
        if (token && session) {
          session.user.id = token.id;
          session.user.name = token.name;
          session.user.email = token.email;
          session.user.image = token.picture;
        }
        return session;
      },
      async jwt({ token, user }: any) {
        // console.log({ user, token });
        if (!user) {
          if (token) {
            return token;
          }
        }

        return {
          id: user?.id || token?.id,
          name: user?.name || token?.name,
          email: user?.email || token?.email,
          picture: user?.image || token?.picture,
        };
      },
    },
    debug: process.env.NODE_ENV === "development",
    ...config,
  }) as NextAuthConfig;
