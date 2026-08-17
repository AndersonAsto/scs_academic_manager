export interface PersonalInformation {
    id: number;

    names: string;
    fathers_surname: string;
    mothers_surname: string;
    dni: string;
    email: string;
    phone_number: string;
    address: string;
    district: string;
    province: string;
    department: string;
    gender: string;

    description: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;
}