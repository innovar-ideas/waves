import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import Select from "react-select";
import { LuArrowDown, LuArrowRight } from "react-icons/lu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TeamDesignationType } from "@/app/server/module/designation";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";

// Updated Zod schema with all optional fields
const updateDesignationSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  team_id: z.string().optional(),
  role_level: z.number().optional(),
  description: z.string().optional(),
  quantity: z.number().optional(),
  job_description: z.string().optional(),
  designation_id: z.string().optional(),
});

interface UpdateDesignationFormProps {
  designation: TeamDesignationType;
}

export function UpdateDesignationForm({ designation }: UpdateDesignationFormProps) {
  const [openDescription, setOpenDescription] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const { organizationSlug } = useActiveOrganizationStore();
  const form = useForm<z.infer<typeof updateDesignationSchema>>({
    resolver: zodResolver(updateDesignationSchema),
    defaultValues: {
      id: designation.id ?? "",
      name: designation?.name ?? "",
      team_id: designation?.team_id ?? "",
      role_level: designation?.role_level ?? undefined,
      description: designation?.description ?? "",
      quantity: designation?.quantity ?? undefined,
      job_description: designation?.job_description ?? "",
      designation_id: designation?.designation_id ?? undefined,
    },
  });

  const utils = trpc.useUtils();
  const { data: teams } = trpc.getTeamsByOrganizationId.useQuery({
    id: organizationSlug,
  });

  const updateDesignation = trpc.updateDesignation.useMutation({
    onSuccess: async () => {
      toast.success("Designation updated successfully");
      setOpen(false);
      utils.getAllTeamDesignationsByOrganizationId.invalidate();
      form.reset();
    },
    onError: () => {
      toast.error("Error updating designation");
    },
  });

  function onSubmit(values: z.infer<typeof updateDesignationSchema>) {
    // Filter out empty fields before submitting
    const updatedValues = Object.entries(values).reduce(
      (acc, [key, value]) => (value !== undefined && value !== "" ? { ...acc, [key]: value } : acc),
      {}
    );
    updateDesignation.mutate(updatedValues as z.infer<typeof updateDesignationSchema>);
  }

  return (
    <div className="space-y-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button
            onClick={() => setOpen(true)}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            Update Designation
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] max-w-[500px] overflow-y-auto bg-white p-6 rounded-lg shadow-lg">
          <DialogHeader className="bg-emerald-50 p-4 rounded-t-lg">
            <DialogTitle className="text-emerald-800 text-xl font-semibold">
              Update Designation
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              {/* Designation Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter designation name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Team Selection */}
              <FormField
                control={form.control}
                name="team_id"
                render={() => (
                  <FormItem>
                    <FormLabel>Select Team</FormLabel>
                    <FormControl>
                      <Select
                        placeholder="Select team"
                        options={teams?.map((team) => ({
                          label: team.name,
                          value: team.id,
                        }))}
                        onChange={(option) => form.setValue("team_id", option?.value || "")}
                        className="border-green-200"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: "#e5f0e5",
                            "&:hover": {
                              borderColor: "#86efac",
                            },
                          }),
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter quantity"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter description"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Job Description Toggle */}
              <Button
                type="button"
                onClick={() => setOpenDescription((prev) => !prev)}
                className="flex items-center space-x-2 text-green-600"
              >
                {openDescription ? <LuArrowDown /> : <LuArrowRight />} Team-Specific JD
              </Button>

              {openDescription && (
                <FormField
                  control={form.control}
                  name="job_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team-Specific Job Description</FormLabel>
                      <FormControl>
                        <textarea
                          className="w-full p-2 border rounded-md"
                          placeholder="Enter job description"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="text-sm text-green-600 border-green-600 hover:bg-green-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-sm bg-green-600 hover:bg-green-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
