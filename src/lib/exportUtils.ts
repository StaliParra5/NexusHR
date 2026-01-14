import { Employee } from '@/types';

// --- CSV Helper ---
export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- CSV Generators ---
export const generateEmployeeCSV = (employee: Employee) => {
  const headers = ['ID', 'Nombre', 'Rol', 'Departamento', 'Carga (%)', 'Estado', 'Fecha Reporte'];
  const row = [
    employee.id,
    `"${employee.name}"`,
    `"${employee.role}"`,
    `"${employee.department}"`,
    employee.workload,
    employee.status,
    new Date().toLocaleDateString()
  ];
  
  const csvContent = [headers.join(','), row.join(',')].join('\n');
  downloadCSV(csvContent, `Reporte_Personal_${employee.name.replace(/\s+/g, '_')}`);
};

export const generateTeamCSV = (employees: Employee[], filename: string = 'Reporte_Equipo') => {
  const headers = ['ID', 'Nombre', 'Rol', 'Departamento', 'Carga (%)', 'Estado', 'Fecha Reporte'];
  
  const rows = employees.map(emp => [
    emp.id,
    `"${emp.name}"`,
    `"${emp.role}"`,
    `"${emp.department}"`,
    emp.workload,
    emp.status,
    new Date().toLocaleDateString()
  ].join(','));
  
  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadCSV(csvContent, filename);
};

// --- Excel Generator (Dynamic Import) ---
export const generateTeamExcel = async (employees: Employee[], filename: string = 'Reporte_Equipo') => {
  const XLSX = await import('xlsx');

  // 1. Prepare Data
  const data = employees.map(emp => ({
    'ID': emp.id,
    'Nombre': emp.name,
    'Rol': emp.role || 'N/A',
    'Departamento': emp.department || 'N/A',
    'Carga (%)': `${emp.workload}%`,
    'Estado': emp.status === 'Active' ? 'Activo' : emp.status === 'Inactive' ? 'Inactivo' : 'Alerta',
    'Fecha Reporte': new Date().toLocaleDateString()
  }));

  // 2. Create Worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 3. Customize Header Widths
  const wscols = [
    { wch: 30 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 15 }
  ];
  worksheet['!cols'] = wscols;

  // 4. Create Workbook and Append
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Personal");

  // 5. Save File
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// --- PDF Generators (Dynamic Import) ---
export const generateTeamPDF = async (employees: Employee[], title: string = 'Reporte de Equipo') => {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("NexusHR - Reporte de Gestión", 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Reporte: ${title}`, 14, 32);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 38);

    // Table Data
    const tableData = employees.map(emp => [
        emp.name,
        emp.role || 'N/A',
        emp.department || 'N/A',
        `${emp.workload}%`,
        emp.status
    ]);

    autoTable(doc, {
        head: [['Empleado', 'Rol', 'Departamento', 'Carga', 'Estado']],
        body: tableData,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 3 },
        alternateRowStyles: { fillColor: [240, 248, 255] }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text('Generado por NexusHR System', 14, doc.internal.pageSize.height - 10);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
    }

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

export const generateEmployeePDF = async (employee: Employee) => {
    const jsPDF = (await import('jspdf')).default;
    
    const doc = new jsPDF();

    // Brand / Header
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Ficha de Empleado", 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text("NexusHR Confidential", 105, 30, { align: 'center' });

    // Employee Details Card
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    
    let yPos = 60;
    const lineHeight = 12;

    const addDetail = (label: string, value: string) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 80, yPos);
        yPos += lineHeight;
    };

    addDetail("Nombre Completo", employee.name);
    addDetail("ID de Empleado", employee.id);
    addDetail("Departamento", employee.department || 'No Asignado');
    addDetail("Rol / Cargo", employee.role || 'No Asignado');
    addDetail("Estado Actual", employee.status);
    addDetail("Carga de Trabajo", `${employee.workload}%`);
    addDetail("Fecha de Reporte", new Date().toLocaleDateString());

    // Visual Indicator for Workload
    yPos += 10;
    doc.setDrawColor(200);
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(20, yPos, 170, 10, 3, 3, 'FD');
    
    const workloadWidth = (Number(employee.workload) / 100) * 170;
    let barColor = [46, 204, 113]; // Green
    if (Number(employee.workload) > 70) barColor = [243, 156, 18]; // Orange
    if (Number(employee.workload) > 90) barColor = [231, 76, 60]; // Red
    
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    doc.roundedRect(20, yPos, workloadWidth, 10, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Visualización de Carga Operativa", 20, yPos + 16);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Este documento es confidencial y para uso interno exclusivo.', 105, 280, { align: 'center' });

    doc.save(`Ficha_${employee.name.replace(/\s+/g, '_')}.pdf`);
};
