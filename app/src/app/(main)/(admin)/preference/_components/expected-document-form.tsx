"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExpectedDocumentForm, expectedDocumentSchema } from "@/app/server/dtos";
import { trpc } from "@/app/_providers/trpc-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { DocumentPreference } from "@/app/server/module/preference";

interface ExpectedDocumentsFormProps {
  organizationSlug: string;
  user_id: string;
}

export function ExpectedDocumentsForm({ organizationSlug, user_id }: ExpectedDocumentsFormProps) {
  const { data: documentPreferenceByOrganizationId, refetch } = trpc.findDocumentPreferenceByOrganizationSlug.useQuery({
    id: organizationSlug,
  });

  const preferenceValue = documentPreferenceByOrganizationId?.value as DocumentPreference;
  
  // Initialize form with empty array or existing documents
  const form = useForm<ExpectedDocumentForm>({
    resolver: zodResolver(expectedDocumentSchema),
    defaultValues: {
      documents: [],
      id: documentPreferenceByOrganizationId?.id,
      organization_id: organizationSlug,
      user_id: user_id
    },
  });

  // Use state to track documents
  const [documents, setDocuments] = useState<Array<{ type: string; expires: boolean }>>([]);

  // Update form and state when preference data is loaded
  useEffect(() => {
    if (preferenceValue?.documents && preferenceValue.documents.length > 0) {
      setDocuments(preferenceValue.documents);
      form.reset({
        documents: preferenceValue.documents,
        id: documentPreferenceByOrganizationId?.id,
        organization_id: organizationSlug,
        user_id: user_id
      });
    } else {
      setDocuments([{ type: "", expires: false }]);
      form.reset({
        documents: [{ type: "", expires: false }],
        id: documentPreferenceByOrganizationId?.id,
        organization_id: organizationSlug,
        user_id: user_id
      });
    }
  }, [preferenceValue, documentPreferenceByOrganizationId, organizationSlug, user_id, form]);

  const documentsPreference = trpc.documentsPreference.useMutation({      
    onSuccess: async () => {
      toast.success("Successfully updated documents");
      refetch();
    },
    onError: async (error) => {
      console.error(error);
      toast.error(error.message);
    },
  });

  const onExpectedDocumentSubmit = async (data: ExpectedDocumentForm) => {
    documentsPreference.mutate({
      ...data,
      user_id: user_id,
      id: documentPreferenceByOrganizationId?.id
    });
  };

  const addDocument = () => {
    const newDocuments = [...documents, { type: "", expires: false }];
    setDocuments(newDocuments);
    form.setValue("documents", newDocuments);
  };

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    setDocuments(newDocuments);
    form.setValue("documents", newDocuments);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expected Documents</CardTitle>
        <CardDescription>
          Configure which documents are expected from users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onExpectedDocumentSubmit, (error) => console.log("form error: ", error))} 
            className="space-y-4"
          >
            {documents.map((doc, index) => (
              <div key={index} className="flex items-end gap-4">
                <FormField
                  control={form.control}
                  name={`documents.${index}.type`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Document Type</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`documents.${index}.expires`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Expires</FormLabel>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDocument(index)}
                  disabled={documents.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addDocument}>
              Add Document
            </Button>
            <Button 
              disabled={form.formState.isSubmitting} 
              type="submit" 
              className="ml-2"
            >
              {form.formState.isSubmitting ? "Saving..." : "Save Documents"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

