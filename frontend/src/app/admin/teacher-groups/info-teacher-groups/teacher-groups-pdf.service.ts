import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TeacherGroup } from '../teacher-groups.model';
import { TutorGroupReport, TutorStudentReport } from '../teacher-groups.service';

pdfMake.addVirtualFileSystem(pdfFonts);

@Injectable({
    providedIn: 'root'
})
export class TeacherGroupsPdfService {

    private readonly PRIMARY_COLOR = '#00897B';
    private readonly DARK_GREEN = '#00695C';
    private readonly LIGHT_GREEN = '#E8F5F2';
    private readonly BORDER_COLOR = '#D5E5E1';
    private readonly TEXT_COLOR = '#333333';
    private readonly MUTED_COLOR = '#666666';

    async generate(
        report: TutorGroupReport
    ): Promise<void> {

        const teacherGroup = report.teacher_group;
        const students = report.students;

        const contract =
            teacherGroup.academic_staff_contract;

        const academicStaff =
            contract.academic_staff;

        const person =
            academicStaff.personal_information;

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
                                text: 'Reporte de Grupo de Docente',
                                style: 'institutionReport'
                            }

                        ],

                        margin: [10, 4, 0, 0]
                    },

                    {
                        width: 90,

                        stack: [

                            {
                                text: `N.º ${teacherGroup.id}`,
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

                /*
                 * Línea superior
                 */

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

                /*
                 * Título
                 */

                {
                    text: 'REPORTE DE GRUPO DE DOCENTE',
                    style: 'title'
                },

                {
                    text: fullName,
                    style: 'personName'
                },

                {
                    text: `Código de grupo de docente: ${teacherGroup.id}`,
                    style: 'documentNumber'
                },

                /*
                 * 1. DATOS DEL GRUPO
                 */

                {
                    text: '1. DATOS DEL GRUPO DE DOCENTE',
                    style: 'sectionTitle'
                },

                {
                    table: {

                        widths: ['35%', '65%'],

                        body: [

                            this.row(
                                'Código',
                                teacherGroup.id
                            ),

                            this.row(
                                'Estado',
                                teacherGroup.status
                                    ? 'Activo'
                                    : 'Inactivo'
                            ),

                            this.row(
                                'Tutor',
                                teacherGroup.tutor
                                    ? 'Sí'
                                    : 'No'
                            ),

                            this.row(
                                'Descripción',
                                teacherGroup.description ||
                                'Sin descripción registrada.'
                            ),

                            this.row(
                                'Fecha de creación',
                                this.formatDateTime(
                                    teacherGroup.createdAt
                                )
                            ),

                            this.row(
                                'Última actualización',
                                this.formatDateTime(
                                    teacherGroup.updatedAt
                                )
                            )

                        ]
                    },

                    layout: this.tableLayout(),

                    margin: [0, 0, 0, 22]
                },

                /*
                 * 2. ASIGNACIÓN ACADÉMICA
                 */

                {
                    text: '2. ASIGNACIÓN ACADÉMICA',
                    style: 'sectionTitle'
                },

                {
                    table: {

                        widths: ['35%', '65%'],

                        body: [

                            this.row(
                                'Curso',
                                `${teacherGroup.course.id} - ${teacherGroup.course.course}`
                            ),

                            this.row(
                                'Estado del curso',
                                teacherGroup.course.status
                                    ? 'Activo'
                                    : 'Inactivo'
                            ),

                            this.row(
                                'Grado',
                                `${teacherGroup.grade.id} - ${teacherGroup.grade.grade}`
                            ),

                            this.row(
                                'Estado del grado',
                                teacherGroup.grade.status
                                    ? 'Activo'
                                    : 'Inactivo'
                            ),

                            this.row(
                                'Sección',
                                `${teacherGroup.section.id} - ${teacherGroup.section.section}`
                            ),

                            this.row(
                                'Estado de la sección',
                                teacherGroup.section.status
                                    ? 'Activo'
                                    : 'Inactivo'
                            )

                        ]
                    },

                    layout: this.tableLayout(),

                    margin: [0, 0, 0, 22]
                },

                /*
                 * 3. CONTRATO DEL PERSONAL ACADÉMICO
                 */

                {
                    text: '3. CONTRATO DEL PERSONAL ACADÉMICO',
                    style: 'sectionTitle'
                },

                {
                    table: {

                        widths: ['35%', '65%'],

                        body: [

                            this.row(
                                'Código del contrato',
                                contract.id
                            ),

                            this.row(
                                'Año lectivo',
                                contract.year.year
                            ),

                            this.row(
                                'Inicio de contrato',
                                this.formatDate(
                                    contract.start_date
                                )
                            ),

                            this.row(
                                'Fin de contrato',
                                this.formatDate(
                                    contract.end_date
                                )
                            ),

                            this.row(
                                'Cargo',
                                contract.position ||
                                'Sin cargo registrado.'
                            ),

                            this.row(
                                'Estado',
                                contract.status
                                    ? 'Activo'
                                    : 'Inactivo'
                            ),

                            this.row(
                                'Descripción',
                                contract.description ||
                                'Sin descripción registrada.'
                            )

                        ]
                    },

                    layout: this.tableLayout(),

                    margin: [0, 0, 0, 22]
                },

                /*
                 * 4. PERSONAL ACADÉMICO
                 */

                {
                    text: '4. PERSONAL ACADÉMICO',
                    style: 'sectionTitle'
                },

                {
                    table: {

                        widths: ['35%', '65%'],

                        body: [

                            this.row(
                                'Código',
                                academicStaff.id
                            ),

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
                            )

                        ]
                    },

                    layout: this.tableLayout(),

                    margin: [0, 0, 0, 22]
                },

                /*
                 * 5. INFORMACIÓN PERSONAL
                 */

                {
                    text: '5. INFORMACIÓN PERSONAL',
                    style: 'sectionTitle'
                },

                {
                    table: {

                        widths: ['35%', '65%'],

                        body: [

                            this.row(
                                'Código',
                                person.id
                            ),

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
                                person.dni ||
                                'Sin datos registrados.'
                            ),

                            this.row(
                                'Correo electrónico',
                                person.email ||
                                'Sin datos registrados.'
                            ),

                            this.row(
                                'Teléfono',
                                person.phone_number ||
                                'Sin datos registrados.'
                            ),

                            this.row(
                                'Dirección',
                                person.address ||
                                'Sin datos registrados.'
                            ),

                            this.row(
                                'Distrito',
                                person.district ||
                                'Sin datos registrados.'
                            ),

                            this.row(
                                'Provincia',
                                person.province ||
                                'Sin datos registrados.'
                            ),

                            this.row(
                                'Departamento',
                                person.department ||
                                'Sin datos registrados.'
                            ),

                            this.row(
                                'Estado',
                                person.status
                                    ? 'Activo'
                                    : 'Inactivo'
                            ),

                            this.row(
                                'Descripción',
                                person.description ||
                                'Sin descripción registrada.'
                            ),

                            this.row(
                                'Fecha de registro',
                                this.formatDateTime(
                                    person.createdAt
                                )
                            ),

                            this.row(
                                'Última actualización',
                                this.formatDateTime(
                                    person.updatedAt
                                )
                            )

                        ]
                    },

                    layout: this.tableLayout(),

                    margin: [0, 0, 0, 22]
                },

                /*
                 * 6. AÑO LECTIVO
                 */

                {
                    text: '6. AÑO LECTIVO',
                    style: 'sectionTitle'
                },

                {
                    table: {

                        widths: ['35%', '65%'],

                        body: [

                            this.row(
                                'Código',
                                contract.year.id
                            ),

                            this.row(
                                'Año',
                                contract.year.year
                            ),

                            this.row(
                                'Estado',
                                contract.year.status
                                    ? 'Activo'
                                    : 'Inactivo'
                            )

                        ]
                    },

                    layout: this.tableLayout(),

                    margin: [0, 0, 0, 22]
                },

                /*
                 * 7. INFORMACIÓN DEL REPORTE
                 */

                {
                    text: '8. INFORMACIÓN DEL REPORTE',
                    style: 'sectionTitle'
                },

                {
                    table: {

                        widths: ['35%', '65%'],

                        body: [

                            this.row(
                                'Grupo de docente',
                                String(teacherGroup.id)
                            ),

                            this.row(
                                'Docente',
                                fullName
                            ),

                            this.row(
                                'Curso',
                                teacherGroup.course.course
                            ),

                            this.row(
                                'Grado',
                                teacherGroup.grade.grade
                            ),

                            this.row(
                                'Sección',
                                teacherGroup.section.section
                            ),

                            this.row(
                                'Año lectivo',
                                contract.year.year
                            ),

                            this.row(
                                'Tutor',
                                teacherGroup.tutor
                                    ? 'Sí'
                                    : 'No'
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
                },

                {
                    text: '7. ESTUDIANTES DEL GRUPO',
                    style: 'sectionTitle'
                },

                {
                    text: `Total de estudiantes matriculados: ${students.length}`,
                    style: 'studentCount',
                    margin: [0, -2, 0, 8]
                },

                students.length > 0
                    ? this.studentsTable(students)
                    : {
                        table: {
                            widths: ['*'],
                            body: [
                                [
                                    {
                                        text: 'No existen estudiantes matriculados en este grupo.',
                                        style: 'emptyValue'
                                    }
                                ]
                            ]
                        },

                        layout: this.tableLayout(),

                        margin: [0, 0, 0, 22]
                    },

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

                footer: {
                    fontSize: 7,
                    color: this.MUTED_COLOR
                },

                studentValue: {
                    fontSize: 7.5,
                    color: this.TEXT_COLOR
                },

                emptyValue: {
                    fontSize: 8.5,
                    color: this.MUTED_COLOR,
                    italics: true
                },

                studentCount: {
                    fontSize: 8,
                    bold: true,
                    color: this.TEXT_COLOR,
                    margin: [0, 0, 0, 8]
                },

            },

            defaultStyle: {
                fontSize: 8.5
            }
        };

        const fileName =
            this.buildFileName(teacherGroup);

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

    private tableLayout(): any {

        return {

            fillColor: (rowIndex: number) => {

                if (rowIndex % 2 === 0) {
                    return this.LIGHT_GREEN;
                }

                return null;
            },

            hLineColor: () =>
                this.BORDER_COLOR,

            vLineColor: () =>
                this.BORDER_COLOR,

            hLineWidth: () => 0.6,

            vLineWidth: () => 0.6,

            paddingLeft: () => 8,

            paddingRight: () => 8,

            paddingTop: () => 6,

            paddingBottom: () => 6
        };
    }

    private studentsTable(
        students: TutorStudentReport[]
    ): any {

        const body: any[] = [

            [
                {
                    text: 'N.º',
                    style: 'tableHeader'
                },

                {
                    text: 'Estudiante',
                    style: 'tableHeader'
                },

                {
                    text: 'DNI',
                    style: 'tableHeader'
                },

                {
                    text: 'Correo electrónico',
                    style: 'tableHeader'
                },

                {
                    text: 'Teléfono',
                    style: 'tableHeader'
                },

                {
                    text: 'Estado',
                    style: 'tableHeader'
                }
            ]

        ];

        students.forEach((student, index) => {

            const fullName = [
                student.names,
                student.fathers_surname,
                student.mothers_surname
            ]
                .filter(Boolean)
                .join(' ');

            body.push([

                {
                    text: String(index + 1),
                    style: 'studentValue',
                    alignment: 'center'
                },

                {
                    text: fullName,
                    style: 'studentValue'
                },

                {
                    text: student.dni || 'Sin datos',
                    style: 'studentValue'
                },

                {
                    text: student.email || 'Sin datos',
                    style: 'studentValue'
                },

                {
                    text: student.phone_number || 'Sin datos',
                    style: 'studentValue'
                },

                {
                    text: student.status
                        ? 'Activo'
                        : 'Inactivo',
                    style: 'studentValue'
                }

            ]);
        });

        return {

            table: {

                headerRows: 1,

                widths: [
                    '6%',
                    '29%',
                    '14%',
                    '25%',
                    '14%',
                    '12%'
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

                hLineColor: () =>
                    this.BORDER_COLOR,

                vLineColor: () =>
                    this.BORDER_COLOR,

                hLineWidth: () => 0.6,

                vLineWidth: () => 0.6,

                paddingLeft: () => 5,

                paddingRight: () => 5,

                paddingTop: () => 5,

                paddingBottom: () => 5
            },

            margin: [0, 0, 0, 22]
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
        teacherGroup: TeacherGroup
    ): string {

        const person =
            teacherGroup
                .academic_staff_contract
                .academic_staff
                .personal_information;

        const fullName = [

            person.names,

            person.fathers_surname,

            person.mothers_surname

        ]
            .filter(Boolean)
            .join('_')
            .replace(/\s+/g, '_');

        return `Grupo_Docente_${teacherGroup.id}_${fullName}.pdf`;
    }

    private async loadLogo(): Promise<string> {

        const response =
            await fetch('/logo-ie-22234.png');

        if (!response.ok) {

            throw new Error(
                'No se pudo cargar el logo institucional.'
            );
        }

        const blob =
            await response.blob();

        return await this.blobToDataUrl(blob);
    }

    private blobToDataUrl(
        blob: Blob
    ): Promise<string> {

        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();

                reader.onload = () => {

                    if (
                        typeof reader.result ===
                        'string'
                    ) {

                        resolve(
                            reader.result
                        );

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
            }
        );
    }
    
}