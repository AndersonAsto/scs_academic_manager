import { PersonalInformation } from "../personal-information/personal-information.model";

export interface AcademicStaffModel {
    id: number;

    personal_information_id: number;
    staff_type: string;

    description: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;
    
    personal_information: PersonalInformation;
}