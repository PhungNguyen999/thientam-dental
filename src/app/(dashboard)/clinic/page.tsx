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
import { RepairStatusBadge } from "@/components/RepairStatusBadge";
import { PlusCircle, Clock, CheckCircle, Wrench } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { isWithinInterval, startOfDay, endOfDay, isSameDay, isSameWeek, isSameMonth } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClinicDashboard() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });
    const [period, setPeriod] = useState("month"); // day, week, month, all

    const { requests, currentUser, equipment } = useStore();

    // Filter requests for this clinic and date range
    const myRequests = requests.filter(r => {
        const isClinicMatch = r.clinicId === currentUser?.clinicId;

        let isDateMatch = true;
        const reqDate = new Date(r.createDate);
        const now = new Date();

        if (date?.from && date?.to) {
            isDateMatch = isWithinInterval(reqDate, {
                start: startOfDay(date.from),
                end: endOfDay(date.to)
            });
        } else if (date?.from) {
            isDateMatch = reqDate >= startOfDay(date.from);
        } else {
            // Use period filter if no custom date range
            if (period === "day") isDateMatch = isSameDay(reqDate, now);
            if (period === "week") isDateMatch = isSameWeek(reqDate, now, { weekStartsOn: 1 });
            if (period === "month") isDateMatch = isSameMonth(reqDate, now);
        }

        return isClinicMatch && isDateMatch;
    });

    const myEquipment = equipment.filter(e => e.clinicId === currentUser?.clinicId);

    const pendingRequests = myRequests.filter(r => r.status === 'New' || r.status === 'Pending_Approval').length;
    const approvedRequests = myRequests.filter(r => r.status === 'Approved').length;
    const completingRequests = myRequests.filter(r => r.status === 'Completed').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight text-blue-950 dark:text-blue-50">Tổng quan phòng khám</h2>
                <div className="flex items-center gap-2">
                    <Select value={period} onValueChange={(val) => { setPeriod(val); setDate({ from: undefined, to: undefined }); }}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Hôm nay</SelectItem>
                            <SelectItem value="week">Tuần này</SelectItem>
                            <SelectItem value="month">Tháng này</SelectItem>
                            <SelectItem value="all">Tất cả</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20" asChild>
                        <Link href="/clinic/create-request">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tạo phiếu
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tổng số thiết bị
                        </CardTitle>
                        <Wrench className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myEquipment.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Thiết bị tại trạm
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Đang chờ duyệt
                        </CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{pendingRequests}</div>
                        <p className="text-xs text-muted-foreground">
                            Phiếu mới tạo
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Đã duyệt / Đang sửa
                        </CardTitle>
                        <Wrench className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{approvedRequests}</div>
                        <p className="text-xs text-muted-foreground">
                            Kỹ thuật sẽ sớm xử lý
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Đã hoàn thành
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{completingRequests}</div>
                        <p className="text-xs text-muted-foreground">
                            Trong tháng này
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow col-span-full md:col-span-2 lg:col-span-1 border-red-100 bg-red-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">
                            Tổng chi phí sửa chữa
                        </CardTitle>
                        <Wrench className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                myRequests
                                    .filter(r => r.status === 'Completed')
                                    .reduce((acc, curr) => acc + (curr.repairCost || 0), 0)
                            )}
                        </div>
                        <p className="text-xs text-red-600/80">
                            Chi phí thực tế
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* My Requests Table */}
            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Phiếu yêu cầu của tôi</CardTitle>
                            <CardDescription>Danh sách các phiếu báo hỏng bạn đã tạo</CardDescription>
                        </div>
                        <DatePickerWithRange date={date} setDate={setDate} />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã phiếu</TableHead>
                                <TableHead>Thiết bị</TableHead>
                                <TableHead>Mô tả lỗi</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Chi phí</TableHead>
                                <TableHead className="text-right">Ngày hoàn thành</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {myRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-medium text-blue-600">
                                        <Link href={`/clinic/requests/${request.id}`} className="hover:underline">
                                            {request.id}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{request.equipmentName}</TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={request.issueDescription}>
                                        {request.issueDescription}
                                    </TableCell>
                                    <TableCell>{format(new Date(request.createDate), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>
                                        <RepairStatusBadge status={request.status} />
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {request.repairCost ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(request.repairCost) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {request.completionDate ? format(new Date(request.completionDate), 'dd/MM/yyyy') : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="ghost" asChild>
                                            <Link href={`/clinic/requests/${request.id}`}>Chi tiết</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {myRequests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Bạn chưa tạo yêu cầu nào.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
