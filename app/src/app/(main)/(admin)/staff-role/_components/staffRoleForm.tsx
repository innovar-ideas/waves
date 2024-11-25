import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { staffRoleSchema } from "@/app/server/dtos";
import { Input } from "@/components/ui/input";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "@/hooks/use-toast";

interface PackageFormProps {
  handlePackageFormShow: () => void;
//   refetch: () => void;
//   staffRole: StaffRole;
}

type TFormData = z.infer<typeof staffRoleSchema>;


const StaffRoleForm = ({
  handlePackageFormShow,
//   refetch,
//   staffRole
}: PackageFormProps) => {
  type TFormValues = z.infer<typeof staffRoleSchema>;

  const form = useForm<TFormValues>({ resolver: zodResolver(staffRoleSchema)});
  const utils = trpc.useUtils();
  const [loading, setLoading] = useState(false);
  
  const addStaff = trpc.createStaffRole.useMutation({    
    onSuccess: async () => {
        // refetch();
        toast({
        title: "Success",
        variant: "default",
        description: "Successfully created staff role",
      });

      utils.getAllStaffs.invalidate().then(() => {
        // setOpenStaffForm(false);
      });
      setLoading(false);
    },
    onError: (error) => {
      console.error(error);

      toast({
        title: "Error",
        variant: "destructive",
        description: "Error creating the staff",
      });
      setLoading(false);

    },
  });

  const onSubmit = (values: TFormData) => {
    setLoading(true);
    addStaff.mutate(values);

  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="py-1">
        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
            <FormItem>
                <FormLabel> Name</FormLabel>
                <FormControl>
                <Input
                    placeholder="Please enter password"
                    {...field}
                />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
    </div>

        <div className="flex gap-5 py-1">
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            className="text-sm bg-blue-500 py-2 px-4 text-white border border-1 border-blue rounded-sm hover:font-semibold marker:"
            disabled={loading}
          >
            {loading ? "Loading..." : "Submit"}
          </Button>

          <Button
            type="button"
            className="text-sm bg-white py-2 px-4 text-black border border-1 border-red rounded-sm hover:font-semibold"
            onClick={() => handlePackageFormShow()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StaffRoleForm;
