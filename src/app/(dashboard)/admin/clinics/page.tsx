"use client";

import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { MapPin, Phone } from "lucide-react";

export default function AdminClinicsPage() {
    const { clinics, equipment, requests } = useStore();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-blue-950 dark:text-blue-50">Danh sách phòng khám</h2>
                <p className="text-muted-foreground">Quản lý các chi nhánh nha khoa trong hệ thống</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {clinics.map(clinic => {
                    const clinicEquipment = equipment.filter(e => e.clinicId === clinic.id).length;
                    const clinicRequests = requests.filter(r => r.clinicId === clinic.id).length;
                    const clinicPending = requests.filter(r => r.clinicId === clinic.id && (r.status === 'New' || r.status === 'Pending_Approval')).length;

                    return (
                        <Card key={clinic.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{clinic.name}</CardTitle>
                                <CardDescription className="flex items-center mt-1">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    {clinic.id}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-2 text-center mt-2">
                                    <div className="bg-slate-50 p-2 rounded">
                                        <div className="text-xl font-bold text-slate-700">{clinicEquipment}</div>
                                        <div className="text-[10px] uppercase text-muted-foreground font-semibold">Thiết bị</div>
                                    </div>
                                    <div className="bg-blue-50 p-2 rounded">
                                        <div className="text-xl font-bold text-blue-700">{clinicRequests}</div>
                                        <div className="text-[10px] uppercase text-muted-foreground font-semibold">Yêu cầu</div>
                                    </div>
                                    <div className="bg-amber-50 p-2 rounded">
                                        <div className="text-xl font-bold text-amber-700">{clinicPending}</div>
                                        <div className="text-[10px] uppercase text-muted-foreground font-semibold">Đang chờ</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
