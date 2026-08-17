import { PersonalInformation } from "../../personal-information/personal-information.model";

export interface Student {
    id: number;

    personal_information_id: number;

    description: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;

    personal_information: PersonalInformation;
}