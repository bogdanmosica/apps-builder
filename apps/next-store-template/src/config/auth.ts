import db from '@workspace/prisma';
import storeConfig from '../store.config';

export const authConfig: {
  productName: string;
  config: {
    providers: unknown[];
  };
  db: typeof db;
} = {
  productName: storeConfig.name,
  config: {
    providers: [],
  },
  db,
};
