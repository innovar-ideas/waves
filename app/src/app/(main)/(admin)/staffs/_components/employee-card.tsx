import { MoreVertical } from "lucide-react";
// import Image from "next/image";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StaffProfile, User } from "@prisma/client";
import { format } from "date-fns";

interface EmployeeCardProps {
  staffProfile: StaffProfile & {user: User}
}

export default function EmployeeCard({staffProfile}: EmployeeCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/10 text-green-500";
      case "Remote":
        return "bg-violet-500/10 text-violet-500";
      case "OnLeave":
        return "bg-blue-500/10 text-blue-500";
      case "Terminated":
        return "bg-orange-500/10 text-orange-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-4">
          {/* <Image
            src={staffProfile.profile_picture_url ?? "/book.jpg"}
            alt={`${staffProfile?.user?.first_name}'s avatar`}
            className="rounded-full"
            width={48}
            height={48}
          /> */}
            <div className="h-10 w-10 rounded-full bg-muted" />

          <div>
            <h3 className="font-medium leading-none">{staffProfile.user?.first_name}</h3>
            <p className="text-sm text-muted-foreground pt-1">{staffProfile.position}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(staffProfile.status as string)}`}>
            {staffProfile.status as string}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View profile</DropdownMenuItem>
              <DropdownMenuItem>Edit details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2 grid-cols-2">
          <div className="text-xs">
            <span className="text-muted-foreground">DEPARTMENT</span>
            <p>{staffProfile.department}</p>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">DATE OF JOINING</span>
            <p>{format(staffProfile.joined_at!, "MMMM d,yyyy")}</p>
          </div>
        </div>
        <div className="grid gap-2 bg-gray-100 rounded-xl p-2">
          <div className="flex items-center gap-2 text-sm">
            <svg
              className=" h-4 w-4 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            {staffProfile.user?.email}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <svg
              className=" h-4 w-4 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {staffProfile.user?.phone_number}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          className="flex-1 bg-blue-200 rounded-2xl"
          variant="outline"
        //   onClick={onEdit}
        >
          Edit
        </Button>
        <Button
          className="flex-1 bg-blue-500 rounded-2xl"
        //   onClick={onView}
        >
          View
        </Button>
      </CardFooter>
    </Card>
  );
}