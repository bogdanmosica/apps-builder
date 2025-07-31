import { PrismaClient } from "./generated/client/index.js";

//import { PrismaClient } from "@prisma/client";

declare global {
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}
 
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
 
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma;
