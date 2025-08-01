import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MedicalRecord } from '../types';
import { format } from 'date-fns';

export const generateMedicalRecordPDF = async (records: MedicalRecord[], title: string = 'Medical Records') => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Add header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, yPosition);
  yPosition += 15;

  // Add clinic info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('VetChart Animal Hospital EMR System', margin, yPosition);
  yPosition += 8;
  pdf.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy \'at\' h:mm a')}`, margin, yPosition);
  yPosition += 15;

  // Process each record
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
    }

    // Record header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Medical Record ${i + 1}`, margin, yPosition);
    yPosition += 10;

    // Patient info
    if (record.patient) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Patient Information:', margin, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${record.patient.name}`, margin + 5, yPosition);
      yPosition += 6;
      pdf.text(`Species: ${record.patient.species} | Breed: ${record.patient.breed}`, margin + 5, yPosition);
      yPosition += 6;
      pdf.text(`Age: ${record.patient.age} years | Gender: ${record.patient.gender}`, margin + 5, yPosition);
      yPosition += 6;
      
      if (record.patient.owner) {
        pdf.text(`Owner: ${record.patient.owner.firstName} ${record.patient.owner.lastName}`, margin + 5, yPosition);
        yPosition += 6;
        pdf.text(`Contact: ${record.patient.owner.phone} | ${record.patient.owner.email}`, margin + 5, yPosition);
        yPosition += 10;
      }
    }

    // Visit details
    pdf.setFont('helvetica', 'bold');
    pdf.text('Visit Details:', margin, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Date: ${format(new Date(record.visitDate), 'MMMM dd, yyyy')}`, margin + 5, yPosition);
    yPosition += 6;
    pdf.text(`Veterinarian: Dr. ${record.veterinarian}`, margin + 5, yPosition);
    yPosition += 6;
    pdf.text(`Record Type: ${record.recordType.charAt(0).toUpperCase() + record.recordType.slice(1)}`, margin + 5, yPosition);
    yPosition += 10;

    // Medical details
    const sections = [
      { title: 'Symptoms', content: record.symptoms },
      { title: 'Diagnosis', content: record.diagnosis },
      { title: 'Treatment', content: record.treatment }
    ];

    if (record.notes) {
      sections.push({ title: 'Additional Notes', content: record.notes });
    }

    for (const section of sections) {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${section.title}:`, margin, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(section.content, pageWidth - 2 * margin - 10);
      
      for (const line of lines) {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin + 5, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
    }

    // Add separator between records
    if (i < records.length - 1) {
      yPosition += 10;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
    }
  }

  // Add footer
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    pdf.text('VetChart EMR System - Confidential Medical Records', margin, pageHeight - 10);
  }

  return pdf;
};

export const downloadPDF = (pdf: jsPDF, filename: string) => {
  pdf.save(filename);
};

export const printPDF = (pdf: jsPDF) => {
  const pdfBlob = pdf.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  const printWindow = window.open(pdfUrl);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
        URL.revokeObjectURL(pdfUrl);
      }, 100);
    };
  }
};