import { PersonalInformation } from "./personal-information.model";

export interface PersonalInformationPayload {
    names: string;
    fathers_surname: string;
    mothers_surname: string;
    dni: string;
    email: string;
    phone_number: string;
    address: string | null;
    district: string | null;
    province: string | null;
    department: string | null;
    gender: string | null;
}