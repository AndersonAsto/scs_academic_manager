import {
    Component,
    inject,
    input,
    output,
    signal
} from '@angular/core';

import { firstValueFrom } from 'rxjs';

import { TeacherGroup } from '../teacher-groups.model';
import { TeacherGroupsService } from '../teacher-groups.service';
import { TeacherGroupsPdfService } from './teacher-groups-pdf.service';

@Component({
    selector: 'app-info-teacher-groups',
    imports: [],
    standalone: true,
    templateUrl: './info-teacher-groups.html',
    styleUrl: './info-teacher-groups.css',
})
export class InfoTeacherGroups {

    private teacherGroupsService =
        inject(TeacherGroupsService);

    private pdfService =
        inject(TeacherGroupsPdfService);


    isOpen =
        input<boolean>(false);

    teacherGroup =
        input<TeacherGroup | null>(null);

    closeModal =
        output<void>();

    generatingPdf =
        signal(false);


    onBackdropClick(): void {

        this.closeModal.emit();

    }


    async downloadPdf(): Promise<void> {

        const teacherGroup =
            this.teacherGroup();

        if (!teacherGroup) {
            return;
        }

        this.generatingPdf.set(true);

        try {

            const yearId =
                teacherGroup
                    .academic_staff_contract
                    .year
                    .id;

            const gradeId =
                teacherGroup
                    .grade
                    .id;

            const sectionId =
                teacherGroup
                    .section
                    .id;


            const response =
                await firstValueFrom(

                    this.teacherGroupsService
                        .getTutorGroupReport(
                            yearId,
                            gradeId,
                            sectionId
                        )

                );


            await this.pdfService.generate(
                response.data
            );


        } catch (error) {

            console.error(
                'Error generando el reporte PDF:',
                error
            );

        } finally {

            this.generatingPdf.set(false);

        }

    }


    formatDate(
        value: string | undefined
    ): string {

        if (!value) {
            return '—';
        }

        const date =
            new Date(
                value.replace(' ', 'T')
            );

        return date.toLocaleString(
            'es-PE',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }
        );

    }

}