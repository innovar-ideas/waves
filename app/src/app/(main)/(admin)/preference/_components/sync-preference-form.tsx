"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Copy, CheckIcon, HelpCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { trpc } from "@/app/_providers/trpc-provider";
import { type SyncPreferenceForm, syncPreferenceSchema } from "@/app/server/dtos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MODEL_DEFINITIONS, ModelType } from "./types";

interface SyncPreferenceFormProps {
  organizationSlug: string
  user_id: string
}

function FieldBadge({ type, required }: { type: string; required: boolean }) {
  const getColor = (type: string) => {
    switch (type) {
      case "string":
        return "bg-blue-500";
      case "number":
        return "bg-green-500";
      case "enum":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex gap-2">
      <Badge variant="secondary" className={`${getColor(type)} text-white`}>
        {type}
      </Badge>
      {required && (
        <Badge variant="secondary" className="bg-red-500 text-white">
          required
        </Badge>
      )}
    </div>
  );
}

export function SyncPreferenceFormComponent({ organizationSlug, user_id }: SyncPreferenceFormProps) {
  const [apiEndpoint] = useState<string>("http://localhost:8090/api/sync");
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>("invoice");

  const { data: syncPreference, refetch } = trpc.findOrganizationSyncPreferenceBySlug.useQuery({
    id: organizationSlug,
  });

  const preferenceValue = syncPreference?.value as { syncWithExternalApp: "yes" | "no" };

  const form = useForm<SyncPreferenceForm>({
    resolver: zodResolver(syncPreferenceSchema),
    defaultValues: {
      syncWithExternalApp: "no",
      organization_id: organizationSlug,
      user_id: user_id,
      id: syncPreference?.id,
    },
  });

  useEffect(() => {
    if (preferenceValue) {
      form.reset({
        syncWithExternalApp: preferenceValue.syncWithExternalApp,
        organization_id: organizationSlug,
        user_id: user_id,
        id: syncPreference?.id,
      });
    }
  }, [preferenceValue, syncPreference, organizationSlug, user_id, form]);

  const syncPreferenceMutation = trpc.syncPreference.useMutation({
    onSuccess: async () => {
      toast.success("Successfully updated sync settings");
      refetch();
    },
    onError: async (error) => {
      console.error(error);
      toast.error(error.message || "Error updating sync settings");
    },
  });

  const onSubmit = async (data: SyncPreferenceForm) => {
    syncPreferenceMutation.mutate({
      ...data,
      user_id: user_id,
      id: syncPreference?.id,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apiEndpoint);
      setCopied(true);
      toast.success("API endpoint copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(`Failed to copy to clipboard: ${err}`);
    }
  };

  const getExamplePayload = (model: ModelType) => {
    const modelDef = MODEL_DEFINITIONS.find((m) => m.name === model);
    if (!modelDef) return "{}";

    const exampleData = modelDef.fields.reduce(
      (acc, field) => {
        acc[field.name] = field.example;
        return acc;
      },
      {} as Record<string, string | number>,
    );

    return JSON.stringify(
      {
        organization_id: organizationSlug,
        model: model,
        data: [exampleData],
      },
      null,
      2,
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>External App Sync Settings</CardTitle>
        <CardDescription>
          Configure synchronization settings for clients, vendors, invoices, and purchase orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="destructive" className="bg-yellow-50">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            When enabled, these records will be read-only in the app, and CRUD operations will only be available in the
            external app.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (error) => console.error("Form error: ", error))} className="space-y-6">
            <FormField
              control={form.control}
              name="syncWithExternalApp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sync with External App</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sync preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("syncWithExternalApp") === "yes" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 p-4 bg-muted rounded-md">
                  <code className="text-sm flex-1">{apiEndpoint}</code>
                  <Button type="button" variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? <CheckIcon className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <Tabs value={selectedModel} onValueChange={(v) => setSelectedModel(v as ModelType)}>
                  <TabsList className="grid grid-cols-4 gap-4">
                    {MODEL_DEFINITIONS.map((model) => (
                      <TabsTrigger key={model.name} value={model.name} className="w-full">
                        {model.displayName}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {MODEL_DEFINITIONS.map((model) => (
                    <TabsContent key={model.name} value={model.name} className="space-y-4">
                      <div className="rounded-md border">
                        <div className="grid grid-cols-[1fr,auto,2fr] gap-4 p-3 font-medium border-b">
                          <div>Field Name</div>
                          <div>Type</div>
                          <div>Description</div>
                        </div>
                        {model.fields.map((field) => (
                          <div
                            key={field.name}
                            className="grid grid-cols-[1fr,auto,2fr] gap-4 p-3 items-center border-b"
                          >
                            <code className="text-sm">{field.name}</code>
                            <FieldBadge type={field.type} required={field.required} />
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              {field.description}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <HelpCircle className="h-4 w-4" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Example: {JSON.stringify(field.example)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Example Payload</h3>
                        <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                          <code>{getExamplePayload(model.name)}</code>
                        </pre>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}

            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? "Saving..." : "Save Sync Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

