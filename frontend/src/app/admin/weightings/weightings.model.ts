import { Year } from "../years/years.model";

export interface Weighting {
    id: number;
    year_id: number;
    weighting: number;
    type: string;
    description: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;

    year: Year
}