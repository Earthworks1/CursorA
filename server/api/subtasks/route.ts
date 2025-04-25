import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { sousTaches, insertSousTacheSchema } from "@/shared/schema";
import { eq } from "drizzle-orm";

// GET - Récupérer toutes les sous-tâches d'une tâche spécifique
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tacheId = searchParams.get("tacheId");

    if (!tacheId) {
      return NextResponse.json(
        { error: "L'ID de la tâche est requis" },
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

// POST - Créer une nouvelle sous-tâche
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = insertSousTacheSchema.parse(body);

    const newSousTache = await db
      .insert(sousTaches)
      .values(validatedData)
      .returning();

    return NextResponse.json(newSousTache[0]);
  } catch (error) {
    console.error("Erreur lors de la création de la sous-tâche:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la sous-tâche" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une sous-tâche
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "L'ID de la sous-tâche est requis" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = insertSousTacheSchema.partial().parse(body);

    const updatedSousTache = await db
      .update(sousTaches)
      .set({ ...validatedData, updated_at: new Date() })
      .where(eq(sousTaches.id, parseInt(id)))
      .returning();

    if (!updatedSousTache.length) {
      return NextResponse.json(
        { error: "Sous-tâche non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSousTache[0]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la sous-tâche:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la sous-tâche" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une sous-tâche
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "L'ID de la sous-tâche est requis" },
        { status: 400 }
      );
    }

    await db.delete(sousTaches).where(eq(sousTaches.id, parseInt(id)));

    return NextResponse.json({
      message: "Sous-tâche supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la sous-tâche:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la sous-tâche" },
      { status: 500 }
    );
  }
} 