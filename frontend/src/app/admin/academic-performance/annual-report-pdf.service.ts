import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { AnnualReportData } from './annual-report.service';

pdfMake.addVirtualFileSystem(pdfFonts);

@Injectable({ providedIn: 'root' })
export class AnnualReportPdfService {
  private readonly PRIMARY_COLOR = '#00897B';
  private readonly DARK_GREEN = '#00695C';
  private readonly BORDER_COLOR = '#D5E5E1';
  private readonly TEXT_COLOR = '#333333';
  private readonly MUTED_COLOR = '#666666';

  async generate(report: AnnualReportData): Promise<void> {
    const fullName = [report.student.fathers_surname, report.student.mothers_surname, report.student.names]
      .filter(Boolean)
      .join(' ');

    const tutorName = report.tutor
      ? [report.tutor.fathers_surname, report.tutor.mothers_surname, report.tutor.names].filter(Boolean).join(' ')
      : 'Sin tutor asignado';

    const logo = await this.loadLogo();

    const documentDefinition: any = {
      pageSize: 'A3', // CAMBIO — antes A4
      pageOrientation: 'landscape',
      pageMargins: [30, 85, 30, 45],

      header: () => ({
        margin: [30, 20, 30, 0],
        columns: [
          { width: 45, image: logo, fit: [40, 40] },
          {
            width: '*',
            stack: [
              { text: 'INSTITUCIÓN EDUCATIVA N.° 22234', style: 'institutionName' },
              { text: 'SANTIAGO CALLE SANTOS', style: 'institutionSubtitle' },
              { text: 'Boleta Final de Notas', style: 'institutionReport' },
            ],
            margin: [8, 2, 0, 0],
          },
          {
            width: 140,
            stack: [
              { text: `Año lectivo ${report.year}`, style: 'headerId', alignment: 'right' },
              { text: `${report.grade} ${report.section}`, style: 'headerType', alignment: 'right' },
            ],
          },
        ],
      }),

      content: [
        { canvas: [{ type: 'rect', x: 0, y: 0, w: 1130, h: 4, color: this.PRIMARY_COLOR }], margin: [0, 0, 0, 12] }, // CAMBIO w: 780 → 1130
        { text: 'BOLETA FINAL DE NOTAS', style: 'title' },
        { text: fullName, style: 'personName' },
        {
          columns: [
            { text: `Tutor: ${tutorName}`, style: 'value' },
            { text: `Promedio General del Año: ${report.general_average ?? '-'}`, style: 'value', alignment: 'right' },
          ],
          margin: [0, 0, 0, 14],
        },

        this.coursesTable(report.courses),
      ],

      footer: (currentPage: number, pageCount: number) => ({
        margin: [30, 10, 30, 0],
        columns: [
          { text: 'I.E. N.° 22234 Santiago Calle Santos', style: 'footer', alignment: 'left' },
          { text: `Página ${currentPage} de ${pageCount}`, style: 'footer', alignment: 'right' },
        ],
      }),

      styles: {
        institutionName: { fontSize: 9, bold: true, color: this.DARK_GREEN },
        institutionSubtitle: { fontSize: 7.5, bold: true, color: this.TEXT_COLOR, margin: [0, 2, 0, 0] },
        institutionReport: { fontSize: 6.5, color: this.MUTED_COLOR, margin: [0, 2, 0, 0] },
        headerId: { fontSize: 8, bold: true, color: this.DARK_GREEN },
        headerType: { fontSize: 7, color: this.MUTED_COLOR, margin: [0, 3, 0, 0] },
        title: { fontSize: 15, bold: true, alignment: 'center', color: this.DARK_GREEN, margin: [0, 0, 0, 4] },
        personName: { fontSize: 11, bold: true, alignment: 'center', color: this.TEXT_COLOR, margin: [0, 0, 0, 4] },
        value: { fontSize: 8.5, color: this.TEXT_COLOR },
        footer: { fontSize: 7, color: this.MUTED_COLOR },
        tableHeader: { fontSize: 7.5, bold: true, color: 'white', alignment: 'center' },
        tableSubHeader: { fontSize: 6.5, bold: true, color: this.TEXT_COLOR, alignment: 'center' },
        cellValue: { fontSize: 7.5, color: this.TEXT_COLOR, alignment: 'center' },
        cellFinal: { fontSize: 8, bold: true, color: this.DARK_GREEN, alignment: 'center' },
      },

      defaultStyle: { fontSize: 8 },
    };

    const fileName = `Boleta_Final_${fullName.replace(/\s+/g, '_')}_${report.year}.pdf`;
    pdfMake.createPdf(documentDefinition).download(fileName);
  }

