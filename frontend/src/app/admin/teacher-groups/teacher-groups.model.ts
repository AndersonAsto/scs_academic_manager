import { AcademicStaffContract } from "../academic-staff/academic-staff-contracts/academic-staff-contracts.model";
import { Course } from "../courses/courses.model";
import { Grade } from "../grades/grades.model";
import { Section } from "../sections/sections.model";

export interface TeacherGroup {
    id: number;

    academic_staff_contract_id: number;
    course_id: number;
    grade_id: number;
    section_id: number;
    tutor: boolean;

    description: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;

    academic_staff_contract: AcademicStaffContract;

    course: Course;

    grade: Grade;

    section: Section;
}