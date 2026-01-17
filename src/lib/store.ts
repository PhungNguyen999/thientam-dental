
import { create } from 'zustand';
import { User, Clinic, RepairRequest, Equipment } from './types';
import { supabase } from './supabase';
import { sendTelegramNotification } from './telegram';

interface AppState {
    currentUser: User | null;
    isLoading: boolean;
    users: User[];
    clinics: Clinic[];
    equipment: Equipment[];
    requests: RepairRequest[];

    // Actions
    fetchData: () => Promise<void>;
    login: (username: string) => Promise<boolean>;
    logout: () => void;

    addRequest: (request: RepairRequest) => Promise<void>;
    updateRequest: (id: string, updates: Partial<RepairRequest>) => Promise<void>;

    addEquipment: (equip: Equipment) => Promise<void>;
    updateEquipment: (id: string, updates: Partial<Equipment>) => Promise<void>;
    deleteEquipment: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
    currentUser: null,
    isLoading: false,
    users: [],
    clinics: [],
    equipment: [],
    requests: [],

    fetchData: async () => {
        if (!supabase) return;
        set({ isLoading: true });

        try {
            // Fetch Clinics
            const { data: clinicsData } = await supabase.from('clinics').select('*');

            // Fetch Users
            const { data: usersData } = await supabase.from('users').select('*');

            // Fetch Equipment
            const { data: equipmentData } = await supabase.from('equipment').select('*');

            // Fetch Requests - ORDER BY create_date DESC
            const { data: requestsData } = await supabase.from('repair_requests')
                .select('*')
                .order('create_date', { ascending: false });

            // Map Data
            const mappedClinics: Clinic[] = clinicsData?.map(c => ({
                id: c.id, name: c.name, address: c.address
            })) || [];

            const mappedUsers: User[] = usersData?.map(u => ({
                username: u.username,
                password: u.password,
                fullName: u.full_name,
                role: u.role,
                clinicId: u.clinic_id
            })) || [];

            const mappedEquipment: Equipment[] = equipmentData?.map(e => ({
                id: e.id,
                name: e.name,
                clinicId: e.clinic_id,
                status: e.status,
                model: e.model || '',
                serialNumber: e.serial_number || '',
                installDate: e.install_date
            })) || [];

            const mappedRequests: RepairRequest[] = requestsData?.map(r => ({
                id: r.id,
                createDate: r.create_date,
                requesterUsername: r.requester_username,
                clinicId: r.clinic_id,
                equipmentId: r.equipment_id,
                equipmentName: r.equipment_name,
                issueDescription: r.issue_description,
                imagesBefore: r.images_before || [],
                status: r.status,
                approverUsername: r.approver_username,
                repairCost: r.repair_cost,
                estimatedCost: r.estimated_cost,
                warrantyMonths: r.warranty_months,
                completionDate: r.completion_date,
                imagesAfter: r.images_after || [],
                technicianNotes: r.technician_notes
            })) || [];

            set({
                clinics: mappedClinics,
                users: mappedUsers,
                equipment: mappedEquipment,
                requests: mappedRequests,
                isLoading: false
            });

        } catch (error) {
            console.error("Error fetching data:", error);
            set({ isLoading: false });
        }
    },

    login: async (username) => {
        // Simple mock login for now, or match against fetched users
        // Since we fetched users, we can just check local state
        const user = get().users.find((u) => u.username === username);
        if (user) {
            set({ currentUser: user });
            return true;
        }
        return false;
    },

    logout: () => set({ currentUser: null }),