  private coursesTable(courses: AnnualReportData['courses']): any {
    // 4 bloques × (Diaria, Práctica, Examen, Prom., A) = 20 + Curso + Promedio Final = 22
    const headerRow1: any[] = [{ text: 'Curso', style: 'tableHeader', rowSpan: 2 }];
    const headerRow2: any[] = [{}]; // celda vacía bajo "Curso" (rowSpan)

    const blockLabels = courses[0]?.blocks.map((b) => b.teaching_block) ?? [
      '1° Bimestre',
      '2° Bimestre',
      '3° Bimestre',
      '4° Bimestre',
    ];

    for (const label of blockLabels) {
      headerRow1.push({ text: label, style: 'tableHeader', colSpan: 5 }, {}, {}, {}, {}); // CAMBIO colSpan 4 → 5, una celda vacía más
      headerRow2.push(
        { text: 'Diaria', style: 'tableSubHeader' },
        { text: 'Práctica', style: 'tableSubHeader' },
        { text: 'Examen', style: 'tableSubHeader' },
        { text: 'Prom.', style: 'tableSubHeader' },
        { text: 'A', style: 'tableSubHeader' }, // NUEVO — Asistencia abreviada
      );
    }

    headerRow1.push({ text: 'Promedio Final', style: 'tableHeader', rowSpan: 2 });
    headerRow2.push({});

    const body: any[] = [headerRow1, headerRow2];

    for (const course of courses) {
      const row: any[] = [{ text: course.course, style: 'cellValue', alignment: 'left' }];

      for (const block of course.blocks) {
        row.push(
          { text: block.daily_average ?? '-', style: 'cellValue' },
          { text: block.practice_average ?? '-', style: 'cellValue' },
          { text: block.exam_average ?? '-', style: 'cellValue' },
          { text: block.teaching_block_average ?? '-', style: 'cellValue' },
          { text: this.formatAttendance(block.attendance_average), style: 'cellValue' }, // NUEVO
        );
      }

      row.push({ text: course.overall_course_average ?? '-', style: 'cellFinal' });
      body.push(row);
    }

    // CAMBIO: 5 sub-anchos por bloque, la col "A" más angosta que las demás
    const blockColumnWidths = blockLabels.flatMap(() => [36, 36, 36, 36, 28]);

    return {
      table: {
        headerRows: 2,
        widths: [100, ...blockColumnWidths, 65], // CAMBIO: Curso 90→100, Final 60→65
        body,
      },
      layout: {
        fillColor: (rowIndex: number) => {
          if (rowIndex < 2) return this.PRIMARY_COLOR;
          return rowIndex % 2 === 0 ? '#F7FBFA' : null;
        },
        hLineColor: () => this.BORDER_COLOR,
        vLineColor: () => this.BORDER_COLOR,
        hLineWidth: () => 0.6,
        vLineWidth: () => 0.6,
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      },
    };
  }

  private formatAttendance(value: number | null): string { // NUEVO
    if (value === null || value === undefined) return '-';
    return `${Math.round(value * 100)}%`;
  }

  private async loadLogo(): Promise<string> {
    const response = await fetch('/logo-ie-22234.png');
    if (!response.ok) throw new Error('No se pudo cargar el logo institucional.');
    const blob = await response.blob();
    return this.blobToDataUrl(blob);
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('No se pudo convertir el logo.')));
      reader.onerror = () => reject(new Error('Error leyendo el logo.'));
      reader.readAsDataURL(blob);
    });
  }
}