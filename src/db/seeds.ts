import "dotenv/config";
import { db } from "./index";
import { votes } from "./schema";

async function seed() {
  try {
    console.log("📋 Buscando todos os votos...");

    const allVotes = await db.query.votes.findMany();

    console.table(allVotes);

    console.log("✅ Consulta finalizada.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao buscar votos:", error);
    process.exit(1);
  }
}

seed();
