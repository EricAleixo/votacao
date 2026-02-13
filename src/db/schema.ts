import { pgTable, serial, text, timestamp, integer, unique } from "drizzle-orm/pg-core";

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  costume: text("costume").notNull(),
  photo: text("photo").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id")
    .notNull()
    .references(() => candidates.id, { onDelete: "cascade" }),
  deviceId: text("device_id").notNull(), // Mudou de voterIp para deviceId
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    // Constraint única: um dispositivo só pode votar uma vez
    uniqueVotePerDevice: unique("unique_vote_per_device").on(table.deviceId),
  };
});