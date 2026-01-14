import { Clinic, User, Equipment } from './types';

export const CLINICS: Clinic[] = [
    { id: 'CN_BENLUC', name: 'Nha Khoa Sài Gòn Bến Lức' },
    { id: 'CN_BENLUC_TT', name: 'Nha Khoa Sài Gòn Thiện Tâm Bến Lức' },
    { id: 'CN_SG1', name: 'Nha Khoa Sài Gòn 1' },
    { id: 'CN_GODEN', name: 'Nha Khoa Sài Gòn Thiện Tâm - CN Gò Đen' },
    { id: 'CN_XOAIDOI', name: 'Nha Khoa Sài Gòn Thiện Tâm - CN Xoài Đôi' },
    { id: 'CN_GOCONGTAY', name: 'Nha Khoa Sài Gòn Thiện Tâm - CN Gò Công Tây' },
    { id: 'CN_TANHIEP', name: 'Nha Khoa Sài Gòn Thiện Tâm - CN Tân Hiệp' },
    { id: 'CN_TRITON', name: 'Nha Khoa Sài Gòn Thiện Tâm - CN Tri Tôn' },
    { id: 'CN_THOAISON', name: 'Nha Khoa Sài Gòn Thiện Tâm - CN Thoại Sơn' },
];

export const MOCK_USERS: User[] = [
    { username: 'admin', password: '123', fullName: 'Quản Lý Tổng', role: 'Admin' },
    { username: 'kythuat', password: '123', fullName: 'Nhân Viên Kỹ Thuật', role: 'Technician' },
    // Generate a user for each clinic
    ...CLINICS.map(clinic => ({
        username: clinic.id.toLowerCase(),
        password: '123',
        fullName: `Quản Lý ${clinic.name}`,
        role: 'Clinic' as const,
        clinicId: clinic.id
    }))
];

export const MOCK_EQUIPMENT: Equipment[] = [
    {
        id: 'EQ_BL_001',
        clinicId: 'CN_BENLUC',
        name: 'Ghế Nha Khoa K3',
        model: 'K3-2023',
        serialNumber: 'SN-BL-001',
        installDate: '2023-01-15',
        status: 'Active'
    },
    {
        id: 'EQ_GD_001',
        clinicId: 'CN_GODEN',
        name: 'Máy X-Quang Cầm Tay',
        model: 'Port-X IV',
        serialNumber: 'SN-GD-001',
        installDate: '2023-05-20',
        status: 'Active'
    },
    {
        id: 'EQ_TRITON_001',
        clinicId: 'CN_TRITON',
        name: 'Đèn Trám',
        model: 'Led-F',
        serialNumber: 'SN-TT-001',
        installDate: '2023-08-10',
        status: 'Maintenance'
    }
];

export const MOCK_REQUESTS = [
    {
        id: 'REQ-001',
        createDate: '2023-10-01',
        requesterUsername: 'benluc',
        clinicId: 'CN_BENLUC',
        equipmentId: 'EQ_BL_001',
        equipmentName: 'Ghế Nha Khoa K3',
        issueDescription: 'Ghế không nâng hạ được',
        imagesBefore: [],
        status: 'Completed',
        approverUsername: 'admin',
        repairCost: 5000000,
        warrantyMonths: 6,
        completionDate: '2023-10-05',
        technicianNotes: 'Thay motor nâng hạ'
    },
    {
        id: 'REQ-002',
        createDate: '2023-10-10',
        requesterUsername: 'goden',
        clinicId: 'CN_GODEN',
        equipmentId: 'EQ_GD_001',
        equipmentName: 'Máy X-Quang Cầm Tay',
        issueDescription: 'Nút chụp bị liệt',
        imagesBefore: [],
        status: 'Approved',
        approverUsername: 'admin',
        repairCost: 0,
        warrantyMonths: 0,
    },
    {
        id: 'REQ-003',
        createDate: '2023-10-12',
        requesterUsername: 'triton',
        clinicId: 'CN_TRITON',
        equipmentId: 'EQ_TRITON_001',
        equipmentName: 'Đèn Trám',
        issueDescription: 'Đèn chớp tắt liên tục',
        imagesBefore: [],
        status: 'New',
        repairCost: 0,
        warrantyMonths: 0,
    },
    {
        id: 'REQ-004',
        createDate: '2023-11-01',
        requesterUsername: 'benluc',
        clinicId: 'CN_BENLUC',
        equipmentId: 'EQ_BL_001',
        equipmentName: 'Ghế Nha Khoa K3',
        issueDescription: 'Đệm ghế bị rách',
        imagesBefore: [],
        status: 'Pending_Approval',
        repairCost: 0,
        warrantyMonths: 0,
    }
] as const;
