import { Year } from "../years/years.model";

export interface TeachingBlock {
    id: number;
    year_id: number;
    teaching_block: string;
    start_day: string;
    end_day: string;
    description: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;

    year: Year
}