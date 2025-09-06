import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    // Verificar que la request viene de QStash
    const authHeader = request.headers.get("authorization");
    const qstashSignature = request.headers.get("upstash-signature");

    if (!authHeader && !qstashSignature) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Ejecutar la automatización
    const inactiveCount = await convex.mutation(
      api.clients.markInactiveClients,
      {}
    );

    return NextResponse.json({
      success: true,
      message: `Automatización completada`,
      inactiveClientsCount: inactiveCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

// Endpoint para verificar que el servicio está funcionando
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "mark-inactive-automation",
    timestamp: new Date().toISOString(),
  });
}
