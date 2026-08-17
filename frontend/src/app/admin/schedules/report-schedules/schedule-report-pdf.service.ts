import { Injectable } from '@angular/core';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import { ScheduleReportItem } from '../schedules.service';

pdfMake.addVirtualFileSystem(pdfFonts);

@Injectable({
    providedIn: 'root'
})
export class ScheduleReportPdfService {

    private readonly PRIMARY_COLOR = '#00897B';
    private readonly DARK_GREEN = '#00695C';
    private readonly LIGHT_GREEN = '#E8F5F2';
    private readonly BORDER_COLOR = '#B8CCC7';
    private readonly TEXT_COLOR = '#263238';
    private readonly MUTED_COLOR = '#607D7A';

    // Contenido útil disponible en A4 horizontal con margen 25/25 (841.89 - 50)
    private readonly PAGE_CONTENT_WIDTH = 792;

    /*
     * 15 colores para identificar cursos.
     * Tonos pastel más saturados (Material 100) para
     * que cada curso se distinga bien manteniendo
     * buena legibilidad del texto oscuro.
     * El color se asigna de forma determinista según course.id.
     */
    private readonly COURSE_COLORS = [
        '#BBDEFB', // azul
        '#C8E6C9', // verde
        '#FFE0B2', // naranja
        '#F8BBD0', // rosa
        '#D1C4E9', // morado
        '#B2EBF2', // cian
        '#FFF59D', // amarillo
        '#E1BEE7', // lila
        '#C5CAE9', // índigo
        '#FFCCBC', // coral
        '#B2DFDB', // verde azulado
        '#DCEDC8', // verde lima
        '#D7CCC8', // marrón claro
        '#F0F4C3', // lima pálido
        '#B3E5FC'  // celeste
    ];

