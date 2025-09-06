"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Zap } from "lucide-react";
import { Client } from "@/types/client";

interface AIAssistantProps {
    client?: Client | null;
    onAnalyze?: (analysis: string) => void;
    onCategorize?: (category: string) => void;
    onAnalysisComplete?: (analysis: string, suggestion: string) => void;
}

export function AIAssistant({ client, onCategorize, onAnalysisComplete }: AIAssistantProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [analysis, setAnalysis] = useState("");
    const [suggestion, setSuggestion] = useState("");

    // Análisis directo de IA
    const analyzeClient = async () => {
        if (!client) return;

        setIsAnalyzing(true);
        setShowResults(false);

        await new Promise(resolve => setTimeout(resolve, 1500));

        const daysSinceLastInteraction = Math.floor(
            (Date.now() - new Date(client.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
        );

        let analysisText = "";
        let suggestionText = "";

        if (daysSinceLastInteraction > 30) {
            analysisText = `⚠️ Cliente inactivo: ${daysSinceLastInteraction} días sin contacto. Estado actual: "${client.status}".`;
            if (client.status === "Inactivo") {
                suggestionText = `✅ ESTADO CORRECTO: Cliente ya marcado como "Inactivo". Prioridad alta para recontacto.`;
            } else {
                suggestionText = `🔴 ACCIÓN REQUERIDA: Cambiar estado a "Inactivo" y contactar urgentemente. Este cliente está en riesgo de pérdida.`;
            }
        } else if (daysSinceLastInteraction > 14) {
            analysisText = `⚡ Cliente en riesgo: ${daysSinceLastInteraction} días sin interacción. Estado: "${client.status}".`;
            if (client.status === "Potencial") {
                suggestionText = `✅ ESTADO CORRECTO: Cliente ya marcado como "Potencial". Programar seguimiento en los próximos 3 días.`;
            } else {
                suggestionText = `🟡 ACCIÓN RECOMENDADA: Cambiar estado a "Potencial" y programar seguimiento en los próximos 3 días.`;
            }
        } else if (daysSinceLastInteraction > 7) {
            analysisText = `✅ Cliente activo: ${daysSinceLastInteraction} días desde última interacción. Estado: "${client.status}".`;
            if (client.status === "Activo") {
                suggestionText = `✅ ESTADO CORRECTO: Cliente en buen estado. Continuar con el ritmo de contacto actual.`;
            } else {
                suggestionText = `🟢 ACCIÓN RECOMENDADA: Cambiar estado a "Activo" - cliente está comprometido.`;
            }
        } else {
            analysisText = `🎯 Cliente muy activo: ${daysSinceLastInteraction} días desde última interacción. Estado: "${client.status}".`;
            if (client.status === "Activo") {
                suggestionText = `✅ ESTADO CORRECTO: Cliente muy comprometido. Mantener estado "Activo" y continuar la relación.`;
            } else {
                suggestionText = `🟢 ACCIÓN RECOMENDADA: Cambiar estado a "Activo" - cliente muy comprometido.`;
            }
        }

        setAnalysis(analysisText);
        setSuggestion(suggestionText);
        setShowResults(true);
        setIsAnalyzing(false);

        // Pasar los resultados al componente padre
        onAnalysisComplete?.(analysisText, suggestionText);
    };

    const categorizeClient = async () => {
        setIsAnalyzing(true);

        await new Promise(resolve => setTimeout(resolve, 1500));

        if (client) {
            const daysSinceLastInteraction = Math.floor(
                (Date.now() - new Date(client.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
            );

            let newCategory = "";
            let reason = "";

            if (daysSinceLastInteraction > 30) {
                newCategory = "Inactivo";
                reason = `Más de 30 días sin contacto (${daysSinceLastInteraction} días)`;
            } else if (daysSinceLastInteraction > 7) {
                newCategory = "Potencial";
                reason = `Entre 7-30 días sin contacto (${daysSinceLastInteraction} días)`;
            } else {
                newCategory = "Activo";
                reason = `Menos de 7 días sin contacto (${daysSinceLastInteraction} días)`;
            }

            onCategorize?.(newCategory);
            setAnalysis(`✅ Cliente categorizado automáticamente como: "${newCategory}"`);
            setSuggestion(`📊 Criterio aplicado: ${reason}. Estado actualizado según el algoritmo de IA.`);
        }

        setIsAnalyzing(false);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            onClick={analyzeClient}
            disabled={isAnalyzing || !client}
        >
            {isAnalyzing ? (
                <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    Analizando...
                </>
            ) : (
                <>
                    <Bot className="w-3 h-3" />
                    Analizar con IA
                </>
            )}
        </Button>
    );
}
