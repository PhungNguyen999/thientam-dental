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
import { Badge } from "@/components/ui/badge";
import { RepairStatusBadge } from "@/components/RepairStatusBadge";
import { Activity, CheckCircle, Clock, DollarSign, AlertCircle } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { isSameDay, isSameWeek, isSameMonth, parseISO } from "date-fns";

export default function AdminDashboard() {
    const { requests, clinics } = useStore();
    const [period, setPeriod] = useState("month"); // day, week, month, all

    // Filter requests based on time period
    const filteredRequests = requests.filter(r => {
        if (period === "all") return true;

        const date = new Date(r.createDate);
        const now = new Date();

        if (period === "day") return isSameDay(date, now);
        if (period === "week") return isSameWeek(date, now, { weekStartsOn: 1 }); // Monday start
        if (period === "month") return isSameMonth(date, now);

        return true;
    });

    // Calculate stats based on filtered requests
    const totalRequests = filteredRequests.length;
    const pendingRequests = filteredRequests.filter(r => r.status === 'New' || r.status === 'Pending_Approval').length;
    const completedRequests = filteredRequests.filter(r => r.status === 'Completed').length;
    const totalCost = filteredRequests.reduce((acc, curr) => acc + (curr.repairCost || 0), 0);

    // Chart Data: Status Distribution
    const statusData = [
        { name: 'Mới/Chờ duyệt', value: filteredRequests.filter(r => ['New', 'Pending_Approval'].includes(r.status)).length, color: '#f59e0b' },
        { name: 'Đã duyệt/Đang sửa', value: filteredRequests.filter(r => ['Approved', 'In_Progress'].includes(r.status)).length, color: '#6366f1' },
        { name: 'Hoàn thành', value: filteredRequests.filter(r => r.status === 'Completed').length, color: '#10b981' },
        { name: 'Từ chối', value: filteredRequests.filter(r => r.status === 'Rejected').length, color: '#ef4444' },
    ];

    // Clinic Stats logic (highest/lowest requests)
    const clinicStats = clinics.map(clinic => ({
        name: clinic.name,
        count: filteredRequests.filter(r => r.clinicId === clinic.id).length
    })).sort((a, b) => b.count - a.count);

    const mostActiveClinic = clinicStats[0];

    // Equipment Stats logic (most frequently repaired)
    const equipmentStats = filteredRequests.reduce((acc, curr) => {
        const name = curr.equipmentName;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedEquipment = Object.entries(equipmentStats)
        .sort(([, a], [, b]) => b - a)
        .map(([name, count]) => ({ name, count }));

    const mostRepairedEquipment = sortedEquipment[0];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ... existing header ... */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight text-blue-950 dark:text-blue-50">Tổng quan hệ thống</h2>
                <div className="flex items-center space-x-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Chọn thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Hôm nay</SelectItem>
                            <SelectItem value="week">Tuần này</SelectItem>
                            <SelectItem value="month">Tháng này</SelectItem>
                            <SelectItem value="all">Tất cả</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="hidden sm:flex">Xuất báo cáo</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">Tải lại dữ liệu</Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tổng phiếu yêu cầu
                        </CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-950 dark:text-blue-50">{totalRequests}</div>
                        <p className="text-xs text-muted-foreground">
                            Tất cả các trạm
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Chờ xử lý
                        </CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pendingRequests}</div>
                        <p className="text-xs text-muted-foreground">
                            Cần duyệt hoặc đang chờ
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Đã hoàn thành
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{completedRequests}</div>
                        <p className="text-xs text-muted-foreground">
                            Phiếu đã sửa chữa xong
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tổng chi phí (Tháng)
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalCost)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Chi phí sửa chữa thực tế
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Chart */}
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Thống kê trạng thái</CardTitle>
                        <CardDescription>Phân bố phiếu sửa chữa theo trạng thái hiện tại</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Highlights */}
                <Card className="col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>Nổi bật trong tháng</CardTitle>
                        <CardDescription>Các chỉ số đáng chú ý</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">Phòng khám có yêu cầu nhiều nhất</p>
                                <p className="text-sm text-muted-foreground">
                                    {mostActiveClinic?.name || "Chưa có dữ liệu"} ({mostActiveClinic?.count || 0} phiếu)
                                </p>
                            </div>
                        </div>
                        {/* Add more highlights later if needed */}
                        <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-rose-100 flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-rose-600" />
                            </div>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">Thiết bị hỏng nhiều nhất</p>
                                <p className="text-sm text-muted-foreground">
                                    {mostRepairedEquipment ? `${mostRepairedEquipment.name} (${mostRepairedEquipment.count} lần)` : "Chưa có dữ liệu"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Requests Table */}
            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Yêu cầu gần đây</CardTitle>
                            <CardDescription>Danh sách các phiếu yêu cầu mới nhất từ các phòng khám</CardDescription>
                        </div>
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">Xem tất cả</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã phiếu</TableHead>
                                <TableHead>Phòng khám</TableHead>
                                <TableHead>Thiết bị</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Chi phí</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.slice(0, 5).map((request) => {
                                const clinic = clinics.find(c => c.id === request.clinicId);
                                return (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium text-blue-600">{request.id}</TableCell>
                                        <TableCell>{clinic?.name}</TableCell>
                                        <TableCell>{request.equipmentName}</TableCell>
                                        <TableCell>{format(new Date(request.createDate), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>
                                            <RepairStatusBadge status={request.status} />
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {request.repairCost ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(request.repairCost) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="ghost" asChild>
                                                <Link href={`/admin/requests/${request.id}`}>Chi tiết</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {requests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Chưa có dữ liệu yêu cầu nào.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
