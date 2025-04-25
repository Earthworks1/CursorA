import { db } from "@/server/db";
import { insertSousTacheSchema, sousTaches } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tacheId = searchParams.get("tacheId");

    if (!tacheId) {
      return NextResponse.json(
        { error: "ID de la tâche manquant" },
        { status: 400 }
      );
    }

    const sousTachesList = await db.query.sousTaches.findMany({
      where: eq(sousTaches.tacheId, parseInt(tacheId)),
      orderBy: (sousTaches, { desc }) => [desc(sousTaches.created_at)],
    });
    
    return NextResponse.json(sousTachesList);
  } catch (error) {
    console.error("Erreur lors de la récupération des sous-tâches:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sous-tâches" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = insertSousTacheSchema.parse(body);
    
    const newSousTache = await db.insert(sousTaches).values(validatedData).returning();
    return NextResponse.json(newSousTache[0]);
  } catch (error) {
    console.error("Erreur lors de la création de la sous-tâche:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la sous-tâche" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "ID de la sous-tâche manquant" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const sousTache = await db
      .update(sousTaches)
      .set({
        ...body,
        updated_at: new Date(),
      })
      .where(eq(sousTaches.id, parseInt(id)))
      .returning();

    return NextResponse.json(sousTache[0]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la sous-tâche:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la sous-tâche" },
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
        { error: "ID de la sous-tâche manquant" },
        { status: 400 }
      );
    }

    await db.delete(sousTaches).where(eq(sousTaches.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la sous-tâche:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la sous-tâche" },
      { status: 500 }
    );
  }
} 