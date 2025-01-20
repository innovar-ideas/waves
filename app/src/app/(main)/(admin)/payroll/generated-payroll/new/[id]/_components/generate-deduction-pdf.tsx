import { jsPDF } from "jspdf";
import { PayrollItem } from "@/app/server/types";

interface DeductionPDFData {
  staffName: string
  deduction: PayrollItem
  month: string
  date: string
}

export const generateDeductionPDF = ({ staffName, deduction, month, date }: DeductionPDFData) => {
  const doc = new jsPDF();
  
  // Add company logo or header
  doc.setFontSize(20);
  doc.text("Deduction Statement", 105, 20, { align: "center" });
  
  // Add staff information
  doc.setFontSize(12);
  doc.text(`Staff Name: ${staffName}`, 20, 40);
  doc.text(`Date: ${date}`, 20, 50);
  doc.text(`Month: ${month}`, 20, 60);
  
  // Add deduction details
  doc.text("Deduction Details:", 20, 80);
  doc.text(`Type: ${deduction.name}`, 30, 90);
  doc.text(`Amount: ${new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN"
  }).format(deduction.amount)}`, 30, 100);
  
  if (deduction.description) {
    doc.text(`Description: ${deduction.description}`, 30, 110);
  }
  
  // Add footer
  const pageWidth = doc.internal.pageSize.width;
  doc.setFontSize(10);
  doc.text("This is an official document", pageWidth / 2, 280, { align: "center" });
  
  // Save the PDF
  doc.save(`${staffName}-${deduction.name}-deduction.pdf`);
};
