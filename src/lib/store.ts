import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Clinic, RepairRequest, Equipment } from './types';
import { CLINICS, MOCK_USERS, MOCK_EQUIPMENT, MOCK_REQUESTS } from './data';

interface AppState {
    currentUser: User | null;
    users: User[];
    clinics: Clinic[];
    equipment: Equipment[];
    requests: RepairRequest[];

    // Actions
    login: (username: string) => boolean;
    logout: () => void;

    addRequest: (request: RepairRequest) => void;
    updateRequest: (id: string, updates: Partial<RepairRequest>) => void;

    addEquipment: (equip: Equipment) => void;
    updateEquipment: (id: string, updates: Partial<Equipment>) => void;
    deleteEquipment: (id: string) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            currentUser: null,
            users: MOCK_USERS,
            clinics: CLINICS,
            equipment: MOCK_EQUIPMENT,
            requests: [...MOCK_REQUESTS] as unknown as RepairRequest[],

            login: (username) => {
                const user = get().users.find((u) => u.username === username);
                if (user) {
                    set({ currentUser: user });
                    return true;
                }
                return false;
            },

            logout: () => set({ currentUser: null }),

            addRequest: (request) =>
                set((state) => ({ requests: [request, ...state.requests] })),

            updateRequest: (id, updates) =>
                set((state) => ({
                    requests: state.requests.map((req) =>
                        req.id === id ? { ...req, ...updates } : req
                    ),
                })),

            addEquipment: (equip) =>
                set((state) => ({ equipment: [...state.equipment, equip] })),

            updateEquipment: (id, updates) =>
                set((state) => ({
                    equipment: state.equipment.map((eq) =>
                        eq.id === id ? { ...eq, ...updates } : eq
                    ),
                })),

            deleteEquipment: (id) =>
                set((state) => ({
                    equipment: state.equipment.filter((eq) => eq.id !== id)
                })),
        }),
        {
            name: 'thientam-dental-storage',
            partialize: (state) => ({
                // We persist everything except currentUser if we wanted 'remember me' functional, 
                // but typically session state is ephemeral. 
                // For this demo, we'll persist requests and equipment changes, 
                // but maybe reset users/clinics if we change code.
                // Let's persist requests and equipment.
                requests: state.requests,
                equipment: state.equipment,
                // We don't persist users/clinics so we can update them in code easily.
            }),
        }
    )
);
