"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bot, Sparkles, Brain, Zap } from "lucide-react";
import { Client } from "@/types/client";

interface AIAssistantProps {
    client?: Client | null;
    onAnalyze?: (analysis: string) => void;
    onCategorize?: (category: string) => void;
}

export function AIAssistant({ client, onCategorize }: AIAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState("");
    const [suggestion, setSuggestion] = useState("");

    // Simulación de análisis de IA
    const analyzeClient = async () => {
        setIsAnalyzing(true);

        await new Promise(resolve => setTimeout(resolve, 2000));

        if (client) {
            const daysSinceLastInteraction = Math.floor(
                (Date.now() - new Date(client.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
            );

            let analysisText = "";
            let suggestionText = "";

            if (daysSinceLastInteraction > 30) {
                analysisText = `Este cliente lleva ${daysSinceLastInteraction} días sin contacto. Su estado actual es "${client.status}".`;
                suggestionText = "Recomiendo marcarlo como prioridad alta y contactarlo inmediatamente para reactivar la relación.";
            } else if (daysSinceLastInteraction > 14) {
                analysisText = `Cliente con ${daysSinceLastInteraction} días sin interacción. Estado: "${client.status}".`;
                suggestionText = "Sugiero programar un seguimiento en los próximos días para mantener el contacto activo.";
            } else {
                analysisText = `Cliente activo con ${daysSinceLastInteraction} días desde la última interacción.`;
                suggestionText = "Mantener el ritmo de contacto actual. Cliente en buen estado.";
            }

            setAnalysis(analysisText);
            setSuggestion(suggestionText);
        }

        setIsAnalyzing(false);
    };

    const categorizeClient = async () => {
        setIsAnalyzing(true);

        await new Promise(resolve => setTimeout(resolve, 1500));

        if (client) {
            const daysSinceLastInteraction = Math.floor(
                (Date.now() - new Date(client.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
            );

            let newCategory = "";

            if (daysSinceLastInteraction > 30) {
                newCategory = "Inactivo";
            } else if (daysSinceLastInteraction > 7) {
                newCategory = "Potencial";
            } else {
                newCategory = "Activo";
            }

            onCategorize?.(newCategory);
            setAnalysis(`Cliente categorizado automáticamente como: ${newCategory}`);
            setSuggestion(`Basado en ${daysSinceLastInteraction} días sin interacción, la IA sugiere este estado.`);
        }

        setIsAnalyzing(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Bot className="w-4 h-4" />
                    Asistente IA
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-600" />
                        Asistente de Inteligencia Artificial
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {client && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-medium text-blue-900 mb-2">Cliente Seleccionado</h3>
                            <p className="text-blue-800">{client.name}</p>
                            <p className="text-sm text-blue-600">
                                Estado: {client.status} | Última interacción: {new Date(client.lastInteraction).toLocaleDateString()}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            onClick={analyzeClient}
                            disabled={isAnalyzing || !client}
                            className="h-20 flex flex-col gap-2"
                        >
                            <Sparkles className="w-6 h-6" />
                            <span>Analizar Cliente</span>
                        </Button>

                        <Button
                            onClick={categorizeClient}
                            disabled={isAnalyzing || !client}
                            variant="outline"
                            className="h-20 flex flex-col gap-2"
                        >
                            <Zap className="w-6 h-6" />
                            <span>Categorizar Automáticamente</span>
                        </Button>
                    </div>

                    {isAnalyzing && (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="text-slate-600">Analizando con IA...</span>
                            </div>
                        </div>
                    )}

                    {analysis && !isAnalyzing && (
                        <div className="space-y-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <h4 className="font-medium text-slate-900 mb-2">Análisis de IA</h4>
                                <p className="text-slate-700">{analysis}</p>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h4 className="font-medium text-amber-900 mb-2">Recomendación</h4>
                                <p className="text-amber-800">{suggestion}</p>
                            </div>
                        </div>
                    )}

                    {!client && (
                        <div className="text-center py-8 text-slate-500">
                            <Bot className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>Selecciona un cliente para usar el asistente de IA</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
