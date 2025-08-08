import storeConfig from "../store.config";

export const authConfig: {
  productName: string;
  config: {
    providers: unknown[];
  };
} = {
  productName: storeConfig.name,
  config: {
    providers: [],
  },
};
