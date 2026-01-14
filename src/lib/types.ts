export type Role = 'Admin' | 'Technician' | 'Clinic';

export interface Clinic {
  id: string;
  name: string;
  address?: string;
}

export interface User {
  username: string;
  password?: string; // In a real app, this would be hashed.
  fullName: string;
  role: Role;
  clinicId?: string; // Null for Admin
}

export type EquipmentStatus = 'Active' | 'Maintenance' | 'Disposed';

export interface Equipment {
  id: string;
  clinicId: string;
  name: string;
  model: string;
  serialNumber: string;
  installDate: string;
  status: EquipmentStatus;
}

export type RepairStatus = 'New' | 'Pending_Approval' | 'Approved' | 'In_Progress' | 'Completed' | 'Rejected';

export interface RepairRequest {
  id: string;
  createDate: string;
  requesterUsername: string;
  clinicId: string;
  equipmentId: string;
  equipmentName: string;
  issueDescription: string;
  imagesBefore: string[];
  status: RepairStatus;
  approverUsername?: string;
  repairCost?: number;
  warrantyMonths?: number;
  completionDate?: string;
  imagesAfter?: string[];
  technicianNotes?: string;
}
