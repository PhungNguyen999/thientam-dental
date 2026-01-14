import { Badge } from "@/components/ui/badge";
import { RepairStatus } from "@/lib/types";

const statusConfig: Record<RepairStatus, { label: string; className: string }> = {
    New: { label: "Mới tạo", className: "bg-blue-500 hover:bg-blue-600" },
    Pending_Approval: { label: "Chờ duyệt", className: "bg-amber-500 hover:bg-amber-600" },
    Approved: { label: "Đã duyệt", className: "bg-purple-500 hover:bg-purple-600" },
    In_Progress: { label: "Đang sửa", className: "bg-indigo-500 hover:bg-indigo-600" },
    Completed: { label: "Hoàn thành", className: "bg-emerald-500 hover:bg-emerald-600" },
    Rejected: { label: "Từ chối", className: "bg-red-500 hover:bg-red-600" },
};

export function RepairStatusBadge({ status }: { status: RepairStatus }) {
    const config = statusConfig[status] || { label: status, className: "bg-slate-500" };
    return <Badge className={`${config.className} text-white border-0`}>{config.label}</Badge>;
}
