"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AppSidebar } from "@/components/AppSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentUser } = useStore();
    const router = useRouter();

    // Protect routes
    useEffect(() => {
        // Small delay to allow store rehydration if needed, but zustand persist is usually sync-ish
        // However, in Next.js SSR, we might face hydration mismatch if we check immediately.
        // For now, simple check.
        const checkAuth = () => {
            const user = useStore.getState().currentUser;
            if (!user) {
                router.push("/");
            }
        };

        checkAuth();
    }, [router]);

    if (!currentUser) {
        return null; // Or a loading spinner
    }

    return (
        <div className="h-full relative">
            <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-[80]">
                {/* Sidebar placeholder for layout spacing, the real one is fixed in AppSidebar */}
            </div>
            <AppSidebar />
            <main className="md:pl-72 h-full bg-slate-50/50 dark:bg-slate-950">
                <div className="p-4 md:p-8 max-w-7xl mx-auto h-full space-y-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
