import {
  pgTable,
  serial,
  integer,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  costume: text("costume").notNull(),
  photo: text("photo").notNull(),
});

export const votes = pgTable(
  "votes",
  {
    id: serial("id").primaryKey(),
    candidateId: integer("candidate_id")
      .notNull()
      .references(() => candidates.id),
    voterIp: text("voter_ip").notNull(),
  },
  (table) => [
    uniqueIndex("unique_vote_per_ip").on(table.voterIp),
  ]
);