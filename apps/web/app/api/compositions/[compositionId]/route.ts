import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // Import your NextAuth v5 authentication
import {
  getCompositionById,
  updateComposition,
  deleteComposition,
  CompositionData,
} from '@/actions/compositions';

export const GET = auth(async (req, { params }) => {
  const session = req.auth;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user?.id as string;
  const compositionId = params?.id as string;

  try {
    const composition = await getCompositionById(userId, compositionId);

    if (!composition) {
      return NextResponse.json(
        { message: 'Composition not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(composition, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching composition', error: error.message },
      { status: 500 }
    );
  }
});

export const PUT = auth(async (req, { params }) => {
  const session = req.auth;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user?.id as string;
  const compositionId = params?.id as string;

  try {
    const data: CompositionData = await req.json();
    const { name, videoUrl, musicUrl, orientation, animation, volume } = data;

    const updatedCount = await updateComposition(userId, compositionId, {
      name,
      videoUrl,
      musicUrl,
      orientation,
      animation,
      volume,
    });

    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Composition not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Composition updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error updating composition', error: error.message },
      { status: 500 }
    );
  }
});

export const DELETE = auth(async (req, { params }) => {
  const session = req.auth;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user?.id as string;
  const compositionId = params?.id as string;

  try {
    const deletedCount = await deleteComposition(userId, compositionId);

    if (deletedCount === 0) {
      return NextResponse.json(
        { message: 'Composition not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Composition deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error deleting composition', error: error.message },
      { status: 500 }
    );
  }
});
