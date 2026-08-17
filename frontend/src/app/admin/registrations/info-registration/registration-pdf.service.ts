import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import { Registration } from '../registration.model';

pdfMake.addVirtualFileSystem(pdfFonts);

@Injectable({
    providedIn: 'root'
})
export class RegistrationPdfService {

    private readonly primaryColor = '#008F6B';
    private readonly darkGreen = '#006B50';
    private readonly lightGreen = '#E8F5F0';
    private readonly textColor = '#333333';
    private readonly mutedColor = '#666666';

    async generate(registration: Registration): Promise<void> {
        const student = registration.student.personal_information;
        const parent = registration.parent.personal_information;

        const studentFullName =
            `${student.names} ${student.fathers_surname} ${student.mothers_surname}`;

        const parentFullName =
            `${parent.names} ${parent.fathers_surname} ${parent.mothers_surname}`;

        const logo = await this.loadLogo();

        const documentDefinition: any = {

            pageSize: 'A4',

            pageMargins: [40, 90, 40, 50],

            header: () => ({

                margin: [40, 25, 40, 0],

                columns: [

                    {
                        width: 55,
                        image: logo,
                        fit: [55, 55]
                    },

                    {
                        width: '*',
                        stack: [

                            {
                                text: 'INSTITUCIÓN EDUCATIVA',
                                style: 'institutionName'
                            },

                            {
                                text: 'N° 22234 "SANTIAGO CALLE SANTOS"',
                                style: 'institutionNumber'
                            },

                            {
                                text: 'REPORTE DE MATRÍCULA',
                                style: 'headerReportTitle'
                            }

                        ],

                        margin: [10, 4, 0, 0]
                    },

                    {
                        width: 70,

                        stack: [

                            {
                                text: `N.º ${registration.id}`,
                                style: 'headerRegistrationNumber'
                            },

                            {
                                text: `Año ${registration.year.year}`,
                                style: 'headerYear'
                            }

                        ]
                    }

                ]
            }),

            content: [

                {
                    canvas: [
                        {
                            type: 'rect',
                            x: 0,
                            y: 0,
                            w: 515,
                            h: 6,
                            color: this.primaryColor
                        }
                    ],

                    margin: [0, 0, 0, 18]
                },

                {
                    text: 'INFORMACIÓN ACADÉMICA Y ADMINISTRATIVA',
                    style: 'subtitle'
                },

                {
                    text: `Matrícula N.º ${registration.id}`,
                    style: 'documentNumber'
                },

                {
                    canvas: [
                        {
                            type: 'line',
                            x1: 0,
                            y1: 0,
                            x2: 515,
                            y2: 0,
                            lineWidth: 1,
                            lineColor: this.primaryColor
                        }
                    ],

                    margin: [0, 8, 0, 20]
                },

                // DATOS DE MATRÍCULA

                {
                    text: '1. DATOS DE LA MATRÍCULA',
                    style: 'sectionTitle'
                },

                {
                    table: {
                        widths: ['35%', '65%'],

                        body: [

                            this.row(
                                'N.º de matrícula',
                                String(registration.id)
                            ),

                            this.row(
                                'Año lectivo',
                                String(registration.year.year)
                            ),

                            this.row(
                                'Grado',
                                registration.grade.grade
                            ),

                            this.row(
                                'Sección',
                                registration.section.section
                            ),

                            this.row(
                                'Fecha de matrícula',
                                this.formatDate(registration.registration_date)
                            ),

                            this.row(
                                'Estado',
                                registration.status ? 'Activo' : 'Inactivo'
                            ),

                            this.row(
                                'Descripción',
                                registration.description || 'Sin descripción registrada.'
                            )

                        ]
                    },

                    layout: this.tableLayout(),

                    margin: [0, 0, 0, 25]
                },

                // ESTUDIANTE

                {
                    text: '2. DATOS DEL ESTUDIANTE',
                    style: 'sectionTitle'
                },

                {
                    table: {
                        widths: ['35%', '65%'],

                        body: [

                            this.row(
                                'Nombre completo',
                                studentFullName
                            ),

                            this.row(
                                'DNI',
                                student.dni || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Correo electrónico',
                                student.email || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Teléfono',
                                student.phone_number || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Dirección',
                                student.address || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Distrito',
                                student.district || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Provincia',
                                student.province || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Departamento',
                                student.department || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Estado',
                                student.status ? 'Activo' : 'Inactivo'
                            )

                        ]
                    },

                    layout: this.tableLayout(),

                    margin: [0, 0, 0, 25]
                },

                // APODERADO

                {
                    text: '3. DATOS DEL APODERADO',
                    style: 'sectionTitle'
                },

                {
                    table: {
                        widths: ['35%', '65%'],

                        body: [

                            this.row(
                                'Nombre completo',
                                parentFullName
                            ),

                            this.row(
                                'DNI',
                                parent.dni || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Correo electrónico',
                                parent.email || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Teléfono',
                                parent.phone_number || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Dirección',
                                parent.address || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Distrito',
                                parent.district || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Provincia',
                                parent.province || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Departamento',
                                parent.department || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Estado',
                                parent.status ? 'Activo' : 'Inactivo'
                            )

                        ]
                    },

                    layout: this.tableLayout(),

                    margin: [0, 0, 0, 25]
                },

                // INFORMACIÓN DEL REGISTRO

                {
                    text: '4. INFORMACIÓN DEL REGISTRO',
                    style: 'sectionTitle'
                },

                {
                    table: {
                        widths: ['35%', '65%'],

                        body: [

                            this.row(
                                'Fecha de creación',
                                this.formatDateTime(registration.createdAt)
                            ),

                            this.row(
                                'Última actualización',
                                this.formatDateTime(registration.updatedAt)
                            )

                        ]
                    },

                    layout: this.tableLayout(),

                    margin: [0, 0, 0, 10]
                }

            ],

            footer: (currentPage: number, pageCount: number) => {

                return {

                    columns: [

                        {
                            stack: [

                                {
                                    canvas: [
                                        {
                                            type: 'line',
                                            x1: 0,
                                            y1: 0,
                                            x2: 515,
                                            y2: 0,
                                            lineWidth: 1,
                                            lineColor: this.primaryColor
                                        }
                                    ],

                                    margin: [0, 0, 0, 7]
                                },

                                {
                                    columns: [

                                        {
                                            text: 'Institución Educativa N° 22234 "Santiago Calle Santos"',
                                            alignment: 'left',
                                            style: 'footer'
                                        },

                                        {
                                            text: `Página ${currentPage} de ${pageCount}`,
                                            alignment: 'right',
                                            style: 'footer'
                                        }

                                    ]
                                }

                            ]
                        }

                    ],

                    margin: [40, 10, 40, 0]
                };
            },

            styles: {

                institutionName: {
                    fontSize: 8,
                    bold: true,
                    color: this.darkGreen
                },

                institutionNumber: {
                    fontSize: 10,
                    bold: true,
                    color: this.textColor,
                    margin: [0, 1, 0, 2]
                },

                headerReportTitle: {
                    fontSize: 8,
                    bold: true,
                    color: this.mutedColor
                },

                headerRegistrationNumber: {
                    fontSize: 9,
                    bold: true,
                    color: this.darkGreen,
                    alignment: 'right'
                },

                headerYear: {
                    fontSize: 8,
                    color: this.mutedColor,
                    alignment: 'right',
                    margin: [0, 3, 0, 0]
                },

                subtitle: {
                    fontSize: 9,
                    alignment: 'center',
                    color: this.mutedColor,
                    margin: [0, 0, 0, 5]
                },

                documentNumber: {
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    color: this.darkGreen,
                    margin: [0, 0, 0, 5]
                },

                sectionTitle: {
                    fontSize: 11,
                    bold: true,
                    color: this.darkGreen,
                    margin: [0, 0, 0, 8]
                },

                label: {
                    fontSize: 9,
                    bold: true,
                    color: this.textColor
                },

                value: {
                    fontSize: 9,
                    color: this.textColor
                },

                footer: {
                    fontSize: 7.5,
                    color: this.mutedColor
                }

            },

            defaultStyle: {
                fontSize: 9
            }

        };

        const fileName = this.buildFileName(registration);

        pdfMake
            .createPdf(documentDefinition)
            .download(fileName);
    }

