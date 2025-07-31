import db from '@workspace/prisma';
import { siteConfig } from './site';

export const authConfig = {
  productName: siteConfig.name,
  config: {
    providers: [],
  },
  db,
};
