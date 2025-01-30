"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Loader, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ArrowLeft } from "lucide-react";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { BudgetReportContent } from "./_components/budget-report-content";

function BudgetReportPage({ params: { id } }: { params: { id: string } }) {
  const { organizationSlug } = useActiveOrganizationStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: organizationData, isLoading: isOrganizationLoading } = trpc.getActiveOrganization.useQuery({
    id: organizationSlug,
  });

  const { data: budget, isLoading: isBudgetLoading } = trpc.getBudget.useQuery({ id });

  const { data: currentOrganizationPreferences } = trpc.getOrganizationPreference.useQuery({ slug: organizationSlug });

  const smallLogo =
    (currentOrganizationPreferences?.find((pref) => pref.name === "smallLogo")?.value as string) ||
    "/schoolwave-logo-cropped.png";

  const isLoading = isOrganizationLoading || isBudgetLoading;

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader />
      </div>
    );
  }

  if (!budget || !organizationData) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p>No budget data available</p>
      </div>
    );
  }

  const handlePrint = () => {
    const printContent = document.createElement("div");
    printContent.innerHTML = contentRef.current?.innerHTML || "";
    
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    
    window.print();
    
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore React functionality
  };


  const handleDownload = async () => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      
      const pageWidth = 210;
      const pageHeight = 297;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

     
      const horizontalMargins = 10; 
      const topMargin = 10; 
      const availableWidth = pageWidth - (horizontalMargins * 2);

      
      const imageRatio = canvas.height / canvas.width;
      const scaledHeight = availableWidth * imageRatio;

     
      const xOffset = horizontalMargins;
      const yOffset = topMargin;

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        xOffset,
        yOffset,
        availableWidth,
        scaledHeight
      );

      // If content exceeds page height, it will automatically flow to next pages
      if (scaledHeight > pageHeight - topMargin) {
        pdf.addPage();
      }

      pdf.save(`${budget.name}-budget-report.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <main className='p-4'>
      <div className='mb-4 hidden justify-end space-x-2 print:hidden md:flex'>
        <Button onClick={() => router.back()} className="bg-primaryTheme-500 text-white hover:bg-primaryTheme-600"> <ArrowLeft className='mr-2 h-4 w-4' /> Back</Button>
        <Button variant='outline' onClick={handlePrint}>
          <Printer className='mr-2 h-4 w-4' />
          Print
        </Button>
        <Button variant='outline' onClick={handleDownload}>
          <Download className='mr-2 h-4 w-4' />
          Download PDF
        </Button>
      </div>

      <div ref={contentRef}>
        <BudgetReportContent
          organizationData={{ name: "Default", contact_email: "Default" }}
          budget={budget}
          logo={smallLogo}
        />
      </div>
    </main>
  );
}

export default BudgetReportPage; 