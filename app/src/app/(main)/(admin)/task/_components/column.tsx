import { ColumnDef } from "@tanstack/react-table";
import { TaskTable } from "@/app/server/types";
import Link from "next/link";
import { useState } from "react";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";




interface ColumnProps {
    task: TaskTable
}
export default function Column({ task }: ColumnProps) {
    const [showModal, setShowModal] = useState(false);
    const utils = trpc.useUtils();
    const deleteTask = trpc.deleteTask.useMutation({
        onSuccess: () => {
            toast.success("Task deleted successfully");
            utils.getAllTasksByOrganization.invalidate();
        },
        onError: () => {
            toast.error("Failed to delete task");
        }

    });

    const handleDelete = () => {
        deleteTask.mutate({ id: task.id });
        setShowModal(false);
    };

    return (
        <div>
            <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition"
            >
                Delete Task
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
                        <p className="mb-6">Are you sure you want to delete &quot;{task.task.title}&quot;?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowModal(false)}

                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



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
    },
    {
        header: "Action",
        cell: ({ row }) => <Column task={row.original} />
      }
];