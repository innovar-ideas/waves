"use client";

import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import TextFile from "@/components/editor";
import { updateContractTemplateSchema } from "@/lib/dtos";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Contract, ContractTemplate } from "@prisma/client";
import { useSession } from "next-auth/react";

type UpdateContractTemplateValues = z.infer<typeof updateContractTemplateSchema>;

interface UpdateTemplateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  template: ContractTemplate & {contract: Contract[]};
}

export function UpdateContractTemplateForm({ open, setOpen, template }: UpdateTemplateProps) {
  const organizationId = getActiveOrganizationSlugFromLocalStorage();
  
  const form = useForm<UpdateContractTemplateValues>({
    resolver: zodResolver(updateContractTemplateSchema),
    defaultValues: {
      id: template.id,
      name: template.name,
      type: template.type,
      sign_before: template.sign_before ?? undefined,
      contract_duration: template.contract_duration ?? undefined,
      details: template.details,
      organization_id: organizationId,
    },
  });
  const admin_id = useSession().data?.user?.id;
  const utils = trpc.useUtils();

  const updateContractTemplate = trpc.updateContractTemplate.useMutation({
    onSuccess: async () => {
      toast.success("Contract template updated successfully");
      utils.getAllContractTemplate.invalidate();
      setOpen(false);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error updating contract template");
    },
  });

  function onSubmit(values: UpdateContractTemplateValues) {
    updateContractTemplate.mutate({ ...values, organization_id: organizationId, sender_id: admin_id as unknown as string });
  }

  const quillRef = useRef<ReactQuill>(null);

  const insertVariableInline = (variable: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const cursorPosition = quill.getSelection()?.index || 0;
      quill.insertText(cursorPosition, variable);
      quill.setSelection({ index: cursorPosition + variable.length, length: 0 });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Contract Template</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter template name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name of your contract template.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter template type" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the type of your contract template.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sign_before"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sign Before (Weeks)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder=" " 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Value is based on weeks
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contract_duration" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Duration (Years)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder=" "
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Value is based on years
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Content</FormLabel>
                  <FormControl>
                    <div className="border rounded-md">
                      <div className="space-x-2 p-2">
                        <button
                          type="button"
                          className="px-3 py-1 rounded-lg bg-gray-500 text-sm text-white border"
                          onClick={() => insertVariableInline("{{name}}")}
                        >
                          Add Name
                        </button>
                        <button
                          type="button"
                          className="border px-3 py-1 rounded-lg text-sm bg-gray-500 text-white"
                          onClick={() => insertVariableInline("{{email}}")}
                        >
                          Add Email
                        </button>
                      </div>
                      <TextFile
                      quillRef={quillRef}
                      value={field.value as unknown as string}
                      onChange={field.onChange}
                    />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Update Template</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
