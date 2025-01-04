"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import { optionSchema, userRoleSchema } from "@/app/server/dtos";
import SelectRoles from "./select-role";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface UserProps {
  userID?: string;
}

const EditUserRole = ({ userID }: UserProps) => {

    type TUserClaimFormData = z.infer<typeof userRoleSchema>;
    type TPermission = z.infer<typeof optionSchema>;

    const [isOpen, setIsOpen] = useState(false);
    const userRoleForm = useForm<TUserClaimFormData>({ resolver: zodResolver(userRoleSchema), defaultValues: { user_id: userID, active: true } });

      const utils = trpc.useUtils();

      const updateUserRole= trpc.updateUserRole.useMutation({
        onSuccess: async () => {
          toast.success("Role updated successfully");
    
          utils.getAllUsers.invalidate().then(() => {
          });
        },
        onError: (error) => {
          console.error(error);
          toast.error("Error updating role");
    
        },
      });
      const { data } = trpc.getUserRoles.useQuery({
        id: userID as string
      });

    useEffect(() => {

        if (data) {
          utils.getAllUsers.invalidate();
          const roles: TPermission[] = [];

          data.forEach((role) => {
            roles.push({ value: role.role.name, label: role.role.name, id: role.role.name });
          });

          userRoleForm.setValue("role_name", roles);
        }

    }, [ data, userRoleForm, utils.getAllUsers]);

    const onSubmitRole = async (input: TUserClaimFormData) => {
      updateUserRole.mutate({...input});

    };

    return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="text-slate-950">Edit User Role</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <div>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Update Roles
            </DialogTitle>
          </DialogHeader>
          
                <Form {...userRoleForm} >
          <form onSubmit={userRoleForm.handleSubmit(onSubmitRole, (error) => console.error(error))}>
            <fieldset disabled={userRoleForm.formState.isSubmitting}>
              <FormField
                control={userRoleForm.control}
                name="role_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gblue">Roles</FormLabel>
                    <FormControl>
                      <SelectRoles {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <div className="flex justify-between my-5">
                <div>
                  <Button disabled={userRoleForm.formState.isSubmitting} className="bg-blue text-black py-2 px-7 rounded-md mx-1 font-medium text-xs" type="submit">Submit</Button>
                </div>
              </div>
            </fieldset>
          </form>
                </Form>
        </div>
      </DialogContent>
      </Dialog>
    );
};

export default EditUserRole;
