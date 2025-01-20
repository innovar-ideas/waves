"use client";

import { useEffect } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HomeAppLinkForm, homeAppLinkSchema } from "@/app/server/dtos";
import { trpc } from "@/app/_providers/trpc-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { homeLinkPreference } from "@/app/server/module/preference";

interface HomeAppLinkFormProps {
  organizationSlug: string;
  user_id: string;
}

export function HomeAppLinkFormComponent({ organizationSlug, user_id }: HomeAppLinkFormProps) {
  const { data: homeAppLinkPreferenceByOrganizationId, refetch } = trpc.findHomeLinkPreferenceByOrganizationSlug.useQuery({
    id: organizationSlug,
  });

  const preferenceValue = homeAppLinkPreferenceByOrganizationId?.value as homeLinkPreference;

  const form = useForm<HomeAppLinkForm>({
    resolver: zodResolver(homeAppLinkSchema),
    defaultValues: {
      button_name: "",
      link: "",
      id: homeAppLinkPreferenceByOrganizationId?.id,
      organization_id: organizationSlug,
      user_id: user_id
    },
  });

  // Update form when preference data is loaded
  useEffect(() => {
    if (preferenceValue) {
      form.reset({
        button_name: preferenceValue.button_name,
        link: preferenceValue.link,
        id: homeAppLinkPreferenceByOrganizationId?.id,
        organization_id: organizationSlug,
        user_id: user_id
      });
    }
  }, [preferenceValue, homeAppLinkPreferenceByOrganizationId, organizationSlug, user_id, form]);

  const homeLinkPreference = trpc.homeLinkPreference.useMutation({
    onSuccess: async () => {
      toast.success("Successfully updated settings");
      refetch();
    },
    onError: async (error) => {
      console.error(error);
      toast.error(error.message || "Error updating settings");
    },
  });

  const onHomeAppLinkSubmit = async (data: HomeAppLinkForm) => {
    homeLinkPreference.mutate({
      ...data,
      user_id: user_id,
      id: homeAppLinkPreferenceByOrganizationId?.id
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Home App Link</CardTitle>
        <CardDescription>Configure the home app button</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onHomeAppLinkSubmit, (error) => console.log("form error: ", error))} 
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="button_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter button name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link URL</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" placeholder="https://your-app-url.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              disabled={form.formState.isSubmitting} 
              type="submit"
            >
              {form.formState.isSubmitting ? "Saving..." : "Save Home App Link"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

