import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { candidates, votes } from "@/src/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const results = await db
      .select({
        id: candidates.id,
        costume: candidates.costume,
        photo: candidates.photo,
      })
      .from(candidates);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    return NextResponse.json(
      { error: "Erro ao buscar votos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidateId } = body;

    if (!candidateId) {
      return NextResponse.json(
        { error: "candidateId é obrigatório" },
        { status: 400 }
      );
    }

    // Pega IP do usuário
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Tenta inserir o voto
    await db.insert(votes).values({
      candidateId,
      voterIp: ip,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao votar:", error);

    // Verifica se é erro de duplicate key (constraint única)
    if (error?.cause?.code === "23505" || error?.code === "23505") {
      return NextResponse.json(
        { error: "Você já votou!" },
        { status: 400 }
      );
    }

    // Verifica pela mensagem de erro também
    if (error?.message?.includes("duplicate key") || 
        error?.message?.includes("unique_vote_per_ip")) {
      return NextResponse.json(
        { error: "Você já votou!" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao registrar voto" },
      { status: 500 }
    );
  }
}