import { TeacherGroup } from "../teacher-groups/teacher-groups.model";
import { TimeSlot } from "../time-slots/time-slots.model";

export interface Schedule {
    id: number;

    teacher_group_id: number;
    time_slot_id: number;
    day: string;

    description: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;

    teacher_group: TeacherGroup;

    time_slot: TimeSlot;
}
