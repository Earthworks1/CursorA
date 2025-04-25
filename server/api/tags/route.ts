import { db } from "@/server/db";
import { insertTagSchema, tags } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allTags = await db.query.tags.findMany({
      orderBy: (tags, { desc }) => [desc(tags.created_at)],
    });
    return NextResponse.json(allTags);
  } catch (error) {
    console.error("Erreur lors de la récupération des tags:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = insertTagSchema.parse(body);
    
    const newTag = await db.insert(tags).values(validatedData).returning();
    return NextResponse.json(newTag[0]);
  } catch (error) {
    console.error("Erreur lors de la création du tag:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du tag" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "ID du tag manquant" },
        { status: 400 }
      );
    }

    await db.delete(tags).where(eq(tags.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du tag:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du tag" },
      { status: 500 }
    );
  }
} 