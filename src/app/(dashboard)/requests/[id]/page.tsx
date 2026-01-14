"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RepairStatusBadge } from "@/components/RepairStatusBadge";
import { ArrowLeft, CheckCircle, XCircle, Clock, Save } from "lucide-react";
import { format } from "date-fns";
import { RepairStatus } from "@/lib/types";

export default function RequestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { requests, currentUser, updateRequest, clinics } = useStore();
    const id = params.id as string;

    const request = requests.find((r) => r.id === id);
    const clinic = clinics.find((c) => c.id === request?.clinicId);

    const [loading, setLoading] = useState(false);
    const [cost, setCost] = useState<number | "">(request?.repairCost || "");
    const [warranty, setWarranty] = useState<number | "">(request?.warrantyMonths || "");
    const [technicianNotes, setTechnicianNotes] = useState(request?.technicianNotes || "");

    if (!request || !currentUser) return <div className="p-8">Không tìm thấy phiếu yêu cầu.</div>;

    const isAdmin = currentUser.role === "Admin";
    const isOwner = currentUser.clinicId === request.clinicId;

    const handleStatusChange = (newStatus: RepairStatus) => {
        setLoading(true);
        setTimeout(() => {
            updateRequest(id, {
                status: newStatus,
                approverUsername: newStatus === 'Approved' ? currentUser.username : request.approverUsername,
                // If changing to In_Progress or doing logic, add here
            });
            setLoading(false);
            router.refresh();
        }, 500);
    };

    const handleComplete = () => {
        setLoading(true);
        setTimeout(() => {
            updateRequest(id, {
                status: 'Completed',
                repairCost: Number(cost),
                warrantyMonths: Number(warranty),
                technicianNotes: technicianNotes,
                completionDate: new Date().toISOString()
            });
            setLoading(false);
            router.push(isAdmin ? '/admin' : '/clinic');
        }, 500);
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-2 text-muted-foreground hover:text-blue-600 transition-colors cursor-pointer" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại</span>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl text-blue-900 dark:text-blue-50">Chi tiết phiếu {request.id}</CardTitle>
                                    <CardDescription className="mt-1">
                                        Tạo ngày {format(new Date(request.createDate), 'dd/MM/yyyy HH:mm')} bởi {request.requesterUsername}
                                    </CardDescription>
                                </div>
                                <RepairStatusBadge status={request.status} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Phòng khám</Label>
                                    <div className="font-medium">{clinic?.name}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Thiết bị</Label>
                                    <div className="font-medium">{request.equipmentName}</div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-muted-foreground mb-1 block">Mô tả hỏng hóc</Label>
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md border text-sm">
                                    {request.issueDescription}
                                </div>
                            </div>

                            {/* Completion Details - Visible if Completed or if User is Entering Completion */}
                            {(request.status === 'Completed' || (request.status === 'Approved' || request.status === 'In_Progress')) && (
                                <div className="border-t pt-4 space-y-4">
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Kết quả sửa chữa
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Chi phí sửa chữa (VNĐ)</Label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={cost}
                                                onChange={(e) => setCost(Number(e.target.value))}
                                                disabled={request.status === 'Completed' && !isOwner && !isAdmin} // Only disable if not owner/admin
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Bảo hành (tháng)</Label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={warranty}
                                                onChange={(e) => setWarranty(Number(e.target.value))}
                                                disabled={request.status === 'Completed' && !isOwner && !isAdmin}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ghi chú kỹ thuật / Thay thế</Label>
                                        <Textarea
                                            placeholder="Chi tiết linh kiện thay thế..."
                                            value={technicianNotes}
                                            onChange={(e) => setTechnicianNotes(e.target.value)}
                                            disabled={request.status === 'Completed' && !isOwner && !isAdmin}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Tác vụ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Admin Actions */}
                            {isAdmin && (request.status === 'New' || request.status === 'Pending_Approval') && (
                                <>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusChange('Approved')}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Duyệt yêu cầu
                                    </Button>
                                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleStatusChange('Rejected')}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Từ chối
                                    </Button>
                                </>
                            )}

                            {/* Completion Action (Admin or Clinic Owner can mark complete as per requirement) */}
                            {/* "nhân viên phòng khám... được quyền chọn hoàn thành và nhập chi phí" */}
                            {(isOwner || isAdmin) && (request.status === 'Approved' || request.status === 'In_Progress') && (
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleComplete}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Xác nhận & Nhập chi phí
                                </Button>
                            )}

                            {request.status === 'Completed' && (
                                <div className="space-y-3">
                                    <div className="text-center p-2 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                                        <CheckCircle className="mx-auto h-6 w-6 mb-1" />
                                        Đã hoàn thành
                                        <div className="text-xs text-emerald-600 mt-1">
                                            {request.completionDate ? format(new Date(request.completionDate), 'dd/MM/yyyy') : ''}
                                        </div>
                                    </div>

                                    {(isOwner || isAdmin) && (
                                        <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50" onClick={handleComplete}>
                                            <Save className="mr-2 h-4 w-4" />
                                            Cập nhật thông tin
                                        </Button>
                                    )}
                                </div>
                            )}

                            {request.status === 'Rejected' && (
                                <div className="text-center p-2 bg-red-50 text-red-700 rounded-md border border-red-200">
                                    <XCircle className="mx-auto h-6 w-6 mb-1" />
                                    Đã từ chối
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
