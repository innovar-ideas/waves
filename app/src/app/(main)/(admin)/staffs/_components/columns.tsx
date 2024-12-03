import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Designation, StaffProfile, Team, TeamDesignation, User, WorkHistory } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import EmployeeDetails from "./employee-details";
import EditStaffForm from "./editStaffForm";


export const columns: ColumnDef<StaffProfile & { user: User; work_history: WorkHistory[]; team_designation: TeamDesignation & { designation: Designation; team: Team; } | null }>[] = [
  {
    accessorKey: "serial_number",
    header: "S/N",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "user.first_name",
    header: "Name",
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <span>{staff.user.first_name + " " + staff.user.last_name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email Address",
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <div className="flex items-center gap-2">
          <span>{staff.user.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <div className="flex items-center gap-2">
          <span>{staff.user.phone_number}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "position",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Position
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const position = row.original.team_designation?.designation?.name;
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
            ${"bg-gray-100 text-gray-800"}`}>
          {position}
        </span>
      );
    },
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: string = row.getValue("status");
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
            ${status === "Active" ? "bg-green-100 text-green-800" :
            status === "Remote" ? "bg-blue-100 text-blue-800" :
              status === "OnLeave" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "joined_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Joining Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <div className="flex items-center gap-2">
          <span>{format(staff.joined_at!, "MMMM d,yyyy")}</span>
        </div>
      );
    },
  },
  {
    header: "Action",
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="flex flex-col gap-2">
              <DropdownMenuItem asChild>
                <Drawer>
                  <DrawerTrigger> View Profile</DrawerTrigger>
                  <DrawerContent className="h-full">
                    <div className="mx-auto w-full overflow-scroll">
                      <div className="flex items-center justify-between flex-row-reverse px-10">
                        <DrawerClose asChild>
                          <Button variant="outline">Close</Button>
                        </DrawerClose>
                        <DrawerHeader>
                          <DrawerTitle>User Details</DrawerTitle>
                          <DrawerDescription>
                            Viewing information
                          </DrawerDescription>
                        </DrawerHeader>
                      </div>

                      <div className="w-full">
                        <EmployeeDetails staffProfile={staff} />
                      </div>

                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="outline">Close</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </div>
                  </DrawerContent>
                </Drawer>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Drawer>
                  <DrawerTrigger> Edit Profiles</DrawerTrigger>
                  <DrawerContent className="h-full">
                    <div className="mx-auto w-full overflow-scroll">
                      <div className="flex items-center justify-between flex-row-reverse px-10">
                        <DrawerClose asChild>
                          <Button variant="outline">Close</Button>
                        </DrawerClose>
                        <DrawerHeader>
                          <DrawerTitle>Edit Staff</DrawerTitle>
                          <DrawerDescription>
                            Edit information
                          </DrawerDescription>
                        </DrawerHeader>
                      </div>

                      <div className="w-full">
                        <EditStaffForm staffProfile={staff} />
                      </div>

                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="outline" className="w-[70%] mx-auto">Close</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </div>
                  </DrawerContent>
                </Drawer>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


        </div>
      );
    }
  }
];