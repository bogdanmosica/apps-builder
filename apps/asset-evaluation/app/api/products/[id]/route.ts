import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { products, teamMembers } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's team
    const userWithTeam = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (userWithTeam.length === 0) {
      return NextResponse.json({ 
        error: 'No team found. Please create or join a team first.' 
      }, { status: 400 });
    }

    const teamId = userWithTeam[0].teamId;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Check if the product exists and belongs to the user's team
    const existingProduct = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.teamId, teamId)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({ 
        error: 'Product not found or you do not have permission to delete it' 
      }, { status: 404 });
    }

    // Delete the product
    await db
      .delete(products)
      .where(and(eq(products.id, productId), eq(products.teamId, teamId)));

    return NextResponse.json({ 
      message: 'Product deleted successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for fetching individual product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's team
    const userWithTeam = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (userWithTeam.length === 0) {
      return NextResponse.json({ 
        error: 'No team found' 
      }, { status: 400 });
    }

    const teamId = userWithTeam[0].teamId;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Get the product
    const product = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.teamId, teamId)))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json({ 
        error: 'Product not found' 
      }, { status: 404 });
    }

    const formattedProduct = {
      ...product[0],
      formattedPrice: `$${(product[0].price / 100).toFixed(2)}`,
      isActive: product[0].isActive === 'true',
    };

    return NextResponse.json({ product: formattedProduct });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
