import { Id } from "../convex/_generated/dataModel";

export interface Client {
  _id: Id<"clients">;
  name: string;
  phone: string;
  status: "Activo" | "Inactivo" | "Potencial";
  lastInteraction: string;
  interactions: Interaction[];
  createdAt: number;
  updatedAt: number;
  deleted: boolean;
}

export interface Interaction {
  date: string;
  description: string;
}

export interface NewClient {
  name: string;
  phone: string;
  status: "Activo" | "Inactivo" | "Potencial";
}
