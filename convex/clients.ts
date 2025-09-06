import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getClients = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("clients").collect();
  },
});

export const getClient = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createClient = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    status: v.union(
      v.literal("Activo"),
      v.literal("Inactivo"),
      v.literal("Potencial")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("clients", {
      ...args,
      lastInteraction: new Date().toISOString(),
      interactions: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateClient = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("Activo"),
        v.literal("Inactivo"),
        v.literal("Potencial")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const addInteraction = mutation({
  args: {
    id: v.id("clients"),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Cliente no encontrado");

    const newInteraction = {
      date: new Date().toISOString(),
      description: args.description,
    };

    return await ctx.db.patch(args.id, {
      interactions: [...client.interactions, newInteraction],
      lastInteraction: newInteraction.date,
      updatedAt: Date.now(),
    });
  },
});

export const markInactiveClients = mutation({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString();

    const clients = await ctx.db.query("clients").collect();
    const inactiveClients = clients.filter(
      (client) =>
        client.lastInteraction < cutoffDate && client.status !== "Inactivo"
    );

    for (const client of inactiveClients) {
      await ctx.db.patch(client._id, {
        status: "Inactivo",
        updatedAt: Date.now(),
      });
    }

    return inactiveClients.length;
  },
});
