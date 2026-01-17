"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History, Wrench, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function EquipmentHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const { equipment, requests } = useStore();
    const id = params.id as string;

    const eq = equipment.find((e) => e.id === id);

    // Filter completed requests for this equipment
    const history = requests
        .filter(r => r.equipmentId === id && r.status === 'Completed')
        .sort((a, b) => new Date(b.completionDate || 0).getTime() - new Date(a.completionDate || 0).getTime());

    const totalCost = history.reduce((acc, curr) => acc + (curr.repairCost || 0), 0);
    const totalRepairs = history.length;

    if (!eq) return <div className="p-8">Không tìm thấy thiết bị.</div>;

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-2 text-muted-foreground hover:text-blue-600 transition-colors cursor-pointer" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại danh sách</span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-blue-950 dark:text-blue-50 flex items-center gap-2">
                        <History className="h-8 w-8 text-blue-600" />
                        Lý lịch thiết bị
                    </h2>
                    <p className="text-muted-foreground">
                        {eq.name} - {eq.model} (S/N: {eq.serialNumber})
                    </p>
                </div>
                <Badge variant={eq.status === 'Active' ? 'default' : 'destructive'} className="text-base px-4 py-1">
                    {eq.status === 'Active' ? 'Đang hoạt động' : eq.status === 'Maintenance' ? 'Đang bảo trì' : 'Đã thanh lý'}
                </Badge>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số lần sửa</CardTitle>
                        <Wrench className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRepairs}</div>
                        <p className="text-xs text-muted-foreground">Lần bảo trì / sửa chữa</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng chi phí</CardTitle>
                        <DollarSign className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalCost)}
                        </div>
                        <p className="text-xs text-muted-foreground">Chi phí trọn đời</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ngày lắp đặt</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{format(new Date(eq.installDate), 'dd/MM/yyyy')}</div>
                        <p className="text-xs text-muted-foreground">Bắt đầu sử dụng</p>
                    </CardContent>
                </Card>
            </div>

            {/* History Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lịch sử sửa chữa</CardTitle>
                    <CardDescription>Chi tiết các phiếu sửa chữa đã hoàn thành</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ngày hoàn thành</TableHead>
                                <TableHead>Mã phiếu</TableHead>
                                <TableHead>Vấn đề / Sự cố</TableHead>
                                <TableHead>Ghi chú kỹ thuật / Thay thế</TableHead>
                                <TableHead className="text-right">Chi phí</TableHead>
                                <TableHead className="text-right">Bảo hành</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {format(new Date(item.completionDate!), 'dd/MM/yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="link" className="p-0 h-auto font-normal" onClick={() => router.push(`/clinic/requests/${item.id}`)}>
                                            {item.id}
                                        </Button>
                                    </TableCell>
                                    <TableCell>{item.issueDescription}</TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={item.technicianNotes}>
                                        {item.technicianNotes || "-"}
                                    </TableCell>
                                    <TableCell className="text-right text-red-600 font-medium">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.repairCost || 0)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.warrantyMonths ? `${item.warrantyMonths} tháng` : "-"}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {history.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Chưa có lịch sử sửa chữa.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
