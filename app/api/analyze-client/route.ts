import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const AnalysisSchema = z.object({
  analysis: z.string().max(280),
  recommendation: z.string().max(280),
});

export async function POST(request: NextRequest) {
  const { clientData } = await request.json();

  try {
    const daysSinceLastInteraction = Math.floor(
      (Date.now() - new Date(clientData.lastInteraction).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const context = `
Cliente: ${clientData.name}
Teléfono: ${clientData.phone}
Estado actual: ${clientData.status}
Días desde última interacción: ${daysSinceLastInteraction}
Última interacción: ${clientData.lastInteraction}
Número de interacciones: ${clientData.interactions.length}
Interacciones recientes: ${clientData.interactions
      .slice(0, 3)
      .map((i: { description: string }) => i.description)
      .join(", ")}
`.trim();

    const { object } = await generateObject({
      model: google("gemini-2.5-pro-002"),
      schema: AnalysisSchema,
      prompt: `Eres un experto en CRM. Analiza el cliente y devuelve un JSON con las claves "analysis" y "recommendation".
Reglas de clasificación:
- > 30 días sin contacto: inactivo, riesgo alto
- 14–30 días: en riesgo
- 7–14 días: activo
- < 7 días: muy activo
Sé conciso (máx 2 líneas por campo) y usa emojis apropiados.
Contexto:
${context}`,
      temperature: 0.5,
    });

    return NextResponse.json({
      ...object,
      daysSinceLastInteraction,
      model: "gemini-2.5-pro-002",
    });
  } catch {
    const daysSinceLastInteraction = Math.floor(
      (Date.now() - new Date(clientData.lastInteraction).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    let analysis = "";
    let recommendation = "";

    if (daysSinceLastInteraction > 30) {
      analysis = `⚠️ Cliente inactivo: ${daysSinceLastInteraction} días sin contacto. Estado actual: "${clientData.status}".`;
      if (clientData.status === "Inactivo") {
        recommendation = `✅ ESTADO CORRECTO: Cliente ya marcado como "Inactivo". Prioridad alta para recontacto.`;
      } else {
        recommendation = `🔴 ACCIÓN REQUERIDA: Cambiar estado a "Inactivo" y contactar urgentemente. Este cliente está en riesgo de pérdida.`;
      }
    } else if (daysSinceLastInteraction > 14) {
      analysis = `⚡ Cliente en riesgo: ${daysSinceLastInteraction} días sin interacción. Estado: "${clientData.status}".`;
      if (clientData.status === "Potencial") {
        recommendation = `✅ ESTADO CORRECTO: Cliente ya marcado como "Potencial". Programar seguimiento en los próximos 3 días.`;
      } else {
        recommendation = `🟡 ACCIÓN RECOMENDADA: Cambiar estado a "Potencial" y programar seguimiento en los próximos 3 días.`;
      }
    } else if (daysSinceLastInteraction > 7) {
      analysis = `✅ Cliente activo: ${daysSinceLastInteraction} días desde última interacción. Estado: "${clientData.status}".`;
      if (clientData.status === "Activo") {
        recommendation = `✅ ESTADO CORRECTO: Cliente en buen estado. Continuar con el ritmo de contacto actual.`;
      } else {
        recommendation = `🟢 ACCIÓN RECOMENDADA: Cambiar estado a "Activo" - cliente está comprometido.`;
      }
    } else {
      analysis = `🎯 Cliente muy activo: ${daysSinceLastInteraction} días desde última interacción. Estado: "${clientData.status}".`;
      if (clientData.status === "Activo") {
        recommendation = `✅ ESTADO CORRECTO: Cliente muy comprometido. Mantener estado "Activo" y continuar la relación.`;
      } else {
        recommendation = `🟢 ACCIÓN RECOMENDADA: Cambiar estado a "Activo" - cliente muy comprometido.`;
      }
    }

    return NextResponse.json({
      analysis,
      recommendation,
      daysSinceLastInteraction,
      model: "fallback-local",
    });
  }
}
