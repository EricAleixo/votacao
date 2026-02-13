import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { candidates, votes } from "@/src/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET() {
  try {
    // Busca candidatos com contagem de votos
    const results = await db
      .select({
        id: candidates.id,
        costume: candidates.costume,
        photo: candidates.photo,
        voteCount: sql<number>`count(${votes.id})::int`.as('vote_count'),
      })
      .from(candidates)
      .leftJoin(votes, eq(candidates.id, votes.candidateId))
      .groupBy(candidates.id)
      .orderBy(sql`count(${votes.id}) DESC`);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    return NextResponse.json(
      { error: "Erro ao buscar ranking" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { costume, photo } = body;

    if (!costume || !photo) {
      return NextResponse.json(
        { error: "costume e photo são obrigatórios" },
        { status: 400 }
      );
    }

    // Insere o novo candidato
    const [newCandidate] = await db.insert(candidates).values({
      costume: costume.trim(),
      photo: photo.trim(),
    }).returning();

    return NextResponse.json(newCandidate, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao adicionar candidato:", error);
    return NextResponse.json(
      { error: "Erro ao adicionar candidato" },
      { status: 500 }
    );
  }
  
}