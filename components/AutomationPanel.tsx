"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Zap, Clock, Users, AlertTriangle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function AutomationPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<number | null>(null);

    const markInactiveClients = useMutation(api.clients.markInactiveClients);

    const runAutomation = async () => {
        setIsRunning(true);
        setResult(null);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const inactiveCount = await markInactiveClients();
            setResult(inactiveCount);
        } catch (error) {
            console.error("Error running automation:", error);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Zap className="w-4 h-4" />
                    Automatizar
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-600" />
                        Panel de automatización
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-amber-900 mb-1">Automatización de clientes inactivos</h3>
                                <p className="text-sm text-amber-800">
                                    Esta función marca automáticamente como &quot;Inactivo&quot; a todos los clientes que no han tenido
                                    interacciones en los últimos 30 días.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-5 h-5 text-slate-600" />
                                <h4 className="font-medium text-slate-900">Frecuencia</h4>
                            </div>
                            <p className="text-sm text-slate-600">
                                Se ejecuta automáticamente cada 24 horas
                            </p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Users className="w-5 h-5 text-slate-600" />
                                <h4 className="font-medium text-slate-900">Criterio</h4>
                            </div>
                            <p className="text-sm text-slate-600">
                                Clientes sin interacciones por más de 30 días
                            </p>
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <div className="flex items-center justify-end mb-4">
                            <Button
                                onClick={runAutomation}
                                disabled={isRunning}
                                className="gap-2"
                            >
                                {isRunning ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Ejecutando...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        Ejecutar
                                    </>
                                )}
                            </Button>
                        </div>

                        {result !== null && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="font-medium text-green-900">
                                        Automatización completada
                                    </span>
                                </div>
                                <p className="text-sm text-green-800 mt-1">
                                    {result > 0
                                        ? `${result} cliente${result > 1 ? 's' : ''} marcado${result > 1 ? 's' : ''} como inactivo${result > 1 ? 's' : ''}`
                                        : "No se encontraron clientes para marcar como inactivos"
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
