export interface Announcement {
    id: number;
    teacher_group_id: number;
    registration_id: number;
    type: 'Reuniones' | 'Avisos' | 'Inasistencias' | 'Bajo rendimiento' | 'Eventos' | 'Otros';
    priority: 'Baja' | 'Media' | 'Alta' | null;
    affair: string;
    registration_date: string;
    reading: boolean;
    description: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;

    registration?: {
        id: number;
        student: {
            personal_information: {
                names: string;
                fathers_surname: string;
                mothers_surname: string;
            };
        };
        parent: {
            personal_information: {
                names: string;
                fathers_surname: string;
                mothers_surname: string;
            };
        };
    };

    teacher_group?: {
        id: number;
        course_id: number;
        grade_id: number;
        section_id: number;

        course: {
            id: number;
            course: string;
        };

        grade: {
            id: number;
            grade: string;
        };

        section: {
            id: number;
            section: string;
        };
    };
}

export interface GroupedAnnouncements {
    registration_id: number;
    student_name: string;
    parent_name: string;

    course_id: number;
    grade_id: number;
    section_id: number;

    count: number;
    unread_count: number;
    last_date: string;
    announcements: Announcement[];
}