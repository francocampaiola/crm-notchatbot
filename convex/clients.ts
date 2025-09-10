import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getClients = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("clients")
      .withIndex("by_updatedAt")
      .order("desc")
      .collect();
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
    // Validar unicidad de teléfono
    const existing = await ctx.db
      .query("clients")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();
    if (existing) {
      throw new Error("El teléfono ya está registrado en otro cliente");
    }

    const now = Date.now();
    return await ctx.db.insert("clients", {
      ...args,
      lastInteraction: new Date().toISOString(),
      interactions: [],
      createdAt: now,
      updatedAt: now,
      deleted: false,
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
    // Si se intenta cambiar el teléfono, validar unicidad
    if (updates.phone) {
      const existing = await ctx.db
        .query("clients")
        .withIndex("by_phone", (q) => q.eq("phone", updates.phone!))
        .first();
      if (existing && existing._id !== id) {
        throw new Error("El teléfono ya está registrado en otro cliente");
      }
    }
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const updateClientHistorical = mutation({
  args: {
    id: v.id("clients"),
    lastInteraction: v.optional(v.string()),
    interactions: v.optional(
      v.array(
        v.object({
          date: v.string(),
          description: v.string(),
        })
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

    let total = 0;
    for (const status of ["Activo", "Potencial"] as const) {
      const toInactivate = await ctx.db
        .query("clients")
        .withIndex("by_status_lastInteraction", (q) =>
          q.eq("status", status).lt("lastInteraction", cutoffDate)
        )
        .collect();

      for (const client of toInactivate) {
        await ctx.db.patch(client._id, {
          status: "Inactivo",
          updatedAt: Date.now(),
        });
        total++;
      }
    }

    return total;
  },
});

export const deleteClient = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { deleted: true, updatedAt: Date.now() });
    return { ok: true, softDeleted: true };
  },
});
