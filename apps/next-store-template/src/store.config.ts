import AccessoriesImage from "@/images/accessories.jpg";
import ApparelImage from "@/images/apparel.jpg";

export const config = {
	name: "Your Store Name",
	description: "Your Store Description",
	categories: [
		{ name: "Furniture", slug: "furniture", image: ApparelImage },
		{ name: "Accessories", slug: "accessories", image: AccessoriesImage },
	],

	social: {
		x: "https://x.com/yourstore",
		facebook: "https://facebook.com/yourstore",
	},

	contact: {
		email: "support@yourstore.com",
		phone: "+1 (555) 111-4567",
		address: "123 Store Street, City, Country",
	},
};

export type StoreConfig = typeof config;
export default config;
