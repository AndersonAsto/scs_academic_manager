import { TeachingBlock } from "../teaching-blocks/teaching-blocks.model";

export interface SchoolDay {
    id: number;
    teaching_block_id: number;
    school_day: string;
    day: string;
    week_number: number;
    type: string;
    description: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;

    teaching_block: TeachingBlock
}