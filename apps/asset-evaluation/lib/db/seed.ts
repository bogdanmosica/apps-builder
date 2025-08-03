import { db } from './drizzle';
import {
  users,
  teams,
  teamMembers,
  propertyTypes,
  questionCategories,
  questions,
  answers,
  type NewPropertyType,
  type NewQuestionCategory,
  type NewQuestion,
  type NewAnswer,
} from './schema';
import { hashPassword } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

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
  console.log('🌱 Starting questions seed process...');

  // Property evaluation questions data
  const propertyTypesData: PropertyTypeData[] = [
    {
      name_ro: 'Casă',
      name_en: 'House',
      categories: [
        {
          name_ro: 'Utilități',
          name_en: 'Utilities',
          questions: [
            {
              text_ro: 'Este terenul racordat la apă, canal, curent și gaz?',
              text_en: 'Is the land connected to water, sewage, electricity and gas?',
              weight: 10,
              answers: [
                { text_ro: 'Da, integral racordat', text_en: 'Yes, fully connected', weight: 10 },
                { text_ro: 'Parțial racordat (doar la poartă)', text_en: 'Partially connected (only at gate)', weight: 5 },
                { text_ro: 'Nu este racordat', text_en: 'Not connected', weight: 0 },
              ],
            },
            {
              text_ro: 'Unde se află utilitățile? Sunt trase în curte sau doar la poartă?',
              text_en: 'Where are the utilities located? Are they drawn in the yard or only at the gate?',
              weight: 8,
              answers: [
                { text_ro: 'În curte, aproape de casă', text_en: 'In the yard, close to the house', weight: 10 },
                { text_ro: 'La poartă, cu posibilitate de prelungire', text_en: 'At the gate, with extension possibility', weight: 7 },
                { text_ro: 'Nespecificat sau incert', text_en: 'Unspecified or uncertain', weight: 0 },
              ],
            },
          ],
        },
        {
          name_ro: 'Fundația',
          name_en: 'Foundation',
          questions: [
            {
              text_ro: 'Fundația a fost executată pe un pământ bine compactat?',
              text_en: 'Was the foundation built on well-compacted soil?',
              weight: 9,
              answers: [
                { text_ro: 'Da, pământul a fost compactat corespunzător', text_en: 'Yes, the soil was properly compacted', weight: 10 },
                { text_ro: 'Parțial compactat', text_en: 'Partially compacted', weight: 5 },
                { text_ro: 'Nu a fost compactat corespunzător', text_en: 'Not properly compacted', weight: 0 },
              ],
            },
            {
              text_ro: 'Au fost folosite materiale de protecție sub prima placă (pietriș, polistiren, hidroizolație)?',
              text_en: 'Were protection materials used under the first slab (gravel, polystyrene, waterproofing)?',
              weight: 9,
              answers: [
                { text_ro: 'Da, toate materialele recomandate au fost folosite', text_en: 'Yes, all recommended materials were used', weight: 10 },
                { text_ro: 'Doar unele dintre materiale', text_en: 'Only some materials', weight: 5 },
                { text_ro: 'Nu, nu au fost folosite materiale de protecție', text_en: 'No, no protection materials were used', weight: 0 },
              ],
            },
          ],
        },
        {
          name_ro: 'Structura',
          name_en: 'Structure',
          questions: [
            {
              text_ro: 'Ce tip de beton a fost folosit la turnarea elementelor structurale?',
              text_en: 'What type of concrete was used for casting structural elements?',
              weight: 10,
              answers: [
                { text_ro: 'Beton de înaltă rezistență (ex. C30/C35)', text_en: 'High-strength concrete (e.g. C30/C35)', weight: 10 },
                { text_ro: 'Beton standard (ex. C20)', text_en: 'Standard concrete (e.g. C20)', weight: 7 },
                { text_ro: 'Nu sunt sigure specificațiile betonului', text_en: 'Concrete specifications are uncertain', weight: 0 },
              ],
            },
            {
              text_ro: 'Câte bare de fier sunt utilizate în stâlpi și grinzi?',
              text_en: 'How many steel bars are used in columns and beams?',
              weight: 8,
              answers: [
                { text_ro: 'Respectă normele și recomandările tehnice', text_en: 'Meets standards and technical recommendations', weight: 10 },
                { text_ro: 'Numărul de bare este sub recomandat', text_en: 'Number of bars is below recommended', weight: 5 },
                { text_ro: 'Nu sunt prezente armături corespunzătoare', text_en: 'No appropriate reinforcement present', weight: 0 },
              ],
            },
          ],
        },
        {
          name_ro: 'Ferestre',
          name_en: 'Windows',
          questions: [
            {
              text_ro: 'Ferestrele sunt echipate cu benzi de etanșeitate pentru eficiență termică?',
              text_en: 'Are windows equipped with sealing strips for thermal efficiency?',
              weight: 8,
              answers: [
                { text_ro: 'Da, sunt complet etanșe', text_en: 'Yes, they are completely sealed', weight: 10 },
                { text_ro: 'Parțial, doar unele ferestre au benzi de etanșeitate', text_en: 'Partially, only some windows have sealing strips', weight: 5 },
                { text_ro: 'Nu, lipsesc aceste detalii', text_en: 'No, these details are missing', weight: 0 },
              ],
            },
            {
              text_ro: 'Ce tip de termopan a fost instalat la ferestre?',
              text_en: 'What type of double glazing was installed on windows?',
              weight: 7,
              answers: [
                { text_ro: 'Termopan cu izolație termică și fonică superioară', text_en: 'Double glazing with superior thermal and acoustic insulation', weight: 10 },
                { text_ro: 'Termopan standard', text_en: 'Standard double glazing', weight: 5 },
                { text_ro: 'Nu sunt instalate geamuri termopan', text_en: 'No double glazing installed', weight: 0 },
              ],
            },
          ],
        },
        {
          name_ro: 'Termosistem și tencuială exterioară',
          name_en: 'Thermal Insulation System and Exterior Plaster',
          questions: [
            {
              text_ro: 'Ce tip de material izolant a fost folosit (polistiren, vată bazaltică)?',
              text_en: 'What type of insulating material was used (polystyrene, basalt wool)?',
              weight: 9,
              answers: [
                { text_ro: 'Material de înaltă performanță (ex. vată bazaltică)', text_en: 'High-performance material (e.g. basalt wool)', weight: 10 },
                { text_ro: 'Polistiren de calitate medie', text_en: 'Medium quality polystyrene', weight: 7 },
                { text_ro: 'Izolație de calitate inferioară sau absentă', text_en: 'Poor quality or absent insulation', weight: 0 },
              ],
            },
            {
              text_ro: 'Ce grosime are stratul de izolație termică?',
              text_en: 'What thickness is the thermal insulation layer?',
              weight: 8,
              answers: [
                { text_ro: 'Grosime conform normelor (minim 10–15 cm)', text_en: 'Thickness according to standards (minimum 10–15 cm)', weight: 10 },
                { text_ro: 'Grosime sub recomandat', text_en: 'Thickness below recommended', weight: 5 },
                { text_ro: 'Informație nedeterminată', text_en: 'Information undetermined', weight: 0 },
              ],
            },
            {
              text_ro: 'Ce tip de tencuială exterioară a fost aplicat?',
              text_en: 'What type of exterior plaster was applied?',
              weight: 7,
              answers: [
                { text_ro: 'Tencuială decorativă de calitate superioară', text_en: 'Superior quality decorative plaster', weight: 10 },
                { text_ro: 'Tencuială standard', text_en: 'Standard plaster', weight: 5 },
                { text_ro: 'Tencuială de calitate inferioară', text_en: 'Poor quality plaster', weight: 0 },
              ],
            },
          ],
        },
        {
          name_ro: 'Instalații electrice și sanitare',
          name_en: 'Electrical and Plumbing Systems',
          questions: [
            {
              text_ro: 'Tabloul electric respectă normele (număr de circuite, diferențial, protecții)?',
              text_en: 'Does the electrical panel meet standards (number of circuits, differential, protections)?',
              weight: 9,
              answers: [
                { text_ro: 'Da, toate specificațiile sunt conforme', text_en: 'Yes, all specifications are compliant', weight: 10 },
                { text_ro: 'Parțial, unele circuite nu sunt optim configurate', text_en: 'Partially, some circuits are not optimally configured', weight: 5 },
                { text_ro: 'Nu sunt conforme normelor', text_en: 'Not compliant with standards', weight: 0 },
              ],
            },
            {
              text_ro: 'Cum este realizată instalația sanitară?',
              text_en: 'How is the plumbing system implemented?',
              weight: 8,
              answers: [
                { text_ro: 'În sistem centralizat, conform normelor', text_en: 'In centralized system, according to standards', weight: 10 },
                { text_ro: 'Sistem modular, dar cu unele deficiențe', text_en: 'Modular system, but with some deficiencies', weight: 5 },
                { text_ro: 'Instalație de calitate inferioară sau neconformă', text_en: 'Poor quality or non-compliant installation', weight: 0 },
              ],
            },
          ],
        },
        {
          name_ro: 'Acoperiș',
          name_en: 'Roof',
          questions: [
            {
              text_ro: 'Acoperișul are o structură solidă (ex. șarpantă, placă peste etaj etc.)?',
              text_en: 'Does the roof have a solid structure (e.g. truss, slab over floor, etc.)?',
              weight: 9,
              answers: [
                { text_ro: 'Da, structura este robustă și conformă', text_en: 'Yes, the structure is robust and compliant', weight: 10 },
                { text_ro: 'Structura prezintă unele deficiențe', text_en: 'The structure has some deficiencies', weight: 5 },
                { text_ro: 'Structura este neconformă sau nesigură', text_en: 'The structure is non-compliant or unsafe', weight: 0 },
              ],
            },
            {
              text_ro: 'Ce materiale au fost folosite la executarea acoperișului?',
              text_en: 'What materials were used for roof construction?',
              weight: 8,
              answers: [
                { text_ro: 'Materiale de înaltă calitate, cu eficiență termică', text_en: 'High-quality materials with thermal efficiency', weight: 10 },
                { text_ro: 'Materiale standard, dar conforme', text_en: 'Standard materials, but compliant', weight: 5 },
                { text_ro: 'Materiale de calitate inferioară', text_en: 'Poor quality materials', weight: 0 },
              ],
            },
          ],
        },
      ],
    },
  ];

  try {
    // Clear existing data (in reverse order due to foreign key constraints)
    console.log('🗑️  Clearing existing questions data...');
    await db.delete(answers);
    await db.delete(questions);
    await db.delete(questionCategories);
    await db.delete(propertyTypes);

    for (const propertyTypeData of propertyTypesData) {
      console.log(`📝 Creating property type: ${propertyTypeData.name_ro} / ${propertyTypeData.name_en}`);
      
      // Insert property type
      const [propertyType] = await db
        .insert(propertyTypes)
        .values({
          name_ro: propertyTypeData.name_ro,
          name_en: propertyTypeData.name_en,
        } as NewPropertyType)
        .returning();

      for (const categoryData of propertyTypeData.categories) {
        console.log(`  📂 Creating category: ${categoryData.name_ro} / ${categoryData.name_en}`);
        
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
          console.log(`    ❓ Creating question: ${questionData.text_ro.substring(0, 50)}...`);
          
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
          const answerValues = questionData.answers.map((answerData) => ({
            text_ro: answerData.text_ro,
            text_en: answerData.text_en,
            weight: answerData.weight,
            questionId: question.id,
          } as NewAnswer));

          await db.insert(answers).values(answerValues);
          console.log(`      ✅ Created ${answerValues.length} answers`);
        }
      }
    }

    console.log('');
    console.log('🎉 Questions seed completed successfully!');
    console.log('');
    console.log('Database structure created:');
    console.log(`📊 Property Types: ${propertyTypesData.length}`);
    
    const totalCategories = propertyTypesData.reduce((sum, pt) => sum + pt.categories.length, 0);
    console.log(`📂 Categories: ${totalCategories}`);
    
    const totalQuestions = propertyTypesData.reduce(
      (sum, pt) => sum + pt.categories.reduce((catSum, cat) => catSum + cat.questions.length, 0),
      0
    );
    console.log(`❓ Questions: ${totalQuestions}`);
    
    const totalAnswers = propertyTypesData.reduce(
      (sum, pt) => sum + pt.categories.reduce(
        (catSum, cat) => catSum + cat.questions.reduce((qSum, q) => qSum + q.answers.length, 0),
        0
      ),
      0
    );
    console.log(`💬 Answers: ${totalAnswers}`);

  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    throw error;
  }
}

async function seed() {
  const email = 'admin@admin.com';
  const password = 'admin123';
  const passwordHash = await hashPassword(password);

  console.log('🚀 Starting complete database seed process...');
  console.log('');

  // First, seed the questions data
  await seedQuestions();
  
  console.log('');
  console.log('👤 Creating super user...');

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  let user;
  if (existingUser.length > 0) {
    user = existingUser[0];
    console.log('Super user already exists.');
  } else {
    // Create super user
    [user] = await db
      .insert(users)
      .values([
        {
          name: 'Super Admin',
          email: email,
          passwordHash: passwordHash,
          role: 'owner',
        },
      ])
      .returning();
    console.log('✅ Super user created successfully!');
  }

  // Check if user has a team
  const existingTeamMember = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, user.id))
    .limit(1);

  if (existingTeamMember.length === 0) {
    console.log('Creating default team for super user...');
    
    // Create a default team
    const [team] = await db
      .insert(teams)
      .values({
        name: 'Default Team',
      })
      .returning();

    // Add user to the team
    await db
      .insert(teamMembers)
      .values({
        userId: user.id,
        teamId: team.id,
        role: 'owner',
      });

    console.log(`✅ Default team created and user added as owner!`);
  } else {
    console.log('User already belongs to a team.');
  }

  console.log('');
  console.log('🎯 Seed Summary:');
  console.log('==================');
  console.log('Super User Credentials:');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  console.log('');
  console.log('✅ Questions database populated with property evaluation data');
  console.log('✅ Admin user and team created');
  console.log('');
  console.log('You can now login and start using the property evaluation system!');
}

seed()
  .catch((error) => {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
