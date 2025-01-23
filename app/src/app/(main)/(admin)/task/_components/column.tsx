import { ColumnDef } from "@tanstack/react-table";
import { TaskTable } from "@/app/server/types";

export const columns: ColumnDef<TaskTable>[] = [


    {
        id: "title",
        header: () => <div className="text-emerald-800 font-semibold">Title</div>,
        accessorKey: "task.title",
        cell: ({ row }) => {
            return <span className="text-gray-700 font-medium">{row.original.task.title || ""}</span>;
        },
    },
    {
        id: "description",
        header: () => <div className="text-emerald-800 font-semibold">Description</div>,
        accessorKey: "task.description",
        cell: ({ row }) => {
            return <span className="text-gray-700 font-medium">{row.original.task.description || ""}</span>;
        },
    },
    {
        id: "created_by",
        header: () => <div className="text-emerald-800 font-semibold">Created By</div>,
        accessorKey: "created_by_user.first_name",
        cell: ({ row }) => {
            const firstName = row.original.created_by_user?.first_name || "";
            const lastName = row.original.created_by_user?.last_name || "";
            return <span className="text-gray-700 font-medium">{firstName} {lastName}</span>;
        },
    },
    {
        id: "created_at",
        header: () => <div className="text-emerald-800 font-semibold">Created At</div>,
        accessorKey: "task.created_at",
        cell: ({ row }) => {
            const date = new Date(row.original.task.created_at || "");
            return <span className="text-gray-700 font-medium">
                {date.toLocaleDateString()}
            </span>;
        },
    },
    {
        id: "number_of_staff",
        header: () => <div className="text-emerald-800 font-semibold">Number of Staff</div>,
        accessorKey: "staff_tasks.length",
        cell: ({ row }) => {
            return <span className="text-gray-700 font-medium">{row.original.staff_tasks?.length || 0}</span>;
        },
    },
    {
        id: "number_of_completed_staff",
        header: () => <div className="text-emerald-800 font-semibold">Number of Completed Staff</div>,
        accessorKey: "staff_tasks.filter(task => task.is_completed).length",
        cell: ({ row }) => {
            return <span className="text-gray-700 font-medium">{row.original.staff_tasks?.filter(task => task.is_completed).length || 0}</span>;
        },
    }

];