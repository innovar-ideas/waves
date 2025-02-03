"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { trpc } from "@/app/_providers/trpc-provider";
import { OrganizationSkillsForm, organizationSkillsSchema } from "@/app/server/dtos";

// Define the schema for the for

interface OrganizationSkillsFormProps {
  organizationSlug: string
  user_id: string
}

export function OrganizationSkillsFormComponent({ organizationSlug, user_id }: OrganizationSkillsFormProps) {
  const [inputValue, setInputValue] = useState("");

  const { data: organizationSkills, refetch } = trpc.findOrganizationSkillsBySlug.useQuery({
    id: organizationSlug,
  });

  const skillsValue = organizationSkills?.value as { skills: string[] };

  const form = useForm<OrganizationSkillsForm>({
    resolver: zodResolver(organizationSkillsSchema),
    defaultValues: {
      skills: [],
      organization_id: organizationSlug,
      user_id: user_id,
      id: organizationSkills?.id,
    },
  });

  // Update form when skills data is loaded
  useEffect(() => {
    if (skillsValue) {
      form.reset({
        skills: skillsValue.skills,
        organization_id: organizationSlug,
        user_id: user_id,
        id: organizationSkills?.id,
      });
    }
  }, [skillsValue, organizationSkills, organizationSlug, user_id, form]);

  const organizationSkillsMutation = trpc.organizationSkills.useMutation({
    onSuccess: async () => {
      toast.success("Successfully updated organization skills");
      refetch();
    },
    onError: async (error) => {
      console.error(error);
      toast.error(error.message || "Error updating organization skills");
    },
  });

  const onSubmit = async (data: OrganizationSkillsForm) => {
    organizationSkillsMutation.mutate({
      ...data,
      user_id: user_id,
      id: organizationSkills?.id,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const skill = inputValue.trim();

      if (skill && !form.getValues("skills").includes(skill)) {
        const currentSkills = form.getValues("skills");
        form.setValue("skills", [...currentSkills, skill]);
        setInputValue("");
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills");
    form.setValue(
      "skills",
      currentSkills.filter((skill) => skill !== skillToRemove),
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Skills</CardTitle>
        <CardDescription>Add skills that members can select in their profiles</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (error) => console.log("form error: ", error))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        placeholder="Type a skill and press Enter"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1">
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-2 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? "Saving..." : "Save Organization Skills"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

