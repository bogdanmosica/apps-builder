import { authConfig } from "@/config/auth";
import { nextAuthHandlers, TGetAuthConfig } from "@workspace/next-auth";

export const {
  auth: auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = nextAuthHandlers(authConfig as TGetAuthConfig);
