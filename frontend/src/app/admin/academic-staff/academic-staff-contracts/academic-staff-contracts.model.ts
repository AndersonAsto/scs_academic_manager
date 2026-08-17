import { Year } from "../../years/years.model";
import { AcademicStaffModel } from "../academic-staff.model";

export interface AcademicStaffContract {
    id: number;

        year_id: number;
        academic_staff_id: number;
        start_date: string;
        end_date: string;
        position: string;

        description: string | null;
        status: boolean;
        createdAt: string;
        updatedAt: string;

        academic_staff: AcademicStaffModel;

        year: Year
}