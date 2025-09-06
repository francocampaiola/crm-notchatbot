import { Skeleton } from "@/components/ui/skeleton";

export function ClientCardSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-lg" />
                    <div className="ml-4">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-28" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
        </div>
    );
}
