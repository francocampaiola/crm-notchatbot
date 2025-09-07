import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";

// Inicializar cliente QStash
const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
  baseUrl: process.env.QSTASH_URL || undefined, // Para desarrollo local
});

export async function POST(request: NextRequest) {
  try {
    const { action, schedule } = await request.json();

    if (action === "create") {
      // Crear tarea programada para ejecutar cada 2 minutos
      const response = await qstash.schedules.create({
        destination: `${process.env.NEXT_PUBLIC_APP_URL}/api/automation/mark-inactive`,
        cron: schedule || "*/2 * * * *", // Cada 2 minutos (cron)
        body: JSON.stringify({
          automation: "mark-inactive-clients",
          timestamp: new Date().toISOString(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Tarea programada creada exitosamente",
        scheduleId: response.scheduleId,
        schedule: schedule || "*/2 * * * *",
        nextRun: "Cada 2 minutos",
      });
    }

    if (action === "list") {
      // Listar tareas programadas
      const schedules = await qstash.schedules.list();

      return NextResponse.json({
        success: true,
        schedules: schedules.map((schedule: Record<string, unknown>) => ({
          id: schedule.scheduleId || schedule.id || "unknown",
          destination: schedule.destination,
          cron: schedule.cron,
          createdAt: schedule.createdAt,
          nextRun: schedule.nextRunTime || schedule.nextRun || "No disponible",
        })),
      });
    }

    if (action === "delete") {
      const { scheduleId } = await request.json();

      if (!scheduleId) {
        return NextResponse.json(
          { error: "scheduleId es requerido para eliminar" },
          { status: 400 }
        );
      }

      await qstash.schedules.delete(scheduleId);

      return NextResponse.json({
        success: true,
        message: "Tarea programada eliminada exitosamente",
      });
    }

    return NextResponse.json(
      { error: "Acción no válida. Use: create, list, o delete" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error al configurar QStash",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const schedules = await qstash.schedules.list();

    return NextResponse.json({
      success: true,
      schedules: schedules.map((schedule: Record<string, unknown>) => ({
        id: schedule.scheduleId || schedule.id || "unknown",
        destination: schedule.destination,
        cron: schedule.cron,
        createdAt: schedule.createdAt,
        nextRun: schedule.nextRunTime || schedule.nextRun || "No disponible",
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error al obtener tareas programadas",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
