/**
 * Database Seed Script
 *
 * This script handles:
 * 1. Initial database seeding with property evaluation questions
 * 2. Creating a super admin user with default team
 * 3. User role management via command line arguments
 *
 * Usage:
 * - Normal seed: tsx lib/db/seed.ts
 * - Update user role: tsx lib/db/seed.ts --update-role <email> <role>
 *
 * Available roles: admin, member, viewer, owner
 *
 * Examples:
 * - tsx lib/db/seed.ts --update-role admin@admin.com admin
 * - tsx lib/db/seed.ts --update-role user@example.com admin
 */

import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/session";
import { db } from "./drizzle";
import {
  answers,
  customFields,
  type NewAnswer,
  type NewCustomField,
  type NewPropertyType,
  type NewQuestion,
  type NewQuestionCategory,
  propertyTypes,
  questionCategories,
  questions,
  teamMembers,
  teams,
  users,
} from "./schema";

// Utility function to update user role (can be called from other scripts)
export async function updateUserRole(email: string, role: string) {
  const validRoles = ["admin", "member", "viewer", "owner"];

  if (!validRoles.includes(role)) {
    throw new Error(
      `Invalid role: ${role}. Valid roles: ${validRoles.join(", ")}`,
    );
  }

  try {
    console.log(`🔧 Updating user ${email} to role: ${role}...`);

    const userList = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (userList.length === 0) {
      throw new Error(`User with email ${email} not found`);
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        role: role,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email))
      .returning();

    console.log(`✅ User role updated successfully!`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   New Role: ${updatedUser.role}`);

    return updatedUser;
  } catch (error) {
    console.error("❌ Error updating user role:", error);
    throw error;
  }
}

interface QuestionData {
  text_ro: string;
  text_en: string;
  weight: number;
  answers: Array<{
    text_ro: string;
    text_en: string;
    weight: number;
  }>;
}

interface CategoryData {
  name_ro: string;
  name_en: string;
  questions: QuestionData[];
}

interface PropertyTypeData {
  name_ro: string;
  name_en: string;
  categories: CategoryData[];
}

async function seedQuestions() {
  console.log("🌱 Starting questions seed process...");

  try {
    // Check if already seeded to make this idempotent
    const existingPropertyTypes = await db.select().from(propertyTypes);
    if (existingPropertyTypes.length > 0) {
      console.log(
        "✅ Property types already exist, skipping questions seed...",
      );
      console.log(`📊 Found ${existingPropertyTypes.length} property types`);
      return;
    }

    console.log("📝 No property types found, proceeding with seed...");
  } catch (error) {
    console.error("❌ Error checking existing property types:", error);
    // Continue with seeding if we can't check (maybe table doesn't exist yet)
    console.log("⚠️ Continuing with seed process...");
  }

  // Property evaluation questions data
  const propertyTypesData: PropertyTypeData[] = [
    {
      name_ro: "Casă",
      name_en: "House",
      categories: [
        {
          name_ro: "Utilități",
          name_en: "Utilities",
          questions: [
            {
              text_ro: "Este terenul racordat la apă, canal, curent și gaz?",
              text_en:
                "Is the land connected to water, sewage, electricity and gas?",
              weight: 10,
              answers: [
                {
                  text_ro: "Da, integral racordat",
                  text_en: "Yes, fully connected",
                  weight: 10,
                },
                {
                  text_ro: "Parțial racordat (doar la poartă)",
                  text_en: "Partially connected (only at gate)",
                  weight: 5,
                },
                {
                  text_ro: "Nu este racordat",
                  text_en: "Not connected",
                  weight: 0,
                },
              ],
            },
            {
              text_ro:
                "Unde se află utilitățile? Sunt trase în curte sau doar la poartă?",
              text_en:
                "Where are the utilities located? Are they drawn in the yard or only at the gate?",
              weight: 8,
              answers: [
                {
                  text_ro: "În curte, aproape de casă",
                  text_en: "In the yard, close to the house",
                  weight: 10,
                },
                {
                  text_ro: "La poartă, cu posibilitate de prelungire",
                  text_en: "At the gate, with extension possibility",
                  weight: 7,
                },
                {
                  text_ro: "Nespecificat sau incert",
                  text_en: "Unspecified or uncertain",
                  weight: 0,
                },
              ],
            },
          ],
        },
        {
          name_ro: "Fundația",
          name_en: "Foundation",
          questions: [
            {
              text_ro: "Fundația a fost executată pe un pământ bine compactat?",
              text_en: "Was the foundation built on well-compacted soil?",
              weight: 9,
              answers: [
                {
                  text_ro: "Da, pământul a fost compactat corespunzător",
                  text_en: "Yes, the soil was properly compacted",
                  weight: 10,
                },
                {
                  text_ro: "Parțial compactat",
                  text_en: "Partially compacted",
                  weight: 5,
                },
                {
                  text_ro: "Nu a fost compactat corespunzător",
                  text_en: "Not properly compacted",
                  weight: 0,
                },
              ],
            },
            {
              text_ro:
                "Au fost folosite materiale de protecție sub prima placă (pietriș, polistiren, hidroizolație)?",
              text_en:
                "Were protection materials used under the first slab (gravel, polystyrene, waterproofing)?",
              weight: 9,
              answers: [
                {
                  text_ro: "Da, toate materialele recomandate au fost folosite",
                  text_en: "Yes, all recommended materials were used",
                  weight: 10,
                },
                {
                  text_ro: "Doar unele dintre materiale",
                  text_en: "Only some materials",
                  weight: 5,
                },
                {
                  text_ro: "Nu, nu au fost folosite materiale de protecție",
                  text_en: "No, no protection materials were used",
                  weight: 0,
                },
              ],
            },
          ],
        },
        {
          name_ro: "Structura",
          name_en: "Structure",
          questions: [
            {
              text_ro:
                "Ce tip de beton a fost folosit la turnarea elementelor structurale?",
              text_en:
                "What type of concrete was used for casting structural elements?",
              weight: 10,
              answers: [
                {
                  text_ro: "Beton de înaltă rezistență (ex. C30/C35)",
                  text_en: "High-strength concrete (e.g. C30/C35)",
                  weight: 10,
                },
                {
                  text_ro: "Beton standard (ex. C20)",
                  text_en: "Standard concrete (e.g. C20)",
                  weight: 7,
                },
                {
                  text_ro: "Nu sunt sigure specificațiile betonului",
                  text_en: "Concrete specifications are uncertain",
                  weight: 0,
                },
              ],
            },
            {
              text_ro: "Câte bare de fier sunt utilizate în stâlpi și grinzi?",
              text_en: "How many steel bars are used in columns and beams?",
              weight: 8,
              answers: [
                {
                  text_ro: "Respectă normele și recomandările tehnice",
                  text_en: "Meets standards and technical recommendations",
                  weight: 10,
                },
                {
                  text_ro: "Numărul de bare este sub recomandat",
                  text_en: "Number of bars is below recommended",
                  weight: 5,
                },
                {
                  text_ro: "Nu sunt prezente armături corespunzătoare",
                  text_en: "No appropriate reinforcement present",
                  weight: 0,
                },
              ],
            },
          ],
        },
        {
          name_ro: "Ferestre",
          name_en: "Windows",
          questions: [
            {
              text_ro:
                "Ferestrele sunt echipate cu benzi de etanșeitate pentru eficiență termică?",
              text_en:
                "Are windows equipped with sealing strips for thermal efficiency?",
              weight: 8,
              answers: [
                {
                  text_ro: "Da, sunt complet etanșe",
                  text_en: "Yes, they are completely sealed",
                  weight: 10,
                },
                {
                  text_ro:
                    "Parțial, doar unele ferestre au benzi de etanșeitate",
                  text_en: "Partially, only some windows have sealing strips",
                  weight: 5,
                },
                {
                  text_ro: "Nu, lipsesc aceste detalii",
                  text_en: "No, these details are missing",
                  weight: 0,
                },
              ],
            },
            {
              text_ro: "Ce tip de termopan a fost instalat la ferestre?",
              text_en: "What type of double glazing was installed on windows?",
              weight: 7,
              answers: [
                {
                  text_ro: "Termopan cu izolație termică și fonică superioară",
                  text_en:
                    "Double glazing with superior thermal and acoustic insulation",
                  weight: 10,
                },
                {
                  text_ro: "Termopan standard",
                  text_en: "Standard double glazing",
                  weight: 5,
                },
                {
                  text_ro: "Nu sunt instalate geamuri termopan",
                  text_en: "No double glazing installed",
                  weight: 0,
                },
              ],
            },
          ],
        },
        {
          name_ro: "Termosistem și tencuială exterioară",
          name_en: "Thermal Insulation System and Exterior Plaster",
          questions: [
            {
              text_ro:
                "Ce tip de material izolant a fost folosit (polistiren, vată bazaltică)?",
              text_en:
                "What type of insulating material was used (polystyrene, basalt wool)?",
              weight: 9,
              answers: [
                {
                  text_ro:
                    "Material de înaltă performanță (ex. vată bazaltică)",
                  text_en: "High-performance material (e.g. basalt wool)",
                  weight: 10,
                },
                {
                  text_ro: "Polistiren de calitate medie",
                  text_en: "Medium quality polystyrene",
                  weight: 7,
                },
                {
                  text_ro: "Izolație de calitate inferioară sau absentă",
                  text_en: "Poor quality or absent insulation",
                  weight: 0,
                },
              ],
            },
            {
              text_ro: "Ce grosime are stratul de izolație termică?",
              text_en: "What thickness is the thermal insulation layer?",
              weight: 8,
              answers: [
                {
                  text_ro: "Grosime conform normelor (minim 10–15 cm)",
                  text_en:
                    "Thickness according to standards (minimum 10–15 cm)",
                  weight: 10,
                },
                {
                  text_ro: "Grosime sub recomandat",
                  text_en: "Thickness below recommended",
                  weight: 5,
                },
                {
                  text_ro: "Informație nedeterminată",
                  text_en: "Information undetermined",
                  weight: 0,
                },
              ],
            },
            {
              text_ro: "Ce tip de tencuială exterioară a fost aplicat?",
              text_en: "What type of exterior plaster was applied?",
              weight: 7,
              answers: [
                {
                  text_ro: "Tencuială decorativă de calitate superioară",
                  text_en: "Superior quality decorative plaster",
                  weight: 10,
                },
                {
                  text_ro: "Tencuială standard",
                  text_en: "Standard plaster",
                  weight: 5,
                },
                {
                  text_ro: "Tencuială de calitate inferioară",
                  text_en: "Poor quality plaster",
                  weight: 0,
                },
              ],
            },
          ],
        },
        {
          name_ro: "Instalații electrice și sanitare",
          name_en: "Electrical and Plumbing Systems",
          questions: [
            {
              text_ro:
                "Tabloul electric respectă normele (număr de circuite, diferențial, protecții)?",
              text_en:
                "Does the electrical panel meet standards (number of circuits, differential, protections)?",
              weight: 9,
              answers: [
                {
                  text_ro: "Da, toate specificațiile sunt conforme",
                  text_en: "Yes, all specifications are compliant",
                  weight: 10,
                },
                {
                  text_ro: "Parțial, unele circuite nu sunt optim configurate",
                  text_en:
                    "Partially, some circuits are not optimally configured",
                  weight: 5,
                },
                {
                  text_ro: "Nu sunt conforme normelor",
                  text_en: "Not compliant with standards",
                  weight: 0,
                },
              ],
            },
            {
              text_ro: "Cum este realizată instalația sanitară?",
              text_en: "How is the plumbing system implemented?",
              weight: 8,
              answers: [
                {
                  text_ro: "În sistem centralizat, conform normelor",
                  text_en: "In centralized system, according to standards",
                  weight: 10,
                },
                {
                  text_ro: "Sistem modular, dar cu unele deficiențe",
                  text_en: "Modular system, but with some deficiencies",
                  weight: 5,
                },
                {
                  text_ro: "Instalație de calitate inferioară sau neconformă",
                  text_en: "Poor quality or non-compliant installation",
                  weight: 0,
                },
              ],
            },
          ],
        },
        {
          name_ro: "Acoperiș",
          name_en: "Roof",
          questions: [
            {
              text_ro:
                "Acoperișul are o structură solidă (ex. șarpantă, placă peste etaj etc.)?",
              text_en:
                "Does the roof have a solid structure (e.g. truss, slab over floor, etc.)?",
              weight: 9,
              answers: [
                {
                  text_ro: "Da, structura este robustă și conformă",
                  text_en: "Yes, the structure is robust and compliant",
                  weight: 10,
                },
                {
                  text_ro: "Structura prezintă unele deficiențe",
                  text_en: "The structure has some deficiencies",
                  weight: 5,
                },
                {
                  text_ro: "Structura este neconformă sau nesigură",
                  text_en: "The structure is non-compliant or unsafe",
                  weight: 0,
                },
              ],
            },
            {
              text_ro:
                "Ce materiale au fost folosite la executarea acoperișului?",
              text_en: "What materials were used for roof construction?",
              weight: 8,
              answers: [
                {
                  text_ro: "Materiale de înaltă calitate, cu eficiență termică",
                  text_en: "High-quality materials with thermal efficiency",
                  weight: 10,
                },
                {
                  text_ro: "Materiale standard, dar conforme",
                  text_en: "Standard materials, but compliant",
                  weight: 5,
                },
                {
                  text_ro: "Materiale de calitate inferioară",
                  text_en: "Poor quality materials",
                  weight: 0,
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  try {
    console.log("� Starting property types creation...");

    for (const propertyTypeData of propertyTypesData) {
      console.log(
        `📝 Creating property type: ${propertyTypeData.name_ro} / ${propertyTypeData.name_en}`,
      );

      // Insert property type
      const [propertyType] = await db
        .insert(propertyTypes)
        .values({
          name_ro: propertyTypeData.name_ro,
          name_en: propertyTypeData.name_en,
        } as NewPropertyType)
        .returning();

      for (const categoryData of propertyTypeData.categories) {
        console.log(
          `  📂 Creating category: ${categoryData.name_ro} / ${categoryData.name_en}`,
        );

        // Insert question category
        const [category] = await db
          .insert(questionCategories)
          .values({
            name_ro: categoryData.name_ro,
            name_en: categoryData.name_en,
            propertyTypeId: propertyType.id,
          } as NewQuestionCategory)
          .returning();

        for (const questionData of categoryData.questions) {
          console.log(
            `    ❓ Creating question: ${questionData.text_ro.substring(0, 50)}...`,
          );

          // Insert question
          const [question] = await db
            .insert(questions)
            .values({
              text_ro: questionData.text_ro,
              text_en: questionData.text_en,
              weight: questionData.weight,
              categoryId: category.id,
            } as NewQuestion)
            .returning();

          // Insert answers for this question
          const answerValues = questionData.answers.map(
            (answerData) =>
              ({
                text_ro: answerData.text_ro,
                text_en: answerData.text_en,
                weight: answerData.weight,
                questionId: question.id,
              }) as NewAnswer,
          );

          await db.insert(answers).values(answerValues);
          console.log(`      ✅ Created ${answerValues.length} answers`);
        }
      }
    }

    console.log("");
    console.log("🎉 Questions seed completed successfully!");
    console.log("");
    console.log("Database structure created:");
    console.log(`📊 Property Types: ${propertyTypesData.length}`);

    const totalCategories = propertyTypesData.reduce(
      (sum, pt) => sum + pt.categories.length,
      0,
    );
    console.log(`📂 Categories: ${totalCategories}`);

    const totalQuestions = propertyTypesData.reduce(
      (sum, pt) =>
        sum +
        pt.categories.reduce((catSum, cat) => catSum + cat.questions.length, 0),
      0,
    );
    console.log(`❓ Questions: ${totalQuestions}`);

    const totalAnswers = propertyTypesData.reduce(
      (sum, pt) =>
        sum +
        pt.categories.reduce(
          (catSum, cat) =>
            catSum +
            cat.questions.reduce((qSum, q) => qSum + q.answers.length, 0),
          0,
        ),
      0,
    );
    console.log(`💬 Answers: ${totalAnswers}`);
  } catch (error) {
    console.error("❌ Error seeding questions:", error);
    throw error;
  }
}

async function seedCustomFields() {
  console.log(
    "🔧 Starting custom fields seeding (including universal fields)...",
  );

  try {
    // Get existing property types to add custom fields to
    const existingPropertyTypes = await db.select().from(propertyTypes);

    if (existingPropertyTypes.length === 0) {
      console.log(
        "⚠️ No property types found. Custom fields will not be seeded.",
      );
      return;
    }

    // Universal fields that apply to all property types
    const universalFields: Array<Omit<NewCustomField, "propertyTypeId">> = [
      {
        label_ro: "Adresa",
        label_en: "Address",
        fieldType: "text",
        isRequired: true,
        placeholder_ro: "Ex: Strada Florilor, Nr. 123, București",
        placeholder_en: "Ex: 123 Flower Street, Bucharest",
        helpText_ro: "Adresa completă a proprietății",
        helpText_en: "Complete address of the property",
        category: "basic",
        sortOrder: 1,
        isActive: true,
      },
      {
        label_ro: "Suprafața construită (mp)",
        label_en: "Built area (sqm)",
        fieldType: "number",
        isRequired: true,
        placeholder_ro: "Ex: 120",
        placeholder_en: "Ex: 120",
        helpText_ro: "Suprafața construită în metri pătrați",
        helpText_en: "Built area in square meters",
        category: "details",
        validation: { min: 10, max: 10000 },
        sortOrder: 2,
        isActive: true,
      },
      {
        label_ro: "Numărul de etaje",
        label_en: "Number of floors",
        fieldType: "number",
        isRequired: false,
        placeholder_ro: "Ex: 2",
        placeholder_en: "Ex: 2",
        helpText_ro: "Numărul total de etaje/nivele",
        helpText_en: "Total number of floors/levels",
        category: "details",
        validation: { min: 1, max: 20 },
        sortOrder: 3,
        isActive: true,
      },
      {
        label_ro: "Anul construcției",
        label_en: "Construction year",
        fieldType: "number",
        isRequired: false,
        placeholder_ro: "Ex: 2020",
        placeholder_en: "Ex: 2020",
        helpText_ro: "Anul în care a fost construită proprietatea",
        helpText_en: "Year when the property was built",
        category: "construction",
        validation: { min: 1800, max: 2030 },
        sortOrder: 4,
        isActive: true,
      },
      {
        label_ro: "Observații generale",
        label_en: "General observations",
        fieldType: "textarea",
        isRequired: false,
        placeholder_ro: "Informații suplimentare despre proprietate...",
        placeholder_en: "Additional information about the property...",
        helpText_ro: "Observații sau detalii suplimentare relevante",
        helpText_en: "Additional observations or relevant details",
        category: "general",
        sortOrder: 5,
        isActive: true,
      },
    ];

    // Sample custom fields for different property types (these will be in addition to universal fields)
    const customFieldsData: Array<{
      propertyTypeName: string;
      fields: Array<Omit<NewCustomField, "propertyTypeId">>;
    }> = [
      {
        propertyTypeName: "Apartament",
        fields: [
          {
            label_ro: "Numărul de camere",
            label_en: "Number of rooms",
            fieldType: "select",
            isRequired: true,
            placeholder_ro: "Selectați numărul de camere",
            placeholder_en: "Select number of rooms",
            helpText_ro: "Selectați numărul total de camere din apartament",
            helpText_en: "Select the total number of rooms in the apartment",
            category: "details",
            selectOptions: [
              { value: "1", label_ro: "1 cameră", label_en: "1 room" },
              { value: "2", label_ro: "2 camere", label_en: "2 rooms" },
              { value: "3", label_ro: "3 camere", label_en: "3 rooms" },
              { value: "4", label_ro: "4 camere", label_en: "4 rooms" },
              { value: "5+", label_ro: "5+ camere", label_en: "5+ rooms" },
            ],
            sortOrder: 10,
          },
          {
            label_ro: "Suprafața utilă (mp)",
            label_en: "Usable area (sqm)",
            fieldType: "number",
            isRequired: true,
            placeholder_ro: "Ex: 65",
            placeholder_en: "Ex: 65",
            helpText_ro: "Introduceți suprafața utilă în metri pătrați",
            helpText_en: "Enter the usable area in square meters",
            category: "details",
            validation: { min: 10, max: 500 },
            sortOrder: 11,
          },
          {
            label_ro: "Etaj",
            label_en: "Floor",
            fieldType: "text",
            isRequired: false,
            placeholder_ro: "Ex: 3 din 10",
            placeholder_en: "Ex: 3 of 10",
            helpText_ro: "Etajul pe care se află apartamentul",
            helpText_en: "Floor where the apartment is located",
            category: "details",
            sortOrder: 12,
          },
          {
            label_ro: "Balcon disponibil",
            label_en: "Balcony available",
            fieldType: "boolean",
            isRequired: false,
            helpText_ro: "Apartamentul are balcon?",
            helpText_en: "Does the apartment have a balcony?",
            category: "amenities",
            sortOrder: 13,
          },
        ],
      },
      {
        propertyTypeName: "Casă",
        fields: [
          {
            label_ro: "Suprafața terenului (mp)",
            label_en: "Land area (sqm)",
            fieldType: "number",
            isRequired: true,
            placeholder_ro: "Ex: 500",
            placeholder_en: "Ex: 500",
            helpText_ro: "Suprafața totală a terenului în metri pătrați",
            helpText_en: "Total land area in square meters",
            category: "details",
            validation: { min: 50, max: 10000 },
            sortOrder: 10,
          },
          {
            label_ro: "Garaj/Parcare",
            label_en: "Garage/Parking",
            fieldType: "select",
            isRequired: false,
            category: "amenities",
            selectOptions: [
              { value: "none", label_ro: "Fără garaj", label_en: "No garage" },
              {
                value: "outdoor",
                label_ro: "Parcare exterioară",
                label_en: "Outdoor parking",
              },
              {
                value: "garage",
                label_ro: "Garaj închis",
                label_en: "Closed garage",
              },
            ],
            sortOrder: 11,
          },
        ],
      },
    ];

    let totalFieldsCreated = 0;

    // First, add universal fields to ALL property types
    console.log("🌍 Adding universal fields to all property types...");
    for (const propertyType of existingPropertyTypes) {
      console.log(`🔧 Adding universal fields for: ${propertyType.name_ro}`);

      // Check if universal fields already exist for this property type
      const existingFields = await db
        .select()
        .from(customFields)
        .where(eq(customFields.propertyTypeId, propertyType.id));

      if (existingFields.length > 0) {
        console.log(
          `  ⚠️ Fields already exist for ${propertyType.name_ro}. Skipping universal fields.`,
        );
        continue;
      }

      // Insert universal fields
      for (const fieldData of universalFields) {
        const [newField] = await db
          .insert(customFields)
          .values({
            propertyTypeId: propertyType.id,
            label_ro: fieldData.label_ro,
            label_en: fieldData.label_en || null,
            fieldType: fieldData.fieldType,
            isRequired: fieldData.isRequired,
            placeholder_ro: fieldData.placeholder_ro || null,
            placeholder_en: fieldData.placeholder_en || null,
            helpText_ro: fieldData.helpText_ro || null,
            helpText_en: fieldData.helpText_en || null,
            selectOptions: fieldData.selectOptions || [],
            validation: fieldData.validation || {},
            category: fieldData.category || "general",
            sortOrder: fieldData.sortOrder || 0,
            isActive: true,
          } as NewCustomField)
          .returning();

        console.log(`  ✅ Created universal field: ${newField.label_ro}`);
        totalFieldsCreated++;
      }
    }

    // Then, add specific custom fields for certain property types
    console.log("🏠 Adding property-type-specific custom fields...");
    for (const propertyTypeData of customFieldsData) {
      // Find the property type
      const propertyType = existingPropertyTypes.find(
        (pt: (typeof existingPropertyTypes)[0]) =>
          pt.name_ro === propertyTypeData.propertyTypeName,
      );

      if (!propertyType) {
        console.log(
          `⚠️ Property type "${propertyTypeData.propertyTypeName}" not found. Skipping custom fields.`,
        );
        continue;
      }

      console.log(`🔧 Adding custom fields for: ${propertyType.name_ro}`);

      // Check if property-specific custom fields already exist for this property type
      const existingSpecificFields = await db
        .select()
        .from(customFields)
        .where(eq(customFields.propertyTypeId, propertyType.id));

      const hasSpecificFields = existingSpecificFields.some(
        (field: (typeof existingSpecificFields)[0]) =>
          propertyTypeData.fields.some(
            (newField) => newField.label_ro === field.label_ro,
          ),
      );

      if (hasSpecificFields) {
        console.log(
          `  ⚠️ Property-specific fields already exist for ${propertyType.name_ro}. Skipping.`,
        );
        continue;
      }

      // Insert property-specific custom fields
      for (const fieldData of propertyTypeData.fields) {
        const [newField] = await db
          .insert(customFields)
          .values({
            propertyTypeId: propertyType.id,
            label_ro: fieldData.label_ro,
            label_en: fieldData.label_en || null,
            fieldType: fieldData.fieldType,
            isRequired: fieldData.isRequired,
            placeholder_ro: fieldData.placeholder_ro || null,
            placeholder_en: fieldData.placeholder_en || null,
            helpText_ro: fieldData.helpText_ro || null,
            helpText_en: fieldData.helpText_en || null,
            selectOptions: fieldData.selectOptions || [],
            validation: fieldData.validation || {},
            category: fieldData.category || "general",
            sortOrder: fieldData.sortOrder || 0,
            isActive: true,
          } as NewCustomField)
          .returning();

        console.log(`  ✅ Created specific field: ${newField.label_ro}`);
        totalFieldsCreated++;
      }
    }

    console.log("🎉 Custom fields seeding completed successfully!");
    console.log(`📝 Total custom fields created: ${totalFieldsCreated}`);
  } catch (error) {
    console.error("❌ Error seeding custom fields:", error);
    throw error;
  }
}

async function seed() {
  const email = "admin@admin.com";
  const password = "admin123";

  console.log("🚀 Starting complete database seed process...");
  console.log(`📅 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Database URL configured: ${!!process.env.DATABASE_URL}`);
  console.log(`� Postgres URL configured: ${!!process.env.POSTGRES_URL}`);
  console.log(`☁️ Vercel environment: ${!!process.env.VERCEL}`);
  console.log("");

  try {
    // Test database connection first
    console.log("🔍 Testing database connection...");
    await db.select().from(users).limit(1);
    console.log("✅ Database connection successful");

    // Hash password
    const passwordHash = await hashPassword(password);

    // First, seed the questions data
    await seedQuestions();

    // Then seed sample custom fields
    await seedCustomFields();

    console.log("");
    console.log("👤 Creating super user...");

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let user;
    if (existingUser.length > 0) {
      user = existingUser[0];
      console.log("Super user already exists.");
    } else {
      // Create super user
      [user] = await db
        .insert(users)
        .values([
          {
            name: "Super Admin",
            email: email,
            passwordHash: passwordHash,
            role: "owner",
          },
        ])
        .returning();
      console.log("✅ Super user created successfully!");
    }

    // Check if user has a team
    const existingTeamMember = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (existingTeamMember.length === 0) {
      console.log("Creating default team for super user...");

      // Create a default team
      const [team] = await db
        .insert(teams)
        .values({
          name: "Default Team",
        })
        .returning();

      // Add user to the team
      await db.insert(teamMembers).values({
        userId: user.id,
        teamId: team.id,
        role: "owner",
      });

      console.log(`✅ Default team created and user added as owner!`);
    } else {
      console.log("User already belongs to a team.");
    }

    console.log("");
    console.log("🎯 Seed Summary:");
    console.log("==================");
    console.log("Super User Credentials:");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log("");
    console.log(
      "✅ Questions database populated with property evaluation data",
    );
    console.log("✅ Admin user and team created");
    console.log("");
    console.log("🎉 Database seed completed successfully!");
    console.log(
      "You can now login and start using the property evaluation system!",
    );
  } catch (error) {
    console.error("❌ Seed process failed:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      timestamp: new Date().toISOString(),
      databaseUrl: !!process.env.DATABASE_URL,
      postgresUrl: !!process.env.POSTGRES_URL,
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
    });
    throw error; // Re-throw to ensure build fails if seed fails
  }
}

// Allow running this file with arguments to update user roles
// Usage: tsx lib/db/seed.ts --update-role admin@admin.com admin
if (process.argv.includes("--update-role")) {
  const roleIndex = process.argv.indexOf("--update-role");
  const targetEmail = process.argv[roleIndex + 1];
  const targetRole = process.argv[roleIndex + 2];

  if (!targetEmail || !targetRole) {
    console.error("❌ Usage: tsx lib/db/seed.ts --update-role <email> <role>");
    console.error("Available roles: admin, member, viewer, owner");
    process.exit(1);
  }

  updateUserRole(targetEmail, targetRole)
    .then(() => {
      console.log("✅ Role update completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Role update failed:", error);
      process.exit(1);
    });
} else {
  // Run normal seed process
  seed()
    .catch((error) => {
      console.error("❌ Seed process failed:", error);
      process.exit(1);
    })
    .finally(() => {
      console.log("Seed process finished. Exiting...");
      process.exit(0);
    });
}
