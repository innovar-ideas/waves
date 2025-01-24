import { ColumnDef } from "@tanstack/react-table";
import { TaskTable } from "@/app/server/types";
import Link from "next/link";

export const columns: ColumnDef<TaskTable>[] = [
    {
        id: "title",
        header: () => <div className="text-emerald-800 font-semibold">Title</div>,
        accessorKey: "task.title",
        cell: ({ row }) => {
            const title = row.original.task.title || "";
            const displayTitle = title.length > 30 ? `${title.substring(0, 30)}...` : title;
            return (
                <Link href={`/task/${row.original.id}`} className="hover:text-emerald-600">
                    <span className="text-gray-700 font-medium" title={title}>{displayTitle}</span>
                </Link>
            );
        },
    },
    {
        id: "description",
        header: () => <div className="text-emerald-800 font-semibold">Description</div>,
        accessorKey: "task.description",
        cell: ({ row }) => {
            const description = row.original.task.description || "";
            const displayDescription = description.length > 50 ? `${description.substring(0, 50)}...` : description;
            return (
                <Link href={`/task/${row.original.id}`} className="hover:text-emerald-600">
                    <span className="text-gray-700 font-medium" title={description}>{displayDescription}</span>
                </Link>
            );
        },
    },
    {
        id: "created_by",
        header: () => <div className="text-emerald-800 font-semibold">Created By</div>,
        accessorKey: "created_by_user.first_name",
        cell: ({ row }) => {
            const firstName = row.original.created_by_user?.first_name || "";
            const lastName = row.original.created_by_user?.last_name || "";
            const fullName = `${firstName} ${lastName}`;
            const displayName = fullName.length > 20 ? `${fullName.substring(0, 20)}...` : fullName;
            return (
                <Link href={`/task/${row.original.id}`} className="hover:text-emerald-600">
                    <span className="text-gray-700 font-medium" title={fullName}>{displayName}</span>
                </Link>
            );
        },
    },
    {
        id: "created_at",
        header: () => <div className="text-emerald-800 font-semibold">Created At</div>,
        accessorKey: "task.created_at",
        cell: ({ row }) => {
            const date = new Date(row.original.task.created_at || "");
            return (
                <Link href={`/task/${row.original.id}`} className="hover:text-emerald-600">
                    <span className="text-gray-700 font-medium">
                        {date.toLocaleDateString()}
                    </span>
                </Link>
            );
        },
    },
    {
        id: "number_of_staff",
        header: () => <div className="text-emerald-800 font-semibold">Staff Count</div>,
        accessorKey: "staff_tasks.length",
        cell: ({ row }) => {
            return (
                <Link href={`/task/${row.original.id}`} className="hover:text-emerald-600">
                    <span className="text-gray-700 font-medium">{row.original.staff_tasks?.length || 0}</span>
                </Link>
            );
        },
    },
    {
        id: "number_of_completed_staff",
        header: () => <div className="text-emerald-800 font-semibold">Completed</div>,
        accessorKey: "staff_tasks.filter(task => task.is_completed).length",
        cell: ({ row }) => {
            return (
                <Link href={`/task/${row.original.id}`} className="hover:text-emerald-600">
                    <span className="text-gray-700 font-medium">{row.original.staff_tasks?.filter(task => task.is_completed).length || 0}</span>
                </Link>
            );
        },
    }
];