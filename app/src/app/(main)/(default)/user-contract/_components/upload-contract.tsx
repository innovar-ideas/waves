import * as XLSX from "xlsx";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UploadContract = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];

    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const onSubmit = async () => {
    setIsLoading(true);

    if (!file) {
      toast({ variant: "destructive", description: "Please select a file" });

      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const [firstSheetName] = workbook.SheetNames;
        const sheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        console.error(jsonData);
        
      } catch (error) {
        console.error("Failed to create products", error);

        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to upload bulk line Items",
        });
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className=" min-h-[500px]">
      <div className="py-5">

        <Input
          type="file"
          onChange={handleFileChange}
          disabled={isLoading}
          className="my-5"
        />
        <Button
          onClick={onSubmit}
          disabled={!file || isLoading}
          className="bg-blue text-white"
        >
          {isLoading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : "Upload"}
        </Button>
      </div>
    </div>
  );
};

export default UploadContract;
