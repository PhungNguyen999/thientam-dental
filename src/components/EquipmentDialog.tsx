"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Equipment } from "@/lib/types";
import { useStore } from "@/lib/store";

interface EquipmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Equipment | null; // If null, it's adding mode
}

export function EquipmentDialog({ open, onOpenChange, initialData }: EquipmentDialogProps) {
    const { addEquipment, updateEquipment, currentUser } = useStore();
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState(initialData?.name || "");
    const [model, setModel] = useState(initialData?.model || "");
    const [serial, setSerial] = useState(initialData?.serialNumber || "");
    const [installDate, setInstallDate] = useState(initialData?.installDate || new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState<Equipment['status']>(initialData?.status || "Active");

    // Reset form when dialog opens/initialData changes
    // Note: For simplicity in this non-controlled-form demo, we rely on the component remounting or manual reset if needed. 
    // In a real app, use useEffect to sync state with props if reusing the same mounted component.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.clinicId) return;

        const clinicId = currentUser.clinicId;

        setLoading(true);

        try {
            if (initialData) {
                // Edit mode
                await updateEquipment(initialData.id, {
                    name,
                    model,
                    serialNumber: serial,
                    installDate,
                    status
                });
            } else {
                // Add mode
                const newEquip: Equipment = {
                    id: `EQ_${clinicId.split('_')[1] || 'XX'}_${Date.now().toString().slice(-4)}`,
                    clinicId: clinicId,
                    name,
                    model,
                    serialNumber: serial,
                    installDate,
                    status: "Active" // Default to active on creation usually
                };
                await addEquipment(newEquip);
            }
            setLoading(false);
            onOpenChange(false);
            // Reset fields if adding? 
            if (!initialData) {
                setName("");
                setModel("");
                setSerial("");
            }
        } catch (error) {
            console.error("Error saving equipment:", error);
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Cập nhật thiết bị" : "Thêm thiết bị mới"}</DialogTitle>
                    <DialogDescription>
                        {initialData ? "Chỉnh sửa thông tin thiết bị" : "Nhập thông tin thiết bị mới vào danh sách của phòng khám."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Tên TB
                            </Label>
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="model" className="text-right">
                                Model
                            </Label>
                            <Input id="model" value={model} onChange={e => setModel(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="serial" className="text-right">
                                S/N
                            </Label>
                            <Input id="serial" value={serial} onChange={e => setSerial(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                Ngày lắp
                            </Label>
                            <Input id="date" type="date" value={installDate} onChange={e => setInstallDate(e.target.value)} className="col-span-3" required />
                        </div>
                        {initialData && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                    Trạng thái
                                </Label>
                                <Select value={status} onValueChange={(v) => setStatus(v as Equipment['status'])}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Hoạt động</SelectItem>
                                        <SelectItem value="Maintenance">Đang bảo trì</SelectItem>
                                        <SelectItem value="Disposed">Thanh lý</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Đang lưu..." : "Lưu thông tin"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
