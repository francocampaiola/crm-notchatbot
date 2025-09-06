import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(request: NextRequest) {
  const { clientData } = await request.json();

  try {
    const daysSinceLastInteraction = Math.floor(
      (Date.now() - new Date(clientData.lastInteraction).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Contexto para la IA
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
`;

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `Eres un experto en CRM y análisis de clientes. Analiza este cliente y proporciona recomendaciones específicas.

${context}

Por favor, proporciona:
1. Un análisis conciso del estado del cliente (máximo 2 líneas)
2. Una recomendación específica de acción (máximo 2 líneas)

Criterios para el análisis:
- Más de 30 días sin contacto = Cliente inactivo, riesgo alto
- 14-30 días sin contacto = Cliente en riesgo, necesita seguimiento
- 7-14 días sin contacto = Cliente activo, mantener contacto
- Menos de 7 días = Cliente muy activo, excelente relación

Formato de respuesta:
ANÁLISIS: [tu análisis aquí]
RECOMENDACIÓN: [tu recomendación aquí]

Usa emojis apropiados y sé específico con las acciones recomendadas.`,
      temperature: 0.7,
    });

    const lines = text.split("\n");
    let analysis = "";
    let recommendation = "";

    for (const line of lines) {
      if (line.startsWith("ANÁLISIS:")) {
        analysis = line.replace("ANÁLISIS:", "").trim();
      } else if (line.startsWith("RECOMENDACIÓN:")) {
        recommendation = line.replace("RECOMENDACIÓN:", "").trim();
      }
    }

    if (!analysis || !recommendation) {
      analysis = text.split("\n")[0] || "Análisis no disponible";
      recommendation = text.split("\n")[1] || "Recomendación no disponible";
    }

    return NextResponse.json({
      analysis,
      recommendation,
      daysSinceLastInteraction,
      model: "gemini-1.5-flash",
    });
  } catch (error) {
    console.error("Error en análisis de IA:", error);

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
