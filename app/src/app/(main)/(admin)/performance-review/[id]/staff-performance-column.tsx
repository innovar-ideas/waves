import { PerformanceReviewTemplate, StaffProfile, Team } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Dialog, DialogDescription, DialogTitle, DialogHeader, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { performanceReviewTemplateMetricsType } from "@/app/server/module/performance-review";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import { createPerformanceForStaffReviewSchema } from "@/app/server/dtos";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { Form } from "@/components/ui/form";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import UpdatePerformanceReview, { updatePerformanceReviewType } from "./update-review";
import DeletePerformanceReviewModal from "./delete-performance-review";
import Link from "next/link";

export type StaffPerformanceColumnType = {
    staff_name?: string;
    designation_name?: string;
    team_name?: string;
    staff?: StaffProfile;
    team?: Team;
    template?: PerformanceReviewTemplate;
};

export const CreatePerformanceReviewModal = ({ staff, team, template }: {
  staff: StaffPerformanceColumnType;
  team?: Team;
  template?: PerformanceReviewTemplate;
}) => {
  const [open, setOpen] = useState(false);
  const session = useSession().data?.user;
  const createPerformanceForStaffReview = trpc.createPerformanceForStaffReview.useMutation({
    onSuccess: () => {
      toast.success("Performance review created successfully");
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create performance review");
    }
  });

  const orgId = getActiveOrganizationSlugFromLocalStorage();
  const templateMetrics = template?.metrics as unknown as performanceReviewTemplateMetricsType[] || [];
  
  const form = useForm<z.infer<typeof createPerformanceForStaffReviewSchema>>({
    resolver: zodResolver(createPerformanceForStaffReviewSchema),
    defaultValues: {
      organization_id: orgId || "",
      created_by_id: template?.created_by_id || "",
      staff_id: staff?.staff?.id || "",
      template_id: template?.id || "",
      team_id: team?.id || "",
      reviewer_id: session?.id || "",
      feedback: templateMetrics?.map(metric => ({
        column_name: metric?.column_name || "",
        column_type: metric?.column_type || "text",
        column_value: ""
      })) || []
    }
  });

  const handleSubmit = (data: z.infer<typeof createPerformanceForStaffReviewSchema>) => {
    if (!staff?.staff?.id || !team?.id || !template?.id || !orgId || !session?.id) {
      toast.error("Missing required data");
      return;
    }

    createPerformanceForStaffReview.mutate({
      reviewer_id: session.id,
      staff_id: staff.staff.id,
      team_id:  staff?.team?.id ?? "",
      template_id: template.id,
      organization_id: orgId,
      created_by_id: session.id,
      feedback: data.feedback
    });
  };

  const existingReview = trpc.findPerformanceReviewByStaffId.useQuery({
    staff_id: staff?.staff?.id || ""
  }, {
    enabled: !!staff?.staff?.id
  });

  if (existingReview.data) {
    return (
      <UpdatePerformanceReview 
        reviewId={existingReview.data.id}
        initialData={existingReview.data as unknown as updatePerformanceReviewType}
      />
    );
  }

  if (!staff?.staff || !team || !template) {
    return <Button disabled className="bg-gray-400">Review Unavailable</Button>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          Write Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-emerald-800">Write Performance Review</DialogTitle>
          <DialogDescription>
            Write a performance review for {staff.staff_name || "Staff Member"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {templateMetrics?.filter(metric => metric?.column_name).map((metric, index) => (
              <div className="grid gap-4 py-4" key={metric.column_name || index}>
                <div className="space-y-2">
                  <Label htmlFor={metric.column_name}>{metric.column_name}</Label>
                  {metric.column_type === "text" && (
                    <Input
                      {...form.register(`feedback.${index}.column_value`)}
                      id={metric.column_name}
                      type="text"
                      placeholder={`Enter ${metric.column_name || "value"}`}
                      required
                    />
                  )}
                  {metric.column_type === "number" && (
                    <Input
                      {...form.register(`feedback.${index}.column_value`)}
                      id={metric.column_name}
                      type="number"
                      placeholder={`Enter ${metric.column_name || "number"}`}
                      required
                    />
                  )}
                  {metric.column_type === "date" && (
                    <Input
                      {...form.register(`feedback.${index}.column_value`)}
                      id={metric.column_name}
                      type="date"
                      required
                    />
                  )}
                  {metric.column_type === "link" && (
                    <Input
                      {...form.register(`feedback.${index}.column_value`)}
                      id={metric.column_name}
                      type="url"
                      placeholder="Enter URL"
                      required
                    />
                  )}
                  <input 
                    type="hidden" 
                    {...form.register(`feedback.${index}.column_name`)}
                    value={metric.column_name || ""}
                  />
                  <input 
                    type="hidden"
                    {...form.register(`feedback.${index}.column_type`)}
                    value={metric.column_type || "text"}
                  />
                  {metric.column_description && (
                    <div className="mt-2 flex items-center gap-2" aria-label="Metric Description">
                      <svg 
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm text-gray-500 italic" role="tooltip">
                        <span className="sr-only">Description: </span>
                        {metric.column_description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <DialogFooter>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={createPerformanceForStaffReview.isPending}
              >
                {createPerformanceForStaffReview.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const columns: ColumnDef<StaffPerformanceColumnType>[] = [
    {
      id: "staff_name",
      header: () => <div className="p-3 text-emerald-800 font-semibold border-b-2 border-emerald-100">Name</div>,
      accessorKey: "staff_name",
      cell: ({ row }) => (
        <span className="text-gray-700 font-medium">{row.getValue("staff_name") || "N/A"}</span>
      ),
    },
    {
        id: "team_name",
        header: () => <div className="p-3 text-emerald-800 font-semibold border-b-2 border-emerald-100">Team</div>,
        accessorKey: "team_name",
        cell: ({ row }) => (
          <span className="text-gray-700 font-medium">{row.getValue("team_name") || "N/A"}</span>
        ),
    },
    {
      id: "designation_name",
      header: () => <div className="p-3 text-emerald-800 font-semibold border-b-2 border-emerald-100">Designation</div>,
      accessorKey: "designation_name",
      cell: ({ row }) => {
        const designation: string = row.getValue("designation_name");
        return (
          <span className={`capitalize font-medium px-2 py-1 rounded-full ${
            designation !== "paid" 
              ? "bg-emerald-100 text-emerald-700" 
              : "bg-amber-100 text-amber-700"
          }`}>
            {designation || "N/A"}
          </span>
        );
      },
    },
    {
      id: "view",
      header: () => <div className="p-3 text-emerald-800 font-semibold">View</div>,
      cell: ({ row }) => {
        if (!row.original.staff?.id) return <Button disabled>View</Button>;
        return (
          <Link href={`/performance-review/view-staff-review/${row.original.staff.id}`}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">View</Button>
          </Link>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="p-3 text-emerald-800 font-semibold">Action</div>,
      cell: ({ row }) => <CreatePerformanceReviewModal staff={row.original} team={row.original.team} template={row.original.template} />,
    },
    {
      id: "delete",
      header: () => <div className="p-3 text-emerald-800 font-semibold">Delete</div>,
      cell: ({ row }) => {
        if (!row.original.staff?.id) return <Button disabled>Delete</Button>;
        return <DeletePerformanceReviewModal reviewId={row.original.staff.id} />;
      },
    }
];