"use client";
import { useState } from "react";
import { trpc } from "@/app/_providers/trpc-provider";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";

function LoanSettingPage() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState({
    max_percentage: 0,
    max_repayment_months: 0
  });
 
  const slug = getActiveOrganizationSlugFromLocalStorage();
  const { data: loanSettings, isLoading, isError } = trpc.getLoanSettingByOrganizationSlug.useQuery({
    id: slug
  });

  const updateLoanSetting = trpc.updateLoanSetting.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Loan setting updated successfully",
        variant: "default",
      });
      setEditingField(null);
      utils.getLoanSettingByOrganizationSlug.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update loan setting",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800 dark:border-emerald-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 dark:text-red-400 dark:bg-gray-900">
        Error loading loan settings. Please try again later.
      </div>
    );
  }

  const handleEdit = (field: string, value: number) => {
    setEditingField(field);
    setTempValues(prev => ({...prev, [field]: value}));
  };

  const handleSave = (field: string) => {
    if (!loanSettings) return;
    updateLoanSetting.mutate({
      id: loanSettings.id,
      max_percentage: field === "max_percentage" ? tempValues.max_percentage : loanSettings.max_percentage,
      max_repayment_months: field === "max_repayment_months" ? tempValues.max_repayment_months : loanSettings.max_repayment_months,
      organization_id: slug || undefined
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-emerald-600 p-6">
            <h1 className="text-2xl font-semibold text-white">
              Organization Loan Settings
            </h1>
            <p className="text-emerald-100 mt-2">
              Configure your organization loan parameters
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-300">
                      Maximum Loan Percentage
                    </h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      Maximum percentage of salary that can be borrowed
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {editingField === "max_percentage" ? (
                      <>
                        <Input 
                          type="number"
                          value={tempValues.max_percentage}
                          onChange={(e) => setTempValues(prev => ({...prev, max_percentage: parseFloat(e.target.value)}))}
                          className="w-24"
                        />
                        <Button 
                          onClick={() => handleSave("max_percentage")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                          {loanSettings?.max_percentage}%
                        </span>
                        <Button 
                          variant="ghost"
                          onClick={() => handleEdit("max_percentage", loanSettings?.max_percentage || 0)}
                        >
                          <PencilIcon className="h-4 w-4 text-emerald-600" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-300">
                      Maximum Repayment Period
                    </h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      Maximum duration for loan repayment in months
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {editingField === "max_repayment_months" ? (
                      <>
                        <Input 
                          type="number"
                          value={tempValues.max_repayment_months}
                          onChange={(e) => setTempValues(prev => ({...prev, max_repayment_months: parseInt(e.target.value)}))}
                          className="w-24"
                        />
                        <Button 
                          onClick={() => handleSave("max_repayment_months")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                          {loanSettings?.max_repayment_months} months
                        </span>
                        <Button 
                          variant="ghost"
                          onClick={() => handleEdit("max_repayment_months", loanSettings?.max_repayment_months || 0)}
                        >
                          <PencilIcon className="h-4 w-4 text-emerald-600" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanSettingPage;