export interface TimeSlot {
    id: number;
    time_slot: string;
    start_time: string;
    end_time: string;
    type: string;
    description: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;
}