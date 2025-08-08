import { nextAuthHandlers } from "@workspace/next-auth";
import { authConfig } from "@/config/auth";

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = nextAuthHandlers(authConfig);