    async generate(schedules: ScheduleReportItem[]): Promise<void> {

        if (!schedules.length) {
            throw new Error('No existen horarios para generar el reporte.');
        }

        const first = schedules[0];
        const year = first.teacher_group.academic_staff_contract.year.year;
        const grade = first.teacher_group.grade.grade;
        const section = first.teacher_group.section.section;

        const matrix = this.buildMatrix(schedules);
        const legend = this.buildLegend(schedules);
        const logo = await this.loadLogo();

        const documentDefinition: any = {

            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [25, 80, 25, 45],

            header: () => ({
                margin: [25, 20, 25, 0],
                columns: [

                    {
                        width: 45,
                        image: logo,
                        fit: [40, 40]
                    },

                    {
                        width: '*',
                        margin: [10, 2, 0, 0],
                        stack: [
                            { text: 'INSTITUCIÓN EDUCATIVA N.° 22234', bold: true, fontSize: 10, color: this.DARK_GREEN },
                            { text: 'SANTIAGO CALLE SANTOS', fontSize: 8, bold: true, color: this.TEXT_COLOR },
                            { text: 'Reporte de Horarios', fontSize: 7, color: this.MUTED_COLOR }
                        ]
                    },

                    {
                        width: 180,
                        stack: [
                            { text: `Año: ${year}`, alignment: 'right', fontSize: 8, bold: true },
                            { text: `Grado: ${grade}`, alignment: 'right', fontSize: 8 },
                            { text: `Sección: ${section}`, alignment: 'right', fontSize: 8 }
                        ]
                    }

                ]
            }),

            content: [

                {
                    canvas: [
                        { type: 'rect', x: 0, y: 0, w: this.PAGE_CONTENT_WIDTH, h: 5, color: this.PRIMARY_COLOR }
                    ],
                    margin: [0, 0, 0, 15]
                },

                { text: 'HORARIO ACADÉMICO', style: 'title' },
                { text: `${grade} - Sección ${section}`, style: 'subtitle' },

                {
                    table: {
                        headerRows: 1,
                        widths: [70, '*', '*', '*', '*'],
                        body: matrix
                    },
                    layout: this.tableLayout(),
                    margin: [0, 0, 0, 18]
                },

                { text: 'LEYENDA DE CURSOS', style: 'sectionTitle' },

                {
                    table: {
                        widths: Array(Math.min(legend.length, 5)).fill('*'),
                        body: this.buildLegendRows(legend)
                    },
                    layout: this.legendLayout()
                }

            ],

            footer: (currentPage: number, pageCount: number) => ({
                margin: [25, 12, 25, 0],
                columns: [
                    { text: `Generado: ${this.formatDateTime(new Date())}`, fontSize: 7, color: this.MUTED_COLOR },
                    { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', fontSize: 7, color: this.MUTED_COLOR }
                ]
            }),

            styles: {
                title: { fontSize: 15, bold: true, alignment: 'center', color: this.DARK_GREEN, margin: [0, 0, 0, 3] },
                subtitle: { fontSize: 9, alignment: 'center', color: this.MUTED_COLOR, margin: [0, 0, 0, 15] },
                sectionTitle: { fontSize: 9, bold: true, color: this.DARK_GREEN, margin: [0, 0, 0, 6] }
            },

            defaultStyle: {
                fontSize: 7
            }

        };

        const fileName = this.buildFileName(year, grade, section);

        pdfMake.createPdf(documentDefinition).download(fileName);
    }

    private buildMatrix(schedules: ScheduleReportItem[]): any[][] {

        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

        const timeSlots = [...new Map(
            schedules.map(schedule => [schedule.time_slot.id, schedule.time_slot])
        ).values()].sort(
            (a, b) => this.timeToMinutes(a.start_time) - this.timeToMinutes(b.start_time)
        );

        const header = [
            { text: 'DÍA / HORA', bold: true, alignment: 'center', fillColor: this.DARK_GREEN, color: '#FFFFFF' },
            ...timeSlots.map(slot => ({
                text: `${slot.time_slot}\n${slot.start_time} - ${slot.end_time}`,
                bold: true,
                alignment: 'center',
                fillColor: this.DARK_GREEN,
                color: '#FFFFFF'
            }))
        ];

        const rows = days.map(day => {

            const row: any[] = [
                { text: day, bold: true, alignment: 'center', fillColor: this.LIGHT_GREEN, color: this.DARK_GREEN }
            ];

            for (const slot of timeSlots) {

                const schedule = schedules.find(
                    item => item.day === day && item.time_slot.id === slot.id
                );

                if (!schedule) {
                    row.push({ text: '—', alignment: 'center', color: this.MUTED_COLOR });
                    continue;
                }

                const courseName = schedule.course.course ?? 'Sin curso';
                const person = schedule.teacher_group.academic_staff_contract.academic_staff.personal_information;
                const teacherName = [person.names, person.fathers_surname, person.mothers_surname]
                    .filter(Boolean)
                    .join(' ');

                row.push({
                    fillColor: this.getCourseColor(schedule.course.id),
                    margin: [3, 5, 3, 5],
                    stack: [
                        { text: courseName, bold: true, fontSize: 8, color: this.TEXT_COLOR, alignment: 'center' },
                        { text: teacherName, fontSize: 6.5, color: this.MUTED_COLOR, alignment: 'center', margin: [0, 3, 0, 0] }
                    ]
                });
            }

            return row;
        });

        return [header, ...rows];
    }

    private buildLegend(schedules: ScheduleReportItem[]): ScheduleReportItem[] {

        const uniqueCourses = new Map<number, ScheduleReportItem>();

        for (const schedule of schedules) {
            if (schedule.course.id && !uniqueCourses.has(schedule.course.id)) {
                uniqueCourses.set(schedule.course.id, schedule);
            }
        }

        return [...uniqueCourses.values()]
            .sort((a, b) => (a.course.course ?? '').localeCompare(b.course.course ?? '', 'es'))
            .slice(0, 15);
    }

    private buildLegendRows(legend: ScheduleReportItem[]): any[][] {

        const columns = 5;
        const rows: any[][] = [];

        for (let i = 0; i < legend.length; i += columns) {

            const row: any[] = [];

            for (let j = 0; j < columns; j++) {

                const schedule = legend[i + j];

                if (!schedule) {
                    row.push({ text: '' });
                    continue;
                }

                row.push({
                    text: schedule.course.course ?? 'Sin curso',
                    fillColor: this.getCourseColor(schedule.course.id),
                    fontSize: 7,
                    bold: true,
                    alignment: 'center',
                    margin: [4, 5, 4, 5]
                });
            }

            rows.push(row);
        }

        return rows;
    }

    private getCourseColor(courseId: number): string {
        return this.COURSE_COLORS[courseId % this.COURSE_COLORS.length];
    }

    private tableLayout(): any {
        return {
            hLineColor: () => this.BORDER_COLOR,
            vLineColor: () => this.BORDER_COLOR,
            hLineWidth: () => 0.7,
            vLineWidth: () => 0.7,
            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 4,
            paddingBottom: () => 4
        };
    }

    private legendLayout(): any {
        return {
            hLineColor: () => this.BORDER_COLOR,
            vLineColor: () => this.BORDER_COLOR,
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5
        };
    }

    private timeToMinutes(value: string | null): number {

        if (!value) {
            return 0;
        }

        const [hours, minutes] = value.substring(0, 5).split(':').map(Number);
        return hours * 60 + minutes;
    }

    private formatDateTime(date: Date): string {
        return date.toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    private buildFileName(year: number | string | null, grade: string | null, section: string | null): string {

        const clean = (value: unknown) =>
            String(value ?? '')
                .trim()
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g, '');

        return ['Horario', clean(year), clean(grade), clean(section)].join('_') + '.pdf';
    }

    private async loadLogo(): Promise<string> {

        /*
         * Coloca el logo en:
         *
         * public/logo-ie-22234.png
         *
         * cache: 'no-store' evita que una revalidación 304
         * entregue un blob vacío/corrupto en fetch().
         */
        const response = await fetch('/logo-ie-22234.png', { cache: 'no-store' });

        if (!response.ok) {
            throw new Error('No se pudo cargar el logo institucional.');
        }

        const blob = await response.blob();
        return await this.blobToDataUrl(blob);
    }

    private blobToDataUrl(blob: Blob): Promise<string> {

        return new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error('No se pudo convertir el logo.'));
                }
            };

            reader.onerror = () => reject(new Error('Error leyendo el logo.'));

            reader.readAsDataURL(blob);
        });
    }
}