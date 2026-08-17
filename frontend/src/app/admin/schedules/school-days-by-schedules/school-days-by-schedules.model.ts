import { SchoolDay } from "../../school-days/school-days.model";
import { Schedule } from "../schedules.model";

export interface SchoolDayBySchedule {
    id: number;
    schedule_id: number;
    school_day_id: number;
    type: number;
    description: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;

    schedule: Schedule;

    school_day: SchoolDay;
}