"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    PlusCircle,
    Stethoscope,
    LogOut,
    Building2,
    ClipboardList,
    Menu,
    Activity,
    LucideIcon
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { User } from "@/lib/types";

interface Route {
    label: string;
    icon: LucideIcon;
    href: string;
    color: string;
    badge?: number;
}

interface SidebarContentProps {
    routes: Route[];
    pathname: string;
    setOpen: (open: boolean) => void;
    currentUser: User;
    handleLogout: () => void;
    isAdmin: boolean;
}

function SidebarContent({ routes, pathname, setOpen, currentUser, handleLogout, isAdmin }: SidebarContentProps) {
    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
            <div className="px-3 py-2 flex-1">
                <Link href={isAdmin ? "/admin" : "/clinic"} className="flex items-center pl-3 mb-14">
                    <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-2 shadow-lg shadow-blue-600/20">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                        Thientam Dental
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all",
                                pathname === route.href
                                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                                    : "text-muted-foreground"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                            {route.badge && (
                                <div className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {route.badge}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-x-2 px-3 py-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                        {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">{currentUser.fullName}</span>
                        <span className="text-xs text-muted-foreground truncate">{currentUser.role === 'Clinic' ? currentUser.clinicId : 'Quản trị viên'}</span>
                    </div>
                </div>
                <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                    <LogOut className="h-5 w-5 mr-3" />
                    Đăng xuất
                </Button>
            </div>
        </div>
    );
}

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { currentUser, logout, requests } = useStore();
    const [open, setOpen] = useState(false);

    // Calculate pending requests specifically for Admin notification
    const pendingCount = requests.filter(r => r.status === 'New' || r.status === 'Pending_Approval').length;

    // Calculate updates for Clinic notification
    const clinicNotificationCount = currentUser?.clinicId
        ? requests.filter(r =>
            r.clinicId === currentUser.clinicId &&
            (r.status === 'Approved' || (r.status === 'Completed' && !r.repairCost))
        ).length
        : 0;

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    if (!currentUser) return null;

    const isAdmin = currentUser.role === "Admin";

    const routes: Route[] = isAdmin
        ? [
            {
                label: "Tổng quan",
                icon: LayoutDashboard,
                href: "/admin",
                color: "text-sky-500",
            },
            {
                label: "Tất cả phiếu sửa chữa",
                icon: ClipboardList,
                href: "/admin/requests",
                color: "text-violet-500",
                badge: pendingCount > 0 ? pendingCount : undefined,
            },
            {
                label: "Danh sách phòng khám",
                icon: Building2,
                href: "/admin/clinics",
                color: "text-pink-700",
            },
        ]
        : [
            {
                label: "Tổng quan phòng khám",
                icon: LayoutDashboard,
                href: "/clinic",
                color: "text-sky-500",
                badge: clinicNotificationCount > 0 ? clinicNotificationCount : undefined,
            },
            {
                label: "Tạo phiếu sửa chữa",
                icon: PlusCircle,
                href: "/clinic/create-request",
                color: "text-emerald-500",
            },
            {
                label: "Thiết bị của tôi",
                icon: Stethoscope,
                href: "/clinic/equipment",
                color: "text-indigo-500",
            },
        ];

    return (
        <>
            {/* Mobile Sidebar */}
            <div className="md:hidden flex items-center p-4 border-b bg-white dark:bg-slate-900">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 bg-slate-50 dark:bg-slate-900 border-r-slate-200 dark:border-r-slate-800 w-72">
                        <SidebarContent
                            routes={routes}
                            pathname={pathname}
                            setOpen={setOpen}
                            currentUser={currentUser}
                            handleLogout={handleLogout}
                            isAdmin={isAdmin}
                        />
                    </SheetContent>
                </Sheet>
                <div className="ml-4 font-bold text-blue-900 dark:text-blue-100">Thientam Dental</div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-[80] bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                <SidebarContent
                    routes={routes}
                    pathname={pathname}
                    setOpen={setOpen}
                    currentUser={currentUser}
                    handleLogout={handleLogout}
                    isAdmin={isAdmin}
                />
            </div>
        </>
    );
}
