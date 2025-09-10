"use client";

import { useState } from "react";

import { Client, NewClient } from "@/types/client";
import { Id } from "../convex/_generated/dataModel";

import { AIAssistant } from "@/components/AIAssistant";
import { AutomationPanel } from "@/components/AutomationPanel";
import { ClientCardSkeleton } from "@/components/ClientCardSkeleton";
import { StatsSkeleton } from "@/components/StatsSkeleton";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Plus, Phone, Calendar, User, Search, Filter, Sparkles, ArrowUpDown, ArrowDownUp } from "lucide-react";

export default function Home() {
  const clients = useQuery(api.clients.getClients);
  const createClient = useMutation(api.clients.createClient);
  const updateClient = useMutation(api.clients.updateClient);
  const deleteClient = useMutation(api.clients.deleteClient);
  const addInteraction = useMutation(api.clients.addInteraction);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortByLastInteraction, setSortByLastInteraction] = useState(false);
  const [newClient, setNewClient] = useState<NewClient>({
    name: "",
    phone: "",
    status: "Potencial"
  });
  const [newInteraction, setNewInteraction] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<{ analysis: string, suggestion: string } | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateClient = async () => {
    if (newClient.name && newClient.phone) {
      await createClient(newClient);
      setNewClient({ name: "", phone: "", status: "Potencial" as const });
      setIsDialogOpen(false);
    }
  };

  const handleAddInteraction = async () => {
    if (selectedClient && newInteraction) {
      await addInteraction({
        id: selectedClient._id,
        description: newInteraction
      });

      // Actualizar el estado local del cliente seleccionado
      const newInteractionObj = {
        date: new Date().toISOString(),
        description: newInteraction
      };

      setSelectedClient({
        ...selectedClient,
        interactions: [...selectedClient.interactions, newInteractionObj],
        lastInteraction: newInteractionObj.date,
        updatedAt: Date.now()
      });

      setNewInteraction("");
    }
  };

  const handleCategorizeClient = async (newStatus: string) => {
    if (selectedClient) {
      await updateClient({
        id: selectedClient._id,
        status: newStatus as "Activo" | "Inactivo" | "Potencial"
      });
      setSelectedClient({ ...selectedClient, status: newStatus as "Activo" | "Inactivo" | "Potencial" });
    }
  };

  const handleAnalysisComplete = (analysis: string, suggestion: string) => {
    setAiAnalysis({ analysis, suggestion });
  };

  const handleApplyRecommendation = async () => {
    if (selectedClient && aiAnalysis) {
      const daysSinceLastInteraction = Math.floor(
        (Date.now() - new Date(selectedClient.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
      );

      let newStatus = "";
      if (daysSinceLastInteraction > 30) {
        newStatus = "Inactivo";
      } else if (daysSinceLastInteraction > 7) {
        newStatus = "Potencial";
      } else {
        newStatus = "Activo";
      }

      // Solo aplicar cambio si el estado actual es diferente al recomendado
      if (selectedClient.status !== newStatus) {
        await handleCategorizeClient(newStatus);
        setAiAnalysis(null);
      } else {
        // Si el estado ya es correcto, solo limpiar el análisis
        setAiAnalysis(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activo": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Inactivo": return "bg-red-100 text-red-800 border-red-200";
      case "Potencial": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const nonDeletedClients = clients?.filter(c => !c.deleted) ?? [];
  const filteredAndSortedClients = nonDeletedClients.filter(client => {
    if (client.deleted === true) return false;
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortByLastInteraction) {
      return new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime();
    }
    return 0; // Sin ordenamiento adicional
  });

  const getStatusStats = () => {
    if (!clients) return { active: 0, inactive: 0, potential: 0, total: 0 };
    const src = nonDeletedClients;
    return {
      active: src.filter(c => c.status === "Activo").length,
      inactive: src.filter(c => c.status === "Inactivo").length,
      potential: src.filter(c => c.status === "Potencial").length,
      total: src.length,
    };
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                <span className="sm:hidden">CRM</span>
                <span className="hidden sm:inline">CRM de Clientes con IA</span>
              </h1>
            </div>
            <div className="flex gap-3">
              <AutomationPanel />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {clients === undefined ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total de clientes</p>
                  <p className="text-2xl md:text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Activos</p>
                  <p className="text-2xl md:text-3xl font-bold text-emerald-600">{stats.active}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Potenciales</p>
                  <p className="text-2xl md:text-3xl font-bold text-amber-600">{stats.potential}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-amber-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Inactivos</p>
                  <p className="text-2xl md:text-3xl font-bold text-red-600">{stats.inactive}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                  <SelectItem value="Potencial">Potencial</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={sortByLastInteraction ? "default" : "outline"}
                onClick={() => setSortByLastInteraction(!sortByLastInteraction)}
                className="gap-2"
              >
                {sortByLastInteraction ? (
                  <>
                    <ArrowDownUp className="w-4 h-4" />
                    Ordenado por interacción
                  </>
                ) : (
                  <>
                    <ArrowUpDown className="w-4 h-4" />
                    Ordenar por interacción
                  </>
                )}
              </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuevo cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm mx-auto">
                <DialogHeader>
                  <DialogTitle>Agregar nuevo cliente</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="mb-2">Nombre completo</Label>
                    <Input
                      id="name"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-2">Teléfono</Label>
                    <Input
                      id="phone"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      placeholder="Ej: +54 11 1234 5678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status" className="mb-2">Estado inicial</Label>
                    <Select
                      value={newClient.status}
                      onValueChange={(value: "Activo" | "Inactivo" | "Potencial") =>
                        setNewClient({ ...newClient, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                        <SelectItem value="Potencial">Potencial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateClient} className="w-full">
                    Crear cliente
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {clients === undefined ? (
            // Mostrar 6 skeletons mientras cargan los datos
            Array.from({ length: 6 }).map((_, index) => (
              <ClientCardSkeleton key={index} />
            ))
          ) : (
            filteredAndSortedClients?.map((client) => (
              <div
                key={client._id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => {
                  setSelectedClient(client);
                  setAiAnalysis(null); // Limpiar análisis de IA al abrir nuevo cliente
                  setEditName(client.name);
                  setEditPhone(client.phone);
                  setEditError(null);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm md:text-lg">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-base md:text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                        {client.name}
                      </h3>
                      <p className="text-sm text-slate-500">Cliente</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-slate-600">
                    <Phone className="w-4 h-4 mr-3 text-slate-400" />
                    <span className="text-sm">{client.phone}</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Calendar className="w-4 h-4 mr-3 text-slate-400" />
                    <span className="text-sm">
                      {new Date(client.lastInteraction).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredAndSortedClients?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron clientes</h3>
            <p className="text-slate-500 mb-6">Empezá agregando tu primer cliente</p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar cliente
            </Button>
          </div>
        )}

        {/* Client Detail Modal */}
        {selectedClient && (
          <>
            <Dialog open={!!selectedClient} onOpenChange={() => {
              setSelectedClient(null);
              setAiAnalysis(null); // Limpiar análisis de IA al cerrar modal
              setEditError(null);
            }}>
              <DialogContent className="max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                      {selectedClient.name.charAt(0).toUpperCase()}
                    </div>
                    {selectedClient.name}
                    <AIAssistant
                      client={selectedClient}
                      onCategorize={handleCategorizeClient}
                      onAnalysisComplete={handleAnalysisComplete}
                    />
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Sugerencias de IA */}
                  {aiAnalysis && (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">AI</span>
                        </div>
                        <h4 className="font-medium text-slate-900 text-sm">Sugerencias de IA</h4>
                      </div>

                      <div className="bg-white/70 border border-blue-200 rounded-lg p-3">
                        <h5 className="font-medium text-blue-900 mb-1 text-xs">Análisis</h5>
                        <p className="text-blue-800 text-xs">{aiAnalysis.analysis}</p>
                      </div>

                      <div className="bg-white/70 border border-amber-200 rounded-lg p-3">
                        <h5 className="font-medium text-amber-900 mb-1 text-xs">Recomendación</h5>
                        <p className="text-amber-800 text-xs">{aiAnalysis.suggestion}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleApplyRecommendation}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8 bg-white/80 hover:bg-white"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Aplicar
                        </Button>
                        <Button
                          onClick={() => setAiAnalysis(null)}
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 bg-white/80 hover:bg-white"
                        >
                          Descartar
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Nombre</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nombre del cliente"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Teléfono</Label>
                      <Input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Teléfono del cliente"
                        className="mt-1"
                      />
                    </div>
                    {editError && (
                      <p className="text-sm text-red-600">{editError}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-600 mb-2 block">Estado</Label>
                    <Select
                      value={selectedClient.status}
                      onValueChange={async (value: "Activo" | "Inactivo" | "Potencial") => {
                        await updateClient({ id: selectedClient._id, status: value });
                        setSelectedClient({ ...selectedClient, status: value });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                        <SelectItem value="Potencial">Potencial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-600 mb-2 block">Agregar interacción</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newInteraction}
                        onChange={(e) => setNewInteraction(e.target.value)}
                        placeholder="Ej: Llamado realizado el 18/08/25"
                        className="flex-1"
                      />
                      <Button onClick={handleAddInteraction} disabled={!newInteraction.trim()}>
                        Agregar
                      </Button>
                    </div>
                  </div>


                  <div>
                    <Label className="text-sm font-medium text-slate-600 mb-3 block">Historial de Interacciones</Label>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedClient.interactions?.length > 0 ? (
                        selectedClient.interactions.map((interaction, index: number) => (
                          <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-sm text-slate-900 mb-1">{interaction.description}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(interaction.date).toLocaleString('es-ES')}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-sm">No hay interacciones registradas</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Footer acciones */}
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="cursor-pointer"
                    disabled={isSaving}
                  >
                    Eliminar cliente
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!selectedClient) return;
                      try {
                        setIsSaving(true);
                        setEditError(null);
                        const updates: { id: Id<"clients">; name?: string; phone?: string } = { id: selectedClient._id };
                        if (editName && editName !== selectedClient.name) updates.name = editName;
                        if (editPhone && editPhone !== selectedClient.phone) updates.phone = editPhone;
                        if (updates.name || updates.phone) {
                          await updateClient(updates);
                          setSelectedClient({ ...selectedClient, name: editName, phone: editPhone, updatedAt: Date.now() });
                        }
                      } catch (err) {
                        setEditError(err instanceof Error ? err.message : "Error al actualizar");
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    className="cursor-pointer"
                    disabled={isDeleting}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>Guardar cambios</>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Confirmación de eliminación */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={(open) => {
              if (!open) setIsDeleting(false);
              setIsDeleteConfirmOpen(open);
            }}>
              <DialogContent className="w-110 mx-auto">
                <DialogHeader>
                  <DialogTitle>¿Estás seguro de eliminar a este cliente?</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-600">Esta acción no se puede deshacer.</p>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (!selectedClient) return;
                      try {
                        setIsDeleting(true);
                        await deleteClient({ id: selectedClient._id });
                        setIsDeleteConfirmOpen(false);
                        setSelectedClient(null);
                      } catch (err) {
                        setEditError(err instanceof Error ? err.message : "Error al eliminar");
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    className="cursor-pointer"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                        Eliminando...
                      </>
                    ) : (
                      <>Eliminar definitivamente</>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}