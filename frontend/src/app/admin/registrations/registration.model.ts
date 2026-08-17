import { Grade } from "../grades/grades.model";
import { Section } from "../sections/sections.model";
import { Year } from "../years/years.model";
import { Parent } from "./parents/parents.model";
import { Student } from "./students/students.model";

export interface Registration {
    id: number;

    year_id: number;
    student_id: number;
    parent_id: number;
    grade_id: number;
    section_id: number;
    registration_date: string | null;

    description: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;

    year: Year;

    student: Student;

    parent: Parent;

    grade: Grade;

    section: Section;
}