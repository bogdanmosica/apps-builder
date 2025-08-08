// User type constants
export const USER_TYPES = {
  TENANT: "tenant",
  BUYER: "buyer",
  INVESTOR: "investor",
} as const;

export const USER_TYPE_OPTIONS = [
  { value: USER_TYPES.TENANT, label: "Tenant (Looking to rent)" },
  { value: USER_TYPES.BUYER, label: "Buyer (Looking to purchase)" },
  { value: USER_TYPES.INVESTOR, label: "Real Estate Investor" },
] as const;

// Property type constants
export const PROPERTY_TYPES = {
  APARTMENT: "apartment",
  HOUSE: "house",
  VILLA: "villa",
  STUDIO: "studio",
  DUPLEX: "duplex",
  PENTHOUSE: "penthouse",
  TOWNHOUSE: "townhouse",
  COMMERCIAL: "commercial",
  OFFICE: "office",
  LAND: "land",
} as const;

export const PROPERTY_TYPE_OPTIONS = [
  { value: PROPERTY_TYPES.APARTMENT, label: "Apartament" },
  { value: PROPERTY_TYPES.HOUSE, label: "Casă" },
  { value: PROPERTY_TYPES.VILLA, label: "Vilă" },
  { value: PROPERTY_TYPES.STUDIO, label: "Studio" },
  { value: PROPERTY_TYPES.DUPLEX, label: "Duplex" },
  { value: PROPERTY_TYPES.PENTHOUSE, label: "Penthouse" },
  { value: PROPERTY_TYPES.TOWNHOUSE, label: "Casă în șir" },
  { value: PROPERTY_TYPES.COMMERCIAL, label: "Spaţiu comercial" },
  { value: PROPERTY_TYPES.OFFICE, label: "Birou" },
  { value: PROPERTY_TYPES.LAND, label: "Teren" },
] as const;

// Listing type constants
export const LISTING_TYPES = {
  SALE: "sale",
  RENT: "rent",
} as const;

export const LISTING_TYPE_OPTIONS = [
  { value: LISTING_TYPES.SALE, label: "Vânzare" },
  { value: LISTING_TYPES.RENT, label: "Închiriere" },
] as const;

// Romanian counties constants
export const ROMANIAN_COUNTIES = [
  "Alba",
  "Arad",
  "Argeş",
  "Bacău",
  "Bihor",
  "Bistriţa-Năsăud",
  "Botoşani",
  "Braşov",
  "Brăila",
  "Bucureşti",
  "Buzău",
  "Caraş-Severin",
  "Călăraşi",
  "Cluj",
  "Constanţa",
  "Covasna",
  "Dâmboviţa",
  "Dolj",
  "Galaţi",
  "Giurgiu",
  "Gorj",
  "Harghita",
  "Hunedoara",
  "Ialomiţa",
  "Iaşi",
  "Ilfov",
  "Maramureş",
  "Mehedinţi",
  "Mureş",
  "Neamţ",
  "Olt",
  "Prahova",
  "Satu Mare",
  "Sălaj",
  "Sibiu",
  "Suceava",
  "Teleorman",
  "Timiş",
  "Tulcea",
  "Vaslui",
  "Vâlcea",
  "Vrancea",
] as const;

// Contact form constants
export const CONTACT_INQUIRIES = {
  BUYING: "buying",
  RENTING: "renting",
  INVESTING: "investing",
  SELLING: "selling",
  GENERAL: "general",
  SUPPORT: "support",
} as const;

export const CONTACT_INQUIRY_OPTIONS = [
  { value: CONTACT_INQUIRIES.BUYING, label: "Looking to Buy" },
  { value: CONTACT_INQUIRIES.RENTING, label: "Looking to Rent" },
  { value: CONTACT_INQUIRIES.INVESTING, label: "Investment Opportunities" },
  { value: CONTACT_INQUIRIES.SELLING, label: "Selling a Property" },
  { value: CONTACT_INQUIRIES.GENERAL, label: "General Question" },
  { value: CONTACT_INQUIRIES.SUPPORT, label: "Technical Support" },
] as const;

export const CONTACT_SUBJECTS = [
  "Property Inquiry",
  "Technical Support",
  "General Question",
  "Partnership",
  "Feedback",
  "Other",
] as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];
export type PropertyType = (typeof PROPERTY_TYPES)[keyof typeof PROPERTY_TYPES];
export type ListingType = (typeof LISTING_TYPES)[keyof typeof LISTING_TYPES];
export type RomanianCounty = (typeof ROMANIAN_COUNTIES)[number];
export type ContactInquiry =
  (typeof CONTACT_INQUIRIES)[keyof typeof CONTACT_INQUIRIES];
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];