    addRequest: async (request) => {
        if (!supabase) return;

        // Optimistic update
        set((state) => ({ requests: [request, ...state.requests] }));

        // DB Insert
        // Need to convert camelCase to snake_case
        const dbRequest = {
            id: request.id,
            create_date: request.createDate,
            requester_username: request.requesterUsername,
            clinic_id: request.clinicId,
            equipment_id: request.equipmentId,
            equipment_name: request.equipmentName,
            issue_description: request.issueDescription,
            images_before: request.imagesBefore,
            status: request.status,
            estimated_cost: request.estimatedCost // if added at creation
        };

        const { error } = await supabase.from('repair_requests').insert(dbRequest);

        if (error) {
            console.error("Error inserting request:", error);
            // Rollback? For now just log
        } else {
            sendTelegramNotification(
                `🆕 <b>Phiếu yêu cầu mới</b>\n` +
                `Mã: ${request.id}\n` +
                `Thiết bị: ${request.equipmentName}\n` +
                `Phòng khám: ${request.clinicId}\n` +
                `Lỗi: ${request.issueDescription}`
            );
        }
    },

    updateRequest: async (id, updates) => {
        if (!supabase) return;

        // DB Update Data Mapping
        const dbUpdates: any = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.approverUsername) dbUpdates.approver_username = updates.approverUsername;
        if (updates.repairCost !== undefined) dbUpdates.repair_cost = updates.repairCost;
        if (updates.estimatedCost !== undefined) dbUpdates.estimated_cost = updates.estimatedCost;
        if (updates.warrantyMonths !== undefined) dbUpdates.warranty_months = updates.warrantyMonths;
        if (updates.completionDate) dbUpdates.completion_date = updates.completionDate;
        if (updates.imagesAfter) dbUpdates.images_after = updates.imagesAfter;
        if (updates.technicianNotes) dbUpdates.technician_notes = updates.technicianNotes;

        set((state) => {
            const updatedRequests = state.requests.map((req) =>
                req.id === id ? { ...req, ...updates } : req
            );
            return { requests: updatedRequests };
        });

        const { error } = await supabase.from('repair_requests').update(dbUpdates).eq('id', id);

        if (!error && updates.status) {
            // Logic for Telegram & Equipment Status Auto-Update
            const updatedReq = get().requests.find(r => r.id === id);
            if (updatedReq) {
                sendTelegramNotification(
                    `🔄 <b>Cập nhật trạng thái</b>\n` +
                    `Mã: ${updatedReq.id}\n` +
                    `Trạng thái mới: <b>${updates.status}</b>\n` +
                    `Người duyệt: ${updatedReq.approverUsername || 'N/A'}`
                );

                // Auto-update equipment field
                const equipId = updatedReq.equipmentId;
                let newEquipStatus: 'Active' | 'Maintenance' | undefined;

                if (updates.status === 'Approved' || updates.status === 'In_Progress') {
                    newEquipStatus = 'Maintenance';
                } else if (updates.status === 'Completed') {
                    newEquipStatus = 'Active';
                }

                if (newEquipStatus) {
                    // Update Store Equipment
                    get().updateEquipment(equipId, { status: newEquipStatus });
                }
            }
        }
    },

    addEquipment: async (equip) => {
        if (!supabase) return;
        set((state) => ({ equipment: [...state.equipment, equip] }));

        const dbEquip = {
            id: equip.id,
            name: equip.name,
            clinic_id: equip.clinicId,
            status: equip.status,
            model: equip.model,
            serial_number: equip.serialNumber,
            install_date: equip.installDate
        };
        await supabase.from('equipment').insert(dbEquip);
    },

    updateEquipment: async (id, updates) => {
        if (!supabase) return;
        set((state) => ({
            equipment: state.equipment.map((eq) =>
                eq.id === id ? { ...eq, ...updates } : eq
            ),
        }));

        const dbUpdates: any = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.name) dbUpdates.name = updates.name;
        // ... match other fields if editable

        await supabase.from('equipment').update(dbUpdates).eq('id', id);
    },

    deleteEquipment: async (id) => {
        if (!supabase) return;
        set((state) => ({
            equipment: state.equipment.filter((eq) => eq.id !== id)
        }));
        await supabase.from('equipment').delete().eq('id', id);
    }
}));
