import { ColumnDef } from "@tanstack/react-table";
import { StaffTaskColumnTable, TaskInstructions } from "@/app/server/types";
import Link from "next/link";

export const columns: ColumnDef<StaffTaskColumnTable>[] = [
    {
        id: "task",
        header: () => <div className="text-emerald-800 font-semibold">Task</div>,
        accessorKey: "task.title",
        cell: ({ row }) => {
            const title = row.original.task?.title || "";
            const displayTitle = title.length > 30 ? `${title.substring(0, 30)}...` : title;
            return (
                <Link href={`/staff-task/view-staff-task-details/${row.original.staff_task?.id}`} className="hover:text-emerald-600">
                    <span className="text-gray-700 font-medium" title={title}>{displayTitle}</span>
                </Link>
            );
        },
    },
    {
        id: "status",
        header: () => <div className="text-emerald-800 font-semibold">Status</div>,
        accessorKey: "status",
        cell: ({ row }) => {
            const status = row.original.status || "";
            return (
                <Link href={`/staff-task/view-staff-task-details/${row.original.staff_task?.id}`} className="hover:text-emerald-600">
                    <span className="text-gray-700 font-medium" title={status}>{status}</span>
                </Link>
            );
        },
    },
    {
        id: "user",
        header: () => <div className="text-emerald-800 font-semibold">Assigned To</div>,
        accessorKey: "user.first_name",
        cell: ({ row }) => {
            const firstName = row.original.user?.first_name || "";
            const lastName = row.original.user?.last_name || "";
            const fullName = `${firstName} ${lastName}`;
            const displayName = fullName.length > 20 ? `${fullName.substring(0, 20)}...` : fullName;
            return (
                <Link href={`/staff-task/view-staff-task-details/${row.original.staff_task?.id}`} className="hover:text-emerald-600">
                    <span className="text-gray-700 font-medium" title={fullName}>{displayName}</span>
                </Link>
            );
        },
    },
    {
        id: "created_at",
        header: () => <div className="text-emerald-800 font-semibold">Created At</div>,
        accessorKey: "created_at",
        cell: ({ row }) => {
            const date = new Date(row.original.created_at || "");
            return (
                <Link href={`/staff-task/view-staff-task-details/${row.original.staff_task?.id}`} className="hover:text-emerald-600">
                    <span className="text-gray-700 font-medium">
                        {date.toLocaleDateString()}
                    </span>
                </Link>
            );
        },
    },
    {
        id: "task_repeat_time_table",
        header: () => <div className="text-emerald-800 font-semibold">Repeat</div>,
        accessorKey: "task_repeat_time_table",
        cell: ({ row }) => {
            return (
                <Link href={`/staff-task/view-staff-task-details/${row.original.staff_task?.id}`} className="hover:text-emerald-600">
                    <span className="text-gray-700 font-medium">{row.original.task_repeat_time_table?.type || "None"}</span>
                </Link>
            );
        },
    },
    {
        id: "response_type",
        header: () => <div className="text-emerald-800 font-semibold">Response Type</div>,
        accessorKey: "instructions.instruction_type",
        cell: ({ row }) => {
            const instructions = row.original.instructions as TaskInstructions;
            return (
                <Link href={`/staff-task/view-staff-task-details/${row.original.staff_task?.id}`} className="hover:text-emerald-600">
                    <span className="text-gray-700 font-medium">{instructions?.instruction_type || "None"}</span>
                </Link>
            );
        },
    }
];