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
  text: string;
  weight: number;
  answers: Array<{
    text: string;
    weight: number;
  }>;
}

interface CategoryData {
  name: string;
  questions: QuestionData[];
}

interface PropertyTypeData {
  name: string;
  categories: CategoryData[];
}

async function seedQuestions() {
  console.log('🌱 Starting questions seed process...');

  // Property evaluation questions data
  const propertyTypesData: PropertyTypeData[] = [
    {
      name: 'House',
      categories: [
        {
          name: 'Utilități',
          questions: [
            {
              text: 'Este terenul racordat la apă, canal, curent și gaz?',
              weight: 10,
              answers: [
                { text: 'Da, integral racordat', weight: 10 },
                { text: 'Parțial racordat (doar la poartă)', weight: 5 },
                { text: 'Nu este racordat', weight: 0 },
              ],
            },
            {
              text: 'Unde se află utilitățile? Sunt trase în curte sau doar la poartă?',
              weight: 8,
              answers: [
                { text: 'În curte, aproape de casă', weight: 10 },
                { text: 'La poartă, cu posibilitate de prelungire', weight: 7 },
                { text: 'Nespecificat sau incert', weight: 0 },
              ],
            },
          ],
        },
        {
          name: 'Fundația',
          questions: [
            {
              text: 'Fundația a fost executată pe un pământ bine compactat?',
              weight: 9,
              answers: [
                { text: 'Da, pământul a fost compactat corespunzător', weight: 10 },
                { text: 'Parțial compactat', weight: 5 },
                { text: 'Nu a fost compactat corespunzător', weight: 0 },
              ],
            },
            {
              text: 'Au fost folosite materiale de protecție sub prima placă (pietriș, polistiren, hidroizolație)?',
              weight: 9,
              answers: [
                { text: 'Da, toate materialele recomandate au fost folosite', weight: 10 },
                { text: 'Doar unele dintre materiale', weight: 5 },
                { text: 'Nu, nu au fost folosite materiale de protecție', weight: 0 },
              ],
            },
          ],
        },
        {
          name: 'Structura',
          questions: [
            {
              text: 'Ce tip de beton a fost folosit la turnarea elementelor structurale?',
              weight: 10,
              answers: [
                { text: 'Beton de înaltă rezistență (ex. C30/C35)', weight: 10 },
                { text: 'Beton standard (ex. C20)', weight: 7 },
                { text: 'Nu sunt sigure specificațiile betonului', weight: 0 },
              ],
            },
            {
              text: 'Câte bare de fier sunt utilizate în stâlpi și grinzi?',
              weight: 8,
              answers: [
                { text: 'Respectă normele și recomandările tehnice', weight: 10 },
                { text: 'Numărul de bare este sub recomandat', weight: 5 },
                { text: 'Nu sunt prezente armături corespunzătoare', weight: 0 },
              ],
            },
          ],
        },
        {
          name: 'Ferestre',
          questions: [
            {
              text: 'Ferestrele sunt echipate cu benzi de etanșeitate pentru eficiență termică?',
              weight: 8,
              answers: [
                { text: 'Da, sunt complet etanșe', weight: 10 },
                { text: 'Parțial, doar unele ferestre au benzi de etanșeitate', weight: 5 },
                { text: 'Nu, lipsesc aceste detalii', weight: 0 },
              ],
            },
            {
              text: 'Ce tip de termopan a fost instalat la ferestre?',
              weight: 7,
              answers: [
                { text: 'Termopan cu izolație termică și fonică superioară', weight: 10 },
                { text: 'Termopan standard', weight: 5 },
                { text: 'Nu sunt instalate geamuri termopan', weight: 0 },
              ],
            },
          ],
        },
        {
          name: 'Termosistem și tencuială exterioară',
          questions: [
            {
              text: 'Ce tip de material izolant a fost folosit (polistiren, vată bazaltică)?',
              weight: 9,
              answers: [
                { text: 'Material de înaltă performanță (ex. vată bazaltică)', weight: 10 },
                { text: 'Polistiren de calitate medie', weight: 7 },
                { text: 'Izolație de calitate inferioară sau absentă', weight: 0 },
              ],
            },
            {
              text: 'Ce grosime are stratul de izolație termică?',
              weight: 8,
              answers: [
                { text: 'Grosime conform normelor (minim 10–15 cm)', weight: 10 },
                { text: 'Grosime sub recomandat', weight: 5 },
                { text: 'Informație nedeterminată', weight: 0 },
              ],
            },
            {
              text: 'Ce tip de tencuială exterioară a fost aplicat?',
              weight: 7,
              answers: [
                { text: 'Tencuială decorativă de calitate superioară', weight: 10 },
                { text: 'Tencuială standard', weight: 5 },
                { text: 'Tencuială de calitate inferioară', weight: 0 },
              ],
            },
          ],
        },
        {
          name: 'Instalații electrice și sanitare',
          questions: [
            {
              text: 'Tabloul electric respectă normele (număr de circuite, diferențial, protecții)?',
              weight: 9,
              answers: [
                { text: 'Da, toate specificațiile sunt conforme', weight: 10 },
                { text: 'Parțial, unele circuite nu sunt optim configurate', weight: 5 },
                { text: 'Nu sunt conforme normelor', weight: 0 },
              ],
            },
            {
              text: 'Cum este realizată instalația sanitară?',
              weight: 8,
              answers: [
                { text: 'În sistem centralizat, conform normelor', weight: 10 },
                { text: 'Sistem modular, dar cu unele deficiențe', weight: 5 },
                { text: 'Instalație de calitate inferioară sau neconformă', weight: 0 },
              ],
            },
          ],
        },
        {
          name: 'Acoperiș',
          questions: [
            {
              text: 'Acoperișul are o structură solidă (ex. șarpantă, placă peste etaj etc.)?',
              weight: 9,
              answers: [
                { text: 'Da, structura este robustă și conformă', weight: 10 },
                { text: 'Structura prezintă unele deficiențe', weight: 5 },
                { text: 'Structura este neconformă sau nesigură', weight: 0 },
              ],
            },
            {
              text: 'Ce materiale au fost folosite la executarea acoperișului?',
              weight: 8,
              answers: [
                { text: 'Materiale de înaltă calitate, cu eficiență termică', weight: 10 },
                { text: 'Materiale standard, dar conforme', weight: 5 },
                { text: 'Materiale de calitate inferioară', weight: 0 },
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
      console.log(`📝 Creating property type: ${propertyTypeData.name}`);
      
      // Insert property type
      const [propertyType] = await db
        .insert(propertyTypes)
        .values({
          name: propertyTypeData.name,
        } as NewPropertyType)
        .returning();

      for (const categoryData of propertyTypeData.categories) {
        console.log(`  📂 Creating category: ${categoryData.name}`);
        
        // Insert question category
        const [category] = await db
          .insert(questionCategories)
          .values({
            name: categoryData.name,
            propertyTypeId: propertyType.id,
          } as NewQuestionCategory)
          .returning();

        for (const questionData of categoryData.questions) {
          console.log(`    ❓ Creating question: ${questionData.text.substring(0, 50)}...`);
          
          // Insert question
          const [question] = await db
            .insert(questions)
            .values({
              text: questionData.text,
              weight: questionData.weight,
              categoryId: category.id,
            } as NewQuestion)
            .returning();

          // Insert answers for this question
          const answerValues = questionData.answers.map((answerData) => ({
            text: answerData.text,
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
