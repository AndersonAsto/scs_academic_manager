import { PersonalInformation } from "./personal-information.model";

export interface User {
    id: number;
    personal_information_id: number;
    username: string;
    role: string;
    status: boolean;
    description: string | null;
    createdAt: string;
    updatedAt: string;

    personal_information: PersonalInformation;
}