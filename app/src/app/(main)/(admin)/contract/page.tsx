"use client";

import { useState } from "react";
import { ContractTemplatesTable } from "./_components/data-table";
import { ContractTemplateForm } from "./_components/contract-template-form";
import { trpc } from "@/app/_providers/trpc-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { contractTemplateColumns } from "./_components/columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssignContractTemplateToStaff from "./_components/assign-staff";

export default function ContractTemplatesPage() {
  const [openNewTemplateForm, setOpenNewTemplateForm] = useState(false);
  const { data, isPending } = trpc.getAllContractTemplate.useQuery();

  if (isPending) {
    <Skeleton className='my-1.5 h-3 w-36' />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4">
        <Tabs defaultValue="contract-template">
          <TabsList className="w-full flex justify-start items-start mb-8 bg-green-50 p-1 rounded-lg border border-green-100">
            <TabsTrigger 
              value="contract-template"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white px-6 py-2 rounded-md transition-all"
            >
              <div className="font-medium">Contract Templates</div>
            </TabsTrigger>
            <TabsTrigger 
              value="assign-template"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white px-6 py-2 rounded-md transition-all"
            >
              <div className="font-medium">Assign Template</div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contract-template">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h1 className="text-3xl font-bold mb-6 text-gray-900">Contract Templates</h1>
              {openNewTemplateForm ? (
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create New Template</h2>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <ContractTemplateForm setOpenNewTemplateForm={setOpenNewTemplateForm} />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">Existing Templates</h2>
                  <div className="bg-white rounded-lg">
                    <ContractTemplatesTable 
                      data={data ?? []} 
                      columns={contractTemplateColumns} 
                      setOpenNewTemplateForm={setOpenNewTemplateForm} 
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="assign-template">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <AssignContractTemplateToStaff />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
