"use client";

import { Dispatch, SetStateAction, useRef } from "react";
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
import { contractTemplateSchema } from "@/app/server/dtos";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";

type ContractTemplateValues = z.infer<typeof contractTemplateSchema>;

interface TemplateProps {
    setOpenNewTemplateForm: Dispatch<SetStateAction<boolean>>
}

export function ContractTemplateForm({setOpenNewTemplateForm}: TemplateProps) {

  const form = useForm<ContractTemplateValues>({
    resolver: zodResolver(contractTemplateSchema),
    defaultValues: {
      name: "",
      type: "",
      details: "",
    },
  });
  const utils = trpc.useUtils();

  const addContractTemplate = trpc.createContractTemplate.useMutation({
    onSuccess: async () => {
      toast.success("Contract template added successfully");

      utils.getAllContractTemplate.invalidate();
      setOpenNewTemplateForm(false);
    },
    onError: (error) => {
      console.error(error);

      toast.error("Error in adding contract template");
    },
  });

  function onSubmit(values: ContractTemplateValues) {

    addContractTemplate.mutate({...values });

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
    <>
    <button onClick={()=> setOpenNewTemplateForm(false)} className="p-2 border">Close</button>
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

        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Content</FormLabel>
              <FormControl>
                <div className="border rounded-md">
                <div className="space-x-2">
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
                    value={field.value}
                    onChange={field.onChange}
                    />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create Template</Button>
      </form>
    </Form>
    </>
  );
}

