import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  clients: defineTable({
    name: v.string(),
    phone: v.string(),
    status: v.union(
      v.literal("Activo"),
      v.literal("Inactivo"),
      v.literal("Potencial")
    ),
    lastInteraction: v.string(),
    interactions: v.array(
      v.object({
        date: v.string(),
        description: v.string(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    deleted: v.boolean(),
  })
    .index("by_phone", ["phone"])
    .index("by_updatedAt", ["updatedAt"])
    .index("by_status_lastInteraction", ["status", "lastInteraction"]),
});
