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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Search, Filter } from "lucide-react";
import Link from "next/link";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { useState } from "react";
import { DatePickerWithRange } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";

export default function AdminRequestsPage() {
    const { requests, clinics } = useStore();
    const [filterText, setFilterText] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [date, setDate] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });

    const filteredRequests = requests.filter(r => {
        const matchText = (r.id + r.equipmentName + r.requesterUsername).toLowerCase().includes(filterText.toLowerCase());
        const matchStatus = statusFilter === "ALL" || r.status === statusFilter;

        let matchDate = true;
        if (date?.from && date?.to) {
            const reqDate = new Date(r.createDate);
            matchDate = isWithinInterval(reqDate, {
                start: startOfDay(date.from),
                end: endOfDay(date.to)
            });
        } else if (date?.from) {
            const reqDate = new Date(r.createDate);
            matchDate = reqDate >= startOfDay(date.from);
        }

        return matchText && matchStatus && matchDate;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-blue-950 dark:text-blue-50">Quản lý phiếu sửa chữa</h2>
                    <p className="text-muted-foreground">Tất cả các yêu cầu từ các phòng khám</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm mã phiếu, thiết bị..."
                                className="pl-8"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                <SelectItem value="New">Mới tạo</SelectItem>
                                <SelectItem value="Pending_Approval">Chờ duyệt</SelectItem>
                                <SelectItem value="Approved">Đã duyệt</SelectItem>
                                <SelectItem value="In_Progress">Đang sửa</SelectItem>
                                <SelectItem value="Completed">Hoàn thành</SelectItem>
                                <SelectItem value="Rejected">Từ chối</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mã phiếu</TableHead>
                                    <TableHead>Phòng khám</TableHead>
                                    <TableHead>Thiết bị</TableHead>
                                    <TableHead>Lý do hư hỏng</TableHead>
                                    <TableHead>Người yêu cầu</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Chi phí</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map((request) => {
                                    const clinic = clinics.find(c => c.id === request.clinicId);
                                    return (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium text-blue-600">
                                                <Link href={`/admin/requests/${request.id}`} className="hover:underline">
                                                    {request.id}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{clinic?.name}</TableCell>
                                            <TableCell>{request.equipmentName}</TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={request.issueDescription}>
                                                {request.issueDescription}
                                            </TableCell>
                                            <TableCell>{request.requesterUsername}</TableCell>
                                            <TableCell>{format(new Date(request.createDate), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>
                                                <RepairStatusBadge status={request.status} />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {request.repairCost ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(request.repairCost) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Button size="icon" variant="ghost" asChild>
                                                    <Link href={`/admin/requests/${request.id}`}>
                                                        <LinkIcon className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredRequests.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Không tìm thấy phiếu nào.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
