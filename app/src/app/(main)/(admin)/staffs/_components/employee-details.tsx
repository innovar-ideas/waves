import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffProfile, StaffRole, User, WorkHistory } from "@prisma/client";
import { format } from "date-fns";
// import { Separator } from "@/components/ui/separator";
import { Mail, Calendar, PencilLine } from "lucide-react";
// import Image from "next/image";

interface EmployeeCardProps {
    staffProfile: StaffProfile & {user: User; work_history: WorkHistory[]; staff_role: StaffRole}
  }

export default function EmployeeDetails({staffProfile}: EmployeeCardProps) {

    const skills = (staffProfile?.skill as string).split(",") || [];



  return (
    <div className="container mx-auto p-6 bg-background">
      <div className="grid gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* <Image
              alt={staffProfile.id}
              className="rounded-full h-16 w-16 object-cover"
              src={staffProfile.profile_picture_url ?? "/book.jpg"}
            /> */}
            <div>
              <h1 className="text-2xl font-bold">{staffProfile?.user?.first_name + " " + staffProfile?.user?.last_name}</h1>
              <p className="text-sm text-muted-foreground">{staffProfile?.position}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-primary border-primary">
            {staffProfile?.department}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Personal Info */}
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personal Info</CardTitle>
              <Button size="icon" variant="ghost">
                <PencilLine className="h-4 w-4" />
                <span className="sr-only">Edit personal info</span>
              </Button>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">PASSPORT NO.</dt>
                  <dd className="text-sm">{staffProfile?.passport_number}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">PASSPORT EXP. DATE</dt>
                  <dd className="text-sm">{ format(staffProfile.passport_expiry_date!, "MMM d,yyyy")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">PHONE NUMBER</dt>
                  <dd className="text-sm">{staffProfile?.user.phone_number}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">BIRTHDAY</dt>
                  <dd className="text-sm">{format(staffProfile.date_of_birth!, "MMM d,yyyy")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">MARITAL STATUS</dt>
                  <dd className="text-sm">{staffProfile.marital_status}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="md:col-span-2 lg:col-span-1 lg:row-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Experience</CardTitle>
              <Button size="icon" variant="ghost">
                <PencilLine className="h-4 w-4" />
                <span className="sr-only">Edit experience</span>
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              {staffProfile.work_history.map((exp, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold">{exp.job_title}</h3>
                      <p className="text-sm text-muted-foreground">{exp.company_name}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs flex flex-col gap-1">
                      <p>From</p>
                      {format (exp.start_date!, "MMM d,yyyy")}
                    </Badge>
                    <Badge variant="secondary" className="text-xs flex flex-col gap-1">
                      <p>To</p>
                      {format (exp.end_date!, "MMM d,yyyy")}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Mail className="mr-1 h-3 w-3" />
                    {exp.company_industry}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{exp.responsibilities}</p>
                  {/* {index < employee.experience.length - 1 && <Separator className="my-2" />} */}
                </div>
              ))}
            </CardContent>
          </Card>

                    {/* Bank Information */}
                    <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bank Information</CardTitle>
              <Button size="icon" variant="ghost">
                <PencilLine className="h-4 w-4" />
                <span className="sr-only">Edit bank info</span>
              </Button>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">BANK ACCOUNT NO.</dt>
                  <dd className="text-sm">{staffProfile.bank_account_no}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">Bank Name</dt>
                  <dd className="text-sm">{staffProfile.bank_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">NIN</dt>
                  <dd className="text-sm">{staffProfile.nin}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">TIN</dt>
                  <dd className="text-sm">{staffProfile.tin}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Salary Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salary Information</CardTitle>
              <Button size="icon" variant="ghost">
                <PencilLine className="h-4 w-4" />
                <span className="sr-only">Edit salary info</span>
              </Button>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">SALARY BASIS</dt>
                  <dd className="text-sm">{staffProfile.salary_basis}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">SALARY AMOUNT PER MONTH</dt>
                  <dd className="text-sm">{staffProfile.amount_per_month}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">EFFECTIVE DATE</dt>
                  <dd className="text-sm">{format (staffProfile.effective_date!, "MMM d,yyyy")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">PAYMENT TYPE</dt>
                  <dd className="text-sm">{staffProfile.payment_type}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Projects */}
          {/* <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {employee.projects.map((project, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="text-sm">{project.name}</span>
                    <Badge variant={project.status === "Completed" ? "success" : project.status === "In Progress" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card> */}

          {/* Skills */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Mail className="mr-2 h-4 w-4" />
          <span className="mr-4">{staffProfile.user.email}</span>
          <Calendar className="mr-2 h-4 w-4" />
          <span>Joined {format(staffProfile.joined_at!, "MMM d,yyyy")}</span>
        </div>
      </div>
    </div>
  );
}