"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Copy, CheckIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { trpc } from "@/app/_providers/trpc-provider";
import { SyncPreferenceForm, syncPreferenceSchema } from "@/app/server/dtos";

interface SyncPreferenceFormProps {
  organizationSlug: string;
  user_id: string;
};

export function SyncPreferenceFormComponent({ organizationSlug, user_id }: SyncPreferenceFormProps) {
  const [apiEndpoint, setApiEndpoint] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

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
    };
  }, [preferenceValue, syncPreference, organizationSlug, user_id, form]);

  const syncPreferenceMutation = trpc.syncPreference.useMutation({
    onSuccess: async (data) => {
      toast.success("Successfully updated sync settings");
      if (data.organization.sync_endpoint) {
        setApiEndpoint(data.organization.sync_endpoint);
      } else {
        setApiEndpoint("");
      }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>External App Sync Settings</CardTitle>
        <CardDescription>
          Configure synchronization settings for clients, vendors, invoices, and purchase orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive" className="bg-yellow-50">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            When enabled, these records will be read-only in the app, and CRUD operations will only be available in the
            external app.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (error) => console.log("form error: ", error))}
            className="space-y-4"
          >
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

            {apiEndpoint && (
              <div className="flex items-center space-x-2 p-4 bg-muted rounded-md">
                <code className="text-sm flex-1">{apiEndpoint}</code>
                <Button type="button" variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? <CheckIcon className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
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

