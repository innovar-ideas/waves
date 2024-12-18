import { updateStaffDepartmentSchema } from "@/lib/dtos";
import { zodResolver } from "@hookform/resolvers/zod";
import { TUpdateStaffDepartmentSchema } from "@/lib/dtos";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";

interface UpdateStaffDepartmentProps {
    staff_id: string,
    open: boolean,
    onOpenChange: (open: boolean) => void,
}

export default function UpdateStaffDepartment({ staff_id, open, onOpenChange }: UpdateStaffDepartmentProps) {
    const { organizationSlug } = useActiveOrganizationStore();
    const [selectedTeam, setSelectedTeam] = useState<string>("");

    const utils = trpc.useUtils();
    const form = useForm<TUpdateStaffDepartmentSchema>({
        resolver: zodResolver(updateStaffDepartmentSchema),
        defaultValues: {
            staff_id: staff_id,
            team_id: "",
            department_id: ""
        }
    });

    const { mutate: updateStaffDepartment } = trpc.updateStaffDepartment.useMutation({
        onSuccess: () => {
            toast.success("Staff department updated successfully");
            
            onOpenChange(false);
            form.reset();
            utils.getStaffsByOrganizationId.invalidate();
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const { data: teams, isLoading: teamsLoading, isLoading } = trpc.getTeamsByOrganizationId.useQuery({
        id: organizationSlug
    });

    const { data: teamDesignations, isLoading: designationsLoading } = trpc.getTeamDesignationsByTeamId.useQuery({
        id: selectedTeam
    }, {
        enabled: !!selectedTeam
    });

    const onSubmit = (values: TUpdateStaffDepartmentSchema) => {
        updateStaffDepartment(values);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-green-700 flex items-center gap-2">
                        <span className="h-8 w-1 bg-green-600 rounded-full"></span>
                        Update Staff Department
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                        <FormField
                            control={form.control}
                            name="team_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-green-700 font-medium">Select Team</FormLabel>
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            setSelectedTeam(value);
                                            form.setValue("department_id", "");
                                        }}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="border-green-200 focus:ring-green-500">
                                                <SelectValue placeholder={teamsLoading ? "Loading teams..." : "Select a team"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {teams?.map((team) => (
                                                <SelectItem 
                                                    key={team.id} 
                                                    value={team.id}
                                                    className="hover:bg-green-50 focus:bg-green-50"
                                                >
                                                    {team.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="department_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-green-700 font-medium">Select Designation</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={!selectedTeam || designationsLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="border-green-200 focus:ring-green-500">
                                                <SelectValue 
                                                    placeholder={
                                                        designationsLoading 
                                                            ? "Loading designations..." 
                                                            : !selectedTeam 
                                                                ? "Please select a team first"
                                                                : "Select a designation"
                                                    } 
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {teamDesignations?.map((designation) => (
                                                <SelectItem 
                                                    key={designation.id} 
                                                    value={designation.designation_id}
                                                    className="hover:bg-green-50 focus:bg-green-50"
                                                >
                                                    {designation.designation.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button 
                                type="button"
                                variant="outline" 
                                onClick={() => onOpenChange(false)}
                                className="border-green-600 text-green-600 hover:bg-green-50"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {isLoading ? "Updating..." : "Update Department"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
