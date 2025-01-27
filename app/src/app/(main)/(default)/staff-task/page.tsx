"use client";

import { useState, useEffect } from "react";
import { StaffTaskColumnTable } from "@/app/server/types";
import { columns } from "./_components/columns";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { ClipboardList, Clock, CheckCircle, ListTodo, RotateCw } from "lucide-react";
import { trpc } from "@/app/_providers/trpc-provider";

export default function StaffTaskPage() {
  const [staffTasks, setStaffTasks] = useState<StaffTaskColumnTable[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();
  const { data: staffTasksData } = trpc.getStaffTasksByUser.useQuery({
    user_id: session?.user?.id as string
  });

  useEffect(() => {
    if (staffTasksData) {
      setStaffTasks(staffTasksData);
      setLoading(false);
    }
  }, [staffTasksData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const allTasks = staffTasks;
  const newTasks = staffTasks.filter(task => {
    if (!task.created_at) return false;
    const createdDate = new Date(task.created_at);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return createdDate >= oneDayAgo;
  });
  const pendingTasks = staffTasks.filter(task => task.status === "pending");
  const completedTasks = staffTasks.filter(task => task.is_completed);
  const repeatedTasks = staffTasks.filter(task => task.task_repeat_time_table?.type);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="bg-green-50 border-b border-green-100">
          <CardTitle className="text-2xl text-gray-900">My Tasks</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-green-50 rounded-lg p-1">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-white data-[state=active]:text-green-700 flex items-center gap-2"
              >
                <ListTodo className="h-4 w-4" />
                All Tasks ({allTasks.length})
              </TabsTrigger>
              <TabsTrigger 
                value="new" 
                className="data-[state=active]:bg-white data-[state=active]:text-green-700 flex items-center gap-2"
              >
                <ClipboardList className="h-4 w-4" />
                New Tasks ({newTasks.length})
              </TabsTrigger>
              <TabsTrigger 
                value="pending"
                className="data-[state=active]:bg-white data-[state=active]:text-green-700 flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Pending Tasks ({pendingTasks.length})
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                className="data-[state=active]:bg-white data-[state=active]:text-green-700 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Completed Tasks ({completedTasks.length})
              </TabsTrigger>
              <TabsTrigger 
                value="repeated"
                className="data-[state=active]:bg-white data-[state=active]:text-green-700 flex items-center gap-2"
              >
                <RotateCw className="h-4 w-4" />
                Repeated Tasks ({repeatedTasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <DataTable columns={columns} data={allTasks} />
            </TabsContent>

            <TabsContent value="new" className="mt-6">
              <DataTable columns={columns} data={newTasks} />
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <DataTable columns={columns} data={pendingTasks} />
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <DataTable columns={columns} data={completedTasks} />
            </TabsContent>

            <TabsContent value="repeated" className="mt-6">
              <DataTable columns={columns} data={repeatedTasks} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
