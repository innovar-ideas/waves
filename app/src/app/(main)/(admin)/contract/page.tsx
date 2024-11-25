"use client";

import { useState } from "react";
import { ContractTemplatesTable } from "./_components/data-table";
import { ContractTemplateForm } from "./_components/contract-template-form";
import { trpc } from "@/app/_providers/trpc-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { contractTemplateColumns } from "./_components/columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
// import { DataTable } from "@/components/table/data-table";
import AssignContractTemplateToStaff from "./_components/assign-staff";

export default function ContractTemplatesPage() {
  const [openNewTemplateForm, setOpenNewTemplateForm] = useState(false);
  const {data, isPending} = trpc.getAllContractTemplate.useQuery();

  if(isPending){
    <Skeleton className='my-1.5 h-3 w-36' />;
  }


  return (
    <div className="container mx-auto py-2">
        <Tabs defaultValue="contract-template">
          <TabsList className="w-full flex justify-start items-start mb-6">
            <TabsTrigger value="contract-template"> <div> Contract Templates</div></TabsTrigger>
            <TabsTrigger value="assign-template"><div>Assign Template</div> </TabsTrigger>

          </TabsList>

          <TabsContent value="contract-template">
          <div>
          <h1 className="text-2xl font-bold mb-5">Contract Templates</h1>
          {openNewTemplateForm ? <div className="mb-10">
            <h2 className="text-xl font-semibold mb-3">Create New Template</h2>
            <ContractTemplateForm setOpenNewTemplateForm={setOpenNewTemplateForm} />
          </div>
          :
          <div>
            <h2 className="text-xl font-semibold mb-3">Existing Templates</h2>
            <ContractTemplatesTable data={data ?? []} columns={contractTemplateColumns} setOpenNewTemplateForm={setOpenNewTemplateForm} />
          </div>}
      </div>
        </TabsContent>
        <TabsContent value="assign-template">
          <AssignContractTemplateToStaff />
        </TabsContent> 
          </Tabs>
      
      
    </div>
  );
}

