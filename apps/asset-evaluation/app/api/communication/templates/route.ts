import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { communicationTemplates, users } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    // Get user's team
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      with: {
        teamMembers: {
          with: {
            team: true,
          },
        },
      },
    });

    if (!user || !user.teamMembers[0]) {
      return NextResponse.json({ error: 'User not found or not part of a team' }, { status: 404 });
    }

    const teamId = user.teamMembers[0].teamId;

    // Build query conditions
    const conditions = [
      eq(communicationTemplates.teamId, teamId),
      eq(communicationTemplates.isActive, true),
    ];

    if (type && type !== 'all') {
      conditions.push(eq(communicationTemplates.type, type));
    }

    if (category && category !== 'all') {
      conditions.push(eq(communicationTemplates.category, category));
    }

    // Get templates
    const templateList = await db
      .select()
      .from(communicationTemplates)
      .where(and(...conditions))
      .orderBy(desc(communicationTemplates.updatedAt))
      .limit(50);

    return NextResponse.json({
      templates: templateList.map((template) => ({
        id: template.id,
        name: template.name,
        type: template.type,
        category: template.category,
        usage: template.usageCount,
        lastModified: template.updatedAt.toISOString().split('T')[0],
      })),
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type = 'email', category, subject, content } = body;

    if (!name || !content || !category) {
      return NextResponse.json({ error: 'Name, content, and category are required' }, { status: 400 });
    }

    // Get user's team
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      with: {
        teamMembers: {
          with: {
            team: true,
          },
        },
      },
    });

    if (!user || !user.teamMembers[0]) {
      return NextResponse.json({ error: 'User not found or not part of a team' }, { status: 404 });
    }

    const teamId = user.teamMembers[0].teamId;

    // Create new template
    const [newTemplate] = await db
      .insert(communicationTemplates)
      .values({
        teamId,
        name,
        description,
        type,
        category,
        subject,
        content,
        createdBy: user.id,
      })
      .returning();

    return NextResponse.json({
      template: {
        id: newTemplate.id,
        name: newTemplate.name,
        type: newTemplate.type,
        category: newTemplate.category,
        usage: newTemplate.usageCount,
        lastModified: newTemplate.updatedAt.toISOString().split('T')[0],
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
