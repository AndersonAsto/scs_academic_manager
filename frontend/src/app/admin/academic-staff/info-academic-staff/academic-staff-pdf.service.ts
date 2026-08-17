import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { AcademicStaffModel } from '../academic-staff.model';
import { AcademicStaffContract } from '../academic-staff-contracts/academic-staff-contracts.model';

pdfMake.addVirtualFileSystem(pdfFonts);

@Injectable({
    providedIn: 'root'
})
export class AcademicStaffPdfService {

    private readonly PRIMARY_COLOR = '#00897B';
    private readonly DARK_GREEN = '#00695C';
    private readonly LIGHT_GREEN = '#E8F5F2';
    private readonly BORDER_COLOR = '#D5E5E1';
    private readonly TEXT_COLOR = '#333333';
    private readonly MUTED_COLOR = '#666666';

    async generate(
        academicStaff: AcademicStaffModel,
        contracts: AcademicStaffContract[]
    ): Promise<void> {

        const person = academicStaff.personal_information;

        const fullName = [
            person.names,
            person.fathers_surname,
            person.mothers_surname
        ]
            .filter(Boolean)
            .join(' ');

        const logo = await this.loadLogo();

        const documentDefinition: any = {

            pageSize: 'A4',

            pageMargins: [40, 90, 40, 55],

            header: () => ({
                margin: [40, 25, 40, 0],

                columns: [
                    {
                        width: 55,
                        image: logo,
                        fit: [50, 50]
                    },

                    {
                        width: '*',
                        stack: [
                            {
                                text: 'INSTITUCIÓN EDUCATIVA N.° 22234',
                                style: 'institutionName'
                            },
                            {
                                text: 'SANTIAGO CALLE SANTOS',
                                style: 'institutionSubtitle'
                            },
                            {
                                text: 'Reporte de Personal Académico',
                                style: 'institutionReport'
                            }
                        ],
                        margin: [10, 4, 0, 0]
                    },

                    {
                        width: 90,
                        stack: [
                            {
                                text: `N.º ${academicStaff.id}`,
                                style: 'headerId',
                                alignment: 'right'
                            },
                            {
                                text: academicStaff.staff_type,
                                style: 'headerType',
                                alignment: 'right'
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
                            h: 5,
                            color: this.PRIMARY_COLOR
                        }
                    ],
                    margin: [0, 0, 0, 18]
                },

                {
                    text: 'REPORTE DE PERSONAL ACADÉMICO',
                    style: 'title'
                },

                {
                    text: fullName,
                    style: 'personName'
                },

                {
                    text: `Código de personal académico: ${academicStaff.id}`,
                    style: 'documentNumber'
                },

                {
                    text: '1. DATOS DEL PERSONAL ACADÉMICO',
                    style: 'sectionTitle'
                },

                {
                    table: {
                        widths: ['35%', '65%'],
                        body: [

                            this.row(
                                'Tipo de personal',
                                academicStaff.staff_type
                            ),

                            this.row(
                                'Estado',
                                academicStaff.status
                                    ? 'Activo'
                                    : 'Inactivo'
                            ),

                            this.row(
                                'Descripción',
                                academicStaff.description ||
                                'Sin descripción registrada.'
                            ),

                            this.row(
                                'Fecha de creación',
                                this.formatDateTime(academicStaff.createdAt)
                            ),

                            this.row(
                                'Última actualización',
                                this.formatDateTime(academicStaff.updatedAt)
                            )

                        ]
                    },

                    layout: this.tableLayout(),

                    margin: [0, 0, 0, 22]
                },

                {
                    text: '2. INFORMACIÓN PERSONAL',
                    style: 'sectionTitle'
                },

                {
                    table: {
                        widths: ['35%', '65%'],
                        body: [

                            this.row(
                                'Nombres',
                                person.names
                            ),

                            this.row(
                                'Apellido paterno',
                                person.fathers_surname
                            ),

                            this.row(
                                'Apellido materno',
                                person.mothers_surname
                            ),

                            this.row(
                                'Nombre completo',
                                fullName
                            ),

                            this.row(
                                'DNI',
                                person.dni || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Correo electrónico',
                                person.email || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Teléfono',
                                person.phone_number || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Dirección',
                                person.address || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Distrito',
                                person.district || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Provincia',
                                person.province || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Departamento',
                                person.department || 'Sin datos registrados.'
                            ),

                            this.row(
                                'Estado',
                                person.status ? 'Activo' : 'Inactivo'
                            ),

                            this.row(
                                'Descripción',
                                person.description ||
                                'Sin descripción registrada.'
                            ),

                            this.row(
                                'Fecha de registro',
                                this.formatDateTime(person.createdAt)
                            ),

                            this.row(
                                'Última actualización',
                                this.formatDateTime(person.updatedAt)
                            )

                        ]
                    },

                    layout: this.tableLayout(),

                    margin: [0, 0, 0, 22]
                },

                {
                    text: '3. HISTORIAL DE CONTRATOS',
                    style: 'sectionTitle'
                },

                contracts.length > 0
                    ? this.contractsTable(contracts)
                    : {
                        table: {
                            widths: ['*'],
                            body: [
                                [
                                    {
                                        text: 'No existen contratos registrados para este personal académico.',
                                        style: 'emptyValue'
                                    }
                                ]
                            ]
                        },

                        layout: this.tableLayout(),

                        margin: [0, 0, 0, 20]
                    },

                {
                    text: '4. INFORMACIÓN DEL REPORTE',
                    style: 'sectionTitle'
                },

                {
                    table: {
                        widths: ['35%', '65%'],
                        body: [

                            this.row(
                                'Personal académico',
                                fullName
                            ),

                            this.row(
                                'Código',
                                String(academicStaff.id)
                            ),

                            this.row(
                                'Tipo',
                                academicStaff.staff_type
                            ),

                            this.row(
                                'Contratos registrados',
                                String(contracts.length)
                            ),

                            this.row(
                                'Fecha de generación',
                                this.formatDateTime(
                                    new Date().toISOString()
                                )
                            )

                        ]
                    },

                    layout: this.tableLayout()
                }

            ],

            footer: (
                currentPage: number,
                pageCount: number
            ) => {

                return {

                    margin: [40, 15, 40, 0],

                    columns: [

                        {
                            text: 'I.E. N.° 22234 Santiago Calle Santos',
                            style: 'footer',
                            alignment: 'left'
                        },

                        {
                            text: `Página ${currentPage} de ${pageCount}`,
                            style: 'footer',
                            alignment: 'right'
                        }

                    ]
                };
            },

            styles: {

                institutionName: {
                    fontSize: 10,
                    bold: true,
                    color: this.DARK_GREEN
                },

                institutionSubtitle: {
                    fontSize: 8,
                    bold: true,
                    color: this.TEXT_COLOR,
                    margin: [0, 2, 0, 0]
                },

                institutionReport: {
                    fontSize: 7,
                    color: this.MUTED_COLOR,
                    margin: [0, 2, 0, 0]
                },

                headerId: {
                    fontSize: 8,
                    bold: true,
                    color: this.DARK_GREEN
                },

                headerType: {
                    fontSize: 7,
                    color: this.MUTED_COLOR,
                    margin: [0, 3, 0, 0]
                },

                title: {
                    fontSize: 17,
                    bold: true,
                    alignment: 'center',
                    color: this.DARK_GREEN,
                    margin: [0, 0, 0, 5]
                },

                personName: {
                    fontSize: 12,
                    bold: true,
                    alignment: 'center',
                    color: this.TEXT_COLOR,
                    margin: [0, 0, 0, 4]
                },

                documentNumber: {
                    fontSize: 8,
                    alignment: 'center',
                    color: this.MUTED_COLOR,
                    margin: [0, 0, 0, 20]
                },

                sectionTitle: {
                    fontSize: 10,
                    bold: true,
                    color: this.DARK_GREEN,
                    margin: [0, 0, 0, 7]
                },

                label: {
                    fontSize: 8.5,
                    bold: true,
                    color: this.TEXT_COLOR
                },

                value: {
                    fontSize: 8.5,
                    color: this.TEXT_COLOR
                },

                tableHeader: {
                    fontSize: 8,
                    bold: true,
                    color: '#FFFFFF'
                },

                contractValue: {
                    fontSize: 8
                },

                emptyValue: {
                    fontSize: 8.5,
                    color: this.MUTED_COLOR,
                    italics: true
                },

                footer: {
                    fontSize: 7,
                    color: this.MUTED_COLOR
                }

            },

            defaultStyle: {
                fontSize: 8.5
            }
        };

        const fileName = this.buildFileName(academicStaff);

        pdfMake
            .createPdf(documentDefinition)
            .download(fileName);
    }

    private row(
        label: string,
        value: string | number
    ): any[] {

        return [

            {
                text: label,
                style: 'label'
            },

            {
                text: String(value),
                style: 'value'
            }

        ];
    }

    private contractsTable(
        contracts: AcademicStaffContract[]
    ): any {

        const body: any[] = [

            [
                {
                    text: 'Año',
                    style: 'tableHeader'
                },
                {
                    text: 'Cargo',
                    style: 'tableHeader'
                },
                {
                    text: 'Inicio',
                    style: 'tableHeader'
                },
                {
                    text: 'Fin',
                    style: 'tableHeader'
                },
                {
                    text: 'Estado',
                    style: 'tableHeader'
                }
            ]
        ];

        for (const contract of contracts) {

            body.push([

                {
                    text: String(contract.year.year),
                    style: 'contractValue'
                },

                {
                    text: contract.position || 'Sin cargo registrado.',
                    style: 'contractValue'
                },

                {
                    text: this.formatDate(contract.start_date),
                    style: 'contractValue'
                },

                {
                    text: this.formatDate(contract.end_date),
                    style: 'contractValue'
                },

                {
                    text: contract.status
                        ? 'Activo'
                        : 'Inactivo',
                    style: 'contractValue'
                }

            ]);

            if (contract.description) {

                body.push([

                    {
                        text: 'Observaciones',
                        style: 'label',
                        colSpan: 1
                    },

                    {
                        text: contract.description,
                        style: 'contractValue',
                        colSpan: 4
                    },

                    {},
                    {},
                    {}

                ]);
            }
        }

        return {

            table: {

                headerRows: 1,

                widths: [
                    '12%',
                    '28%',
                    '18%',
                    '18%',
                    '24%'
                ],

                body

            },

            layout: {

                fillColor: (rowIndex: number) => {

                    if (rowIndex === 0) {
                        return this.PRIMARY_COLOR;
                    }

                    return rowIndex % 2 === 0
                        ? '#F7FBFA'
                        : null;
                },

                hLineColor: () => this.BORDER_COLOR,

                vLineColor: () => this.BORDER_COLOR,

                hLineWidth: () => 0.6,

                vLineWidth: () => 0.6,

                paddingLeft: () => 7,

                paddingRight: () => 7,

                paddingTop: () => 6,

                paddingBottom: () => 6
            },

            margin: [0, 0, 0, 22]
        };
    }

    private tableLayout(): any {

        return {

            fillColor: (rowIndex: number) => {

                if (rowIndex % 2 === 0) {
                    return this.LIGHT_GREEN;
                }

                return null;
            },

            hLineColor: () => this.BORDER_COLOR,

            vLineColor: () => this.BORDER_COLOR,

            hLineWidth: () => 0.6,

            vLineWidth: () => 0.6,

            paddingLeft: () => 8,

            paddingRight: () => 8,

            paddingTop: () => 6,

            paddingBottom: () => 6
        };
    }

    private formatDate(
        value: string | undefined | null
    ): string {

        if (!value) {
            return 'Sin datos registrados.';
        }

        const date = new Date(
            value.replace(' ', 'T')
        );

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString(
            'es-PE',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }
        );
    }

    private formatDateTime(
        value: string | undefined | null
    ): string {

        if (!value) {
            return 'Sin datos registrados.';
        }

        const date = new Date(
            value.replace(' ', 'T')
        );

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString(
            'es-PE',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }
        );
    }

    private buildFileName(
        academicStaff: AcademicStaffModel
    ): string {

        const person =
            academicStaff.personal_information;

        const fullName = [
            person.names,
            person.fathers_surname,
            person.mothers_surname
        ]
            .filter(Boolean)
            .join('_')
            .replace(/\s+/g, '_');

        return `Personal_Academico_${academicStaff.id}_${fullName}.pdf`;
    }

    private async loadLogo(): Promise<string> {

        /*
         * Coloca el logo en:
         *
         * public/logo-ie-22234.png
         *
         * Si utilizas otro nombre, cambia solamente esta ruta.
         */

        const response = await fetch('/logo-ie-22234.png');

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