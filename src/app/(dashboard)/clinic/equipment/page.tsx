"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, History } from "lucide-react";
import Link from "next/link";
import { Equipment } from "@/lib/types";
import { EquipmentDialog } from "@/components/EquipmentDialog";

export default function ClinicEquipmentPage() {
    const { equipment, currentUser, deleteEquipment } = useStore();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

    if (!currentUser?.clinicId) return <div>Access Denied</div>;

    const myEquipment = equipment.filter(e => e.clinicId === currentUser.clinicId);

    const handleAdd = () => {
        setEditingEquipment(null);
        setDialogOpen(true);
    };

    const handleEdit = (eq: Equipment) => {
        setEditingEquipment(eq);
        setDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa thiết bị này không?")) {
            deleteEquipment(id);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-blue-950 dark:text-blue-50">Danh sách thiết bị</h2>
                    <p className="text-muted-foreground">Quản lý trang thiết bị tại phòng khám</p>
                </div>
                <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 shadow-md">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Thêm thiết bị
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã TB</TableHead>
                                <TableHead>Tên thiết bị</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Serial Number</TableHead>
                                <TableHead>Ngày lắp đặt</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Tác vụ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {myEquipment.map((eq) => (
                                <TableRow key={eq.id}>
                                    <TableCell className="font-medium">{eq.id}</TableCell>
                                    <TableCell>{eq.name}</TableCell>
                                    <TableCell>{eq.model}</TableCell>
                                    <TableCell className="font-mono text-xs">{eq.serialNumber}</TableCell>
                                    <TableCell>{eq.installDate}</TableCell>
                                    <TableCell>
                                        <Badge variant={eq.status === 'Active' ? 'default' : 'destructive'} className={eq.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}>
                                            {eq.status === 'Active' ? 'Hoạt động' : eq.status === 'Maintenance' ? 'Bảo trì' : 'Thanh lý'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" title="Lịch sử thiết bị" asChild>
                                                <Link href={`/clinic/equipment/${eq.id}`}>
                                                    <History className="h-4 w-4 text-purple-600" />
                                                </Link>
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleEdit(eq)}>
                                                <Pencil className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDelete(eq.id)}>
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {myEquipment.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Chưa có dữ liệu thiết bị.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <EquipmentDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialData={editingEquipment}
            />
        </div>
    );
}
