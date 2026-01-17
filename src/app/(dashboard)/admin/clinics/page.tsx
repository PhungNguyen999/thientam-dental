"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { isWithinInterval, startOfDay, endOfDay, isSameDay, isSameWeek, isSameMonth } from "date-fns";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { DatePickerWithRange } from "@/components/DateRangePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminClinicsPage() {
    const { clinics, requests } = useStore();
    const [date, setDate] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });
    const [period, setPeriod] = useState("month");

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-blue-950 dark:text-blue-50">Danh sách phòng khám</h2>
                    <p className="text-muted-foreground">Quản lý các chi nhánh nha khoa trong hệ thống</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={period} onValueChange={(val) => { setPeriod(val); setDate({ from: undefined, to: undefined }); }}>
                        <SelectTrigger className="w-[150px] bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Hôm nay</SelectItem>
                            <SelectItem value="week">Tuần này</SelectItem>
                            <SelectItem value="month">Tháng này</SelectItem>
                            <SelectItem value="all">Tất cả</SelectItem>
                        </SelectContent>
                    </Select>
                    <DatePickerWithRange date={date} setDate={setDate} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {clinics.map(clinic => {
                    const clinicRequests = requests.filter(r => {
                        if (r.clinicId !== clinic.id) return false;

                        const reqDate = new Date(r.createDate);
                        const now = new Date();

                        if (date?.from && date?.to) {
                            return isWithinInterval(reqDate, {
                                start: startOfDay(date.from),
                                end: endOfDay(date.to)
                            });
                        } else if (date?.from) {
                            return reqDate >= startOfDay(date.from);
                        } else {
                            if (period === "day") return isSameDay(reqDate, now);
                            if (period === "week") return isSameWeek(reqDate, now, { weekStartsOn: 1 });
                            if (period === "month") return isSameMonth(reqDate, now);
                            if (period === "all") return true;
                            // Default to month if no match? Or all? Let's assume all if logic falls through, but period is init to 'month'
                            return isSameMonth(reqDate, now);
                        }
                    });

                    const totalCost = clinicRequests
                        .filter(r => r.status === 'Completed')
                        .reduce((acc, curr) => acc + (curr.repairCost || 0), 0);

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
                                <div className="bg-red-50 p-2 rounded">
                                    <div className="text-xl font-bold text-red-700 truncate" title={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalCost)}>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalCost)}
                                    </div>
                                    <div className="text-[10px] uppercase text-muted-foreground font-semibold">Tổng chi phí sửa chữa</div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
