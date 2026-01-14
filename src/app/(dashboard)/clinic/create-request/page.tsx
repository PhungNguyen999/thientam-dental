"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { RepairRequest } from "@/lib/types";

export default function CreateRequestPage() {
    const router = useRouter();
    const { currentUser, equipment, addRequest } = useStore();

    const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
    const [issue, setIssue] = useState("");
    const [loading, setLoading] = useState(false);

    // Filter equipment for this clinic
    const myEquipment = equipment.filter(e => e.clinicId === currentUser?.clinicId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !selectedEquipmentId) return;

        setLoading(true);

        const selectedEq = myEquipment.find(e => e.id === selectedEquipmentId);

        // Create new request
        const newRequest: RepairRequest = {
            id: `REQ-${Date.now().toString().slice(-6)}`,
            createDate: new Date().toISOString(),
            requesterUsername: currentUser.username,
            clinicId: currentUser.clinicId!,
            equipmentId: selectedEquipmentId,
            equipmentName: selectedEq?.name || "Unknown",
            issueDescription: issue,
            imagesBefore: [], // Add image upload later if needed
            status: "New",
        };

        // Simulate network
        setTimeout(() => {
            addRequest(newRequest);
            setLoading(false);
            router.push("/clinic");
        }, 500);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-2 text-muted-foreground hover:text-blue-600 transition-colors cursor-pointer" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại</span>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tạo phiếu sửa chữa mới</CardTitle>
                    <CardDescription>Điền thông tin chi tiết về thiết bị hư hỏng</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="equipment">Chọn thiết bị hư hỏng</Label>
                            <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn thiết bị..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {myEquipment.map((eq) => (
                                        <SelectItem key={eq.id} value={eq.id}>
                                            {eq.name} - {eq.model} (S/N: {eq.serialNumber})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="issue">Mô tả lỗi / Hư hỏng</Label>
                            <Textarea
                                id="issue"
                                placeholder="Mô tả chi tiết tình trạng hư hỏng..."
                                className="min-h-[120px]"
                                value={issue}
                                onChange={(e) => setIssue(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" type="button" onClick={() => router.back()}>Hủy bỏ</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading ? "Đang gửi..." : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Gửi yêu cầu
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
