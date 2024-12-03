"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel, FormMessage, FormControl, FormItem } from "@/components/ui/form";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/app/_providers/trpc-provider";
import { updatePolicyAndProcedureSchema } from "@/app/server/dtos";
import { UpdatePolicyAndProcedureSchema } from "@/app/server/dtos";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useEffect } from "react";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});


export default function UpdateProceduresForm() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const router = useRouter();
  const { organizationSlug } = useActiveOrganizationStore();
  const {data: teams} = trpc.getTeamsByOrganizationId.useQuery({id: organizationSlug});

  const { id } = useParams();
  const { data: policyAndProcedure, isLoading } = trpc.getPolicyAndProcedureById.useQuery({ id: id as string });

  const form = useForm<UpdatePolicyAndProcedureSchema>({
    resolver: zodResolver(updatePolicyAndProcedureSchema),
    defaultValues: {
      id: id as string,
      title: policyAndProcedure?.title || "",
      content: policyAndProcedure?.content || "",
      team_id: policyAndProcedure?.team_id || "",
    },
    mode: "onChange",
  });


  useEffect(() => {
    if (policyAndProcedure) {
      form.reset({
        id: policyAndProcedure.id,
        title: policyAndProcedure.title,
        content: policyAndProcedure.content,
        team_id: policyAndProcedure.team_id || "",
      });
    }
  }, [policyAndProcedure, form]);

  const updatePolicyAndProcedure = trpc.updatePolicyAndProcedure.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Policy and Procedure Updated Successfully",
      });

      await utils.getAllPolicyAndProcedureByOrganization.invalidate();
      router.push("/pulicies-and-procedures");
      form.reset();
    },
    onError: async (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Failed to update policy and procedure",
      });
    },
  });

  const onSubmit = (values: UpdatePolicyAndProcedureSchema) => {
    updatePolicyAndProcedure.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="h-full bg-white rounded-lg shadow-xl">
          <div className="bg-emerald-50 p-4 rounded-t-lg border-b border-emerald-100">
            <h1 className="text-emerald-800 text-lg font-semibold">Update Policy and Procedure</h1>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
              <fieldset disabled={updatePolicyAndProcedure.isPending} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Policy and Procedure Title</FormLabel>
                      <FormControl>
                        <Input 
                          data-cy="title" 
                          placeholder="e.g. Annual Leave, Sick Leave" 
                          className="w-full border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                {teams && teams.length > 0 && (
                  <FormField
                    control={form.control}
                    name="team_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Select Team</FormLabel>
                        <FormControl>
                          <select
                            className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                            onChange={field.onChange}
                            value={field.value}
                            data-cy="team_id"
                          >
                            <option value="">Select Team</option>
                            {teams.map((team) => (
                              <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Content</FormLabel>
                      <FormControl>
                        <div className="min-h-[400px]">
                          <ReactQuill
                            theme="snow"
                            value={field.value}
                            onChange={field.onChange}
                            className="h-[350px]"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    Cancel
                  </Button>

                  <Button
                    data-cy="submit"
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={updatePolicyAndProcedure.isPending}
                  >
                    {updatePolicyAndProcedure.isPending ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      "Update Policy and Procedure"
                    )}
                  </Button>
                </div>
              </fieldset>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}