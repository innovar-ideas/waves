"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { useState } from "react";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";

interface StaffBulkUploadProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface StaffData {
  first_name: string;
  last_name: string;
  password: string;
  phone_number: string;
  email: string;
  tin: string;
  nin: string;
  bank_account_no: string;
  bank_name: string;
  passport_number: string;
  passport_expiry_date: Date;
  marital_status: string;
  date_of_birth: Date;
  profile_picture_url: string;
  documents_url: string;
  position: string;
  skill: string;
  department: string;
  joined_at: Date;
  salary_basis: string;
  amount_per_month: number;
  effective_date: Date;
  payment_type: string;
}

interface RawStaffData {
  "First Name": string;
  "Last Name": string;
  "Password": string;
  "Phone Number": string | number;
  "Email": string;
  "TIN": string | number;
  "NIN": string | number;
  "Bank Account No": string | number;
  "Bank Name": string;
  "Passport Number": string | number;
  "Passport Expiry Date": string;
  "Marital Status": string;
  "Date of Birth": string;
  "Profile Picture URL": string;
  "Documents URL": string;
  "Position": string;
  "Skill": string;
  "Department": string;
  "Joined At": string;
  "Salary Basis": string;
  "Amount Per Month": string | number;
  "Effective Date": string;
  "Payment Type": string;
}

const readExcelFile = async (file: File): Promise<RawStaffData[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(worksheet);
};

export default function StaffBulkUpload({ open, setOpen }: StaffBulkUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutate: createStaffBulkUpload } = trpc.createStaffBulkUpload.useMutation({
    onSuccess: () => {
      toast.success("Staff bulk upload created successfully");
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  const org: string | null = getActiveOrganizationSlugFromLocalStorage();

  const handleDownloadTemplate = (): void => {
    const templateData: string[][] = [
      [
        "First Name",
        "Last Name", 
        "Password",
        "Phone Number",
        "Email",
        "Phone",
        "Bank Account No",
        "Bank Name",
        "Date of Birth",
        "Marital Status",
        "Passport Number",
        "Passport Expiry Date",
        "TIN",
        "NIN",
        "Effective Date",
        "Payment Type",
        "Amount Per Month",
        "Status",
        "Salary Basis",
        "Amount Per Month",
        "Effective Date",
        "Payment Type",
        "Team Designation",
        "Position",
        "Department",
        "Skill",
        "Joined At",
        "Documents URL",
        "Profile Picture URL"
      ]
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    XLSX.utils.book_append_sheet(wb, ws, "Staff Bulk Upload Template");

    XLSX.writeFile(wb, "staff_upload_template.xlsx");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile || !org) return;

    try {
      const rawData: RawStaffData[] = await readExcelFile(selectedFile);
      
      const transformedData: StaffData[] = rawData.map((row: RawStaffData) => ({
        first_name: row["First Name"] || "",
        last_name: row["Last Name"] || "",
        password: row["Password"] || "",
        phone_number: row["Phone Number"]?.toString() || "",
        email: row["Email"] || "",
        tin: row["TIN"]?.toString() || "",
        nin: row["NIN"]?.toString() || "",
        bank_account_no: row["Bank Account No"]?.toString() || "",
        bank_name: row["Bank Name"] || "",
        passport_number: row["Passport Number"]?.toString() || "",
        passport_expiry_date: new Date(row["Passport Expiry Date"]),
        marital_status: row["Marital Status"] || "",
        date_of_birth: new Date(row["Date of Birth"]),
        profile_picture_url: row["Profile Picture URL"] || "",
        documents_url: row["Documents URL"] || "",
        position: row["Position"] || "",
        skill: row["Skill"] || "",
        department: row["Department"] || "",
        joined_at: new Date(row["Joined At"]),
        salary_basis: row["Salary Basis"] || "",
        amount_per_month: Number(row["Amount Per Month"]) || 0,
        effective_date: new Date(row["Effective Date"]),
        payment_type: row["Payment Type"] || ""
      }));

      createStaffBulkUpload({
        organization_id: org,
        list_of_staff: transformedData
      });

    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing file. Please check the file format and try again.");
    }

    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-emerald-800">Bulk Upload Staff</DialogTitle>
          <DialogDescription className="text-emerald-600">
            Download the template, fill it with staff information, and upload it back.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={handleDownloadTemplate}
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>

          <div className="flex flex-col gap-2">
            <label 
              htmlFor="file-upload" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-emerald-200 border-dashed rounded-lg cursor-pointer bg-emerald-50 hover:bg-emerald-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-emerald-600" />
                <p className="mb-2 text-sm text-emerald-600">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-emerald-500">XLSX, XLS</p>
              </div> 
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
              />
            </label>
            {selectedFile && (
              <p className="text-sm text-emerald-600">
                Selected file: {selectedFile.name}
              </p>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Upload Staff Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}