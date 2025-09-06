import { Skeleton } from "@/components/ui/skeleton";

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total de clientes */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-12" />
                    </div>
                    <Skeleton className="w-12 h-12 rounded-lg" />
                </div>
            </div>

            {/* Clientes Activos */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-8 w-12" />
                    </div>
                    <Skeleton className="w-12 h-12 rounded-lg" />
                </div>
            </div>

            {/* Clientes Potenciales */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-8 w-12" />
                    </div>
                    <Skeleton className="w-12 h-12 rounded-lg" />
                </div>
            </div>

            {/* Clientes Inactivos */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-4 w-18 mb-2" />
                        <Skeleton className="h-8 w-12" />
                    </div>
                    <Skeleton className="w-12 h-12 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
