import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // Import your NextAuth v5 authentication
import {
  getUserCompositions,
  createComposition,
  CompositionData,
} from '@/actions/compositions';

export const GET = auth(async (req) => {
  const session = req.auth;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session?.user?.id as string;

  try {
    const compositions = await getUserCompositions(userId);

    return NextResponse.json(compositions, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching compositions', error: error.message },
      { status: 500 }
    );
  }
});

export const POST = auth(async (req) => {
  const session = req.auth;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session?.user?.id as string;

  try {
    const data: CompositionData = await req.json();
    const { name, videoUrl, musicUrl, orientation, animation, volume } = data;

    const newComposition = await createComposition(userId, {
      name,
      videoUrl,
      musicUrl,
      orientation,
      animation,
      volume,
    });

    return NextResponse.json(newComposition, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error creating composition', error: error.message },
      { status: 500 }
    );
  }
});