    private row(label: string, value: string): any[] {

        return [

            {
                text: label,
                style: 'label',
                fillColor: this.lightGreen
            },

            {
                text: value,
                style: 'value'
            }

        ];
    }

    private tableLayout(): any {

        return {

            hLineWidth: () => 0.5,

            vLineWidth: () => 0.5,

            hLineColor: () => '#D5E7E1',

            vLineColor: () => '#D5E7E1',

            paddingLeft: () => 8,

            paddingRight: () => 8,

            paddingTop: () => 6,

            paddingBottom: () => 6

        };
    }

    private formatDate(value: string | undefined | null): string {

        if (!value) {
            return 'Sin datos registrados.';
        }

        const date = new Date(value.replace(' ', 'T'));

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    private formatDateTime(value: string | undefined | null): string {

        if (!value) {
            return 'Sin datos registrados.';
        }

        const date = new Date(value.replace(' ', 'T'));

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    private buildFileName(registration: Registration): string {

        const student = registration.student.personal_information;

        const fullName = [
            student.names,
            student.fathers_surname,
            student.mothers_surname
        ]
            .join('_')
            .replace(/\s+/g, '_');

        return `Matricula_${registration.id}_${fullName}.pdf`;
    }

    private async loadLogo(): Promise<string> {

        /*
         * Coloca el logo en:
         *
         * public/logo-ie-22234.png
         *
         * Si utilizas otro nombre, cambia solamente esta ruta.
         */

        const response = await fetch('/logo-ie-22234.png', { cache: 'no-store' });

        if (!response.ok) {
            throw new Error('No se pudo cargar el logo institucional.');
        }
        const blob = await response.blob();
        return await this.blobToDataUrl(blob);
    }

    private blobToDataUrl(
        blob: Blob
    ): Promise<string> {

        return new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.onload = () => {

                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(
                        new Error(
                            'No se pudo convertir el logo.'
                        )
                    );
                }
            };

            reader.onerror = () => {
                reject(
                    new Error(
                        'Error leyendo el logo.'
                    )
                );
            };

            reader.readAsDataURL(blob);
        });
    }
}