import { useState, ChangeEvent, Dispatch, SetStateAction } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select as SecondSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStaffSchema } from "@/app/server/dtos";
import { z } from "zod";
import Select from "react-select";
import { trpc } from "@/app/_providers/trpc-provider";
import StaffRoleForm from "../../staff-role/_components/staffRoleForm";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
// import AddExperienceForm from "./add-experience-form";

interface StaffFormProps {
    setOpenStaffForm:  Dispatch<SetStateAction<boolean>>;
}

type TFormData = z.infer<typeof createStaffSchema>;


export default function StaffForm({setOpenStaffForm}: StaffFormProps) {
  const form = useForm<TFormData>({ resolver: zodResolver(createStaffSchema) });
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const [showStaffRoleForm, setShowStaffRoleForm] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string>("");
  const [documents, setDocuments] = useState<File[]>([]);
  const utils = trpc.useUtils();
  // const { toast } = useToast();

  const possibleSkills = [
    "Project Management",
    "Data Analysis",
    "Graphic Design",
    "Customer Service",
    "Microsoft Office",
    "Content Writing",
    "Time Management",
    "Digital Marketing",
    "Git"
  ];

  const {data: staffRoleData} = trpc.getAllStaffRole.useQuery();

  // const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.files && event.target.files[0]) {
  //     setPhoto(event.target.files[0]);
  //   }
  // };

  const handleDocumentUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setDocuments(prevDocs => [...prevDocs, ...Array.from(event.target.files!)]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prevDocs => prevDocs.filter((_, i) => i !== index));
  };

  const handleSkillClick = (skill: string) => {
    const currentSkills = selectedSkills.split(",").filter(s => s !== "");
    const isSelected = currentSkills.includes(skill);
    
    if (isSelected) {
      // Remove skill if already selected
      const updatedSkills = currentSkills.filter(s => s !== skill);
      setSelectedSkills(updatedSkills.join(","));
    } else {
      // Add skill if not selected
      const updatedSkills = [...currentSkills, skill];
      setSelectedSkills(updatedSkills.join(","));
    }
    console.log("selected skills: ", selectedSkills);
  };
  const isSkillSelected = (skill: string) => {
    return selectedSkills.split(",").includes(skill);
  };

  const addStaff = trpc.createStaff.useMutation({
    onSuccess: async () => {
      toast.success("New staff created successfully");

      utils.getAllStaffs.invalidate().then(() => {
        setOpenStaffForm(false);
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error creating staff");

    },
  });

  const onSubmit = (values: TFormData) => {

    if(confirmPassword !== form.getValues("password")){
        toast.error("Password mismatch");
        return;
    }

    addStaff.mutate({...values, skill: selectedSkills });

  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="container mx-auto p-4 z-40">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Create Employee</h1>
            <div className="space-x-2">
            <Button onClick={() => setOpenStaffForm(false)} variant="outline">Cancel</Button>
            <Button disabled={form.formState.isSubmitting} type="submit">{form.formState.isSubmitting ? "Loading..." : "Save"}</Button>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
            <CardHeader>
                <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="py-1">
                    <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel> First Name</FormLabel>
                            <FormControl>
                            <Input placeholder="Please enter first name"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <div className="py-1">
                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel> Last Name</FormLabel>
                            <FormControl>
                            <Input
                            placeholder="Please enter last name"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <div className="py-1">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel> Email</FormLabel>
                            <FormControl>
                            <Input
                                placeholder="Please enter email"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <div className="py-1">
                    <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone No</FormLabel>
                            <FormControl>
                            <Input
                            placeholder="Please enter phone no"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <div className="py-1">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel> Password</FormLabel>
                            <FormControl>
                            <Input
                                placeholder="Please enter password"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <div className="">
                    <Label htmlFor="fullName">Confirm Password</Label>
                    <Input id="fullName" onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Employee Name" />
                </div>
                {/* <div className="ml-4 flex items-end">
                    <div className="space-y-2">
                    <Label htmlFor="photo">Upload Photo</Label>
                    <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                    />
                    <div 
                        className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer"
                        onClick={() => document.getElementById("photo")?.click()}
                    >
                        {photo ? (
                        <Image
                            src={URL.createObjectURL(photo)}
                            alt="Employee"
                            className="w-full h-full object-cover rounded-lg"
                        />
                        ) : (
                        <div className="text-center">
                            <Upload className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm">Upload Photo</span>
                        </div>
                        )}
                    </div>
                    </div>
                </div> */}
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                        <FormItem className="mt-2">
                        <FormLabel>Select Position</FormLabel>
                        <SecondSelect onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl className="mt-1">
                            <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Developer">Developer</SelectItem>
                            <SelectItem value="Designer">Designer</SelectItem>
                            </SelectContent>
                        </SecondSelect>
                        <FormMessage />
                        </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="marital_status"
                    render={({ field }) => (
                        <FormItem className="mt-2">
                        <FormLabel>Marital Status</FormLabel>
                        <SecondSelect onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl className="mt-1">
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Divorced">Divorced</SelectItem>
                            </SelectContent>
                        </SecondSelect>
                        <FormMessage />
                        </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                        <FormItem className="mt-2">
                        <FormLabel>Select Department</FormLabel>
                        <SecondSelect onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl className="mt-1">
                            <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="IT">IT</SelectItem>
                              <SelectItem value="HR">HR</SelectItem>
                              <SelectItem value="Finance">Finance</SelectItem>
                            </SelectContent>
                        </SecondSelect>
                        <FormMessage />
                        </FormItem>
                    )}
                  />
                </div>
                <div>
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gblue">Date of Birth</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter date of birth"  type="date" onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div>
                <FormField
                  control={form.control}
                  name="joined_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gblue">Date of Employment</FormLabel>
                      <FormControl>
                        <Input type="date" onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="py-1">

                  <FormField
                    control={form.control}
                    name={"staff_role_id"}
                    render={() => (
                      <FormItem>
                        <FormLabel> Staff Role</FormLabel>
                        <FormControl>
                          <Select
                            {...form.register("staff_role_id")}
                            placeholder="Select role"
                            options={staffRoleData?.map((role) => ({
                              label: role.description,
                              value: role.id,
                            }))}
                            onChange={(selectedOptions) => {
                              form.setValue("staff_role_id", selectedOptions?.value as string);
                            }}

                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <button onClick={()=> {setShowStaffRoleForm(true);}} type="button" className="text-blue-500">Click here to add new package</button>
                </div>
                {showStaffRoleForm &&

              <StaffRoleForm handlePackageFormShow={()=>setShowStaffRoleForm(false)} />
                }

            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Bank Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="py-1">
                    <FormField
                        control={form.control}
                        name="bank_account_no"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bank Account No.</FormLabel>
                            <FormControl>
                            <Input
                            placeholder="Please enter acc no"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            
                <div className="py-1">
                    <FormField
                        control={form.control}
                        name="bank_name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                            <Input
                            placeholder="Please enter bank name"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            

                <hr className="my-10" />

                <div>
                    <h2 className="font-semibold">Personal Information</h2>

                    <div className="py-1">
                    <FormField
                        control={form.control}
                        name="nin"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>NIN</FormLabel>
                            <FormControl>
                            <Input
                            placeholder="Please enter NIN"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                    <div className="py-1">
                    <FormField
                        control={form.control}
                        name="tin"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>TIN</FormLabel>
                            <FormControl>
                            <Input
                            placeholder="Please enter TIN"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                    <div className="py-1">
                    <FormField
                        control={form.control}
                        name="passport_number"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Passport No</FormLabel>
                            <FormControl>
                            <Input
                            placeholder="Please enter passport no"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>

                <div>
                <FormField
                  control={form.control}
                  name="passport_expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gblue">Passport Expiry Date</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter date of birth"  type="date" onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                </div>

                <hr className="my-10" />

                <div>
                    <h2 className="font-semibold">Salary Information</h2>

                    <div>
                  <FormField
                    control={form.control}
                    name="salary_basis"
                    render={({ field }) => (
                        <FormItem className="mt-2">
                        <FormLabel>Select salary basis</FormLabel>
                        <SecondSelect onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl className="mt-1">
                            <SelectTrigger>
                                <SelectValue placeholder="Select basis" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Daily">Daily</SelectItem>
                              <SelectItem value="Weekly">Weekly</SelectItem>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                            </SelectContent>
                        </SecondSelect>
                        <FormMessage />
                        </FormItem>
                    )}
                  />
                </div>
                    <div className="py-1">
                    <FormField
                        control={form.control}
                        name="amount_per_month"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount Per Month</FormLabel>
                            <FormControl>
                            <Input
                            placeholder="Please enter amount"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                    <div className="py-1">
                    <FormField
                        control={form.control}
                        name="effective_date"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Effective Date</FormLabel>
                            <FormControl>
                            <Input placeholder="Enter date"  type="date" onChange={field.onChange}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="payment_type"
                    render={({ field }) => (
                        <FormItem className="mt-2">
                        <FormLabel>Select salary basis</FormLabel>
                        <SecondSelect onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl className="mt-1">
                            <SelectTrigger>
                                <SelectValue placeholder="Select Payment type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Transfer">Transfer</SelectItem>
                              <SelectItem value="Cash">Cash</SelectItem>
                              <SelectItem value="Monthly">Other</SelectItem>
                            </SelectContent>
                        </SecondSelect>
                        <FormMessage />
                        </FormItem>
                    )}
                  />
                </div>
                </div>
                
            </CardContent>
            </Card>
            {/* <Card>
            <CardHeader>
                <CardTitle>Personal Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                <Label htmlFor="phoneNumber">Phone No</Label>
                <Input id="phoneNumber" placeholder="000 - 000 - 0000" />
                </div>
                <div>
                <Label htmlFor="passportNo">NIN</Label>
                <Input id="passportNo" placeholder="Passport No." />
                </div>
                <div>
                <Label htmlFor="passportNo">TIN</Label>
                <Input id="passportNo" placeholder="Passport No." />
                </div>
                <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateOfBirth && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={setDateOfBirth}
                        // initialFocus
                    />
                    </PopoverContent>
                </Popover>
                </div>
                
            </CardContent>
            </Card> */}
            <Card>
            <CardHeader>
                <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                
                <div>
                    <Label htmlFor="documents">Add Employee Documents</Label>
                    <Input
                    id="documents"
                    type="file"
                    onChange={handleDocumentUpload}
                    multiple
                    className="cursor-pointer"
                    />
                </div>
                {documents.length > 0 && (
                    <div className="space-y-2">
                    <Label>Uploaded Documents:</Label>
                    <ul className="space-y-2">
                        {documents.map((doc, index) => (
                        <li key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                            <span className="truncate">{doc.name}</span>
                            <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDocument(index)}
                            >
                            <X className="h-4 w-4" />
                            </Button>
                        </li>
                        ))}
                    </ul>
                    </div>
                )}

                <div className="w-full space-y-2">
                  <label className="text-sm font-semibold">Select Skills</label>
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-lg">
                    {possibleSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant={isSkillSelected(skill) ? "default" : "secondary"}
                        className="cursor-pointer hover:bg-slate-200"
                        onClick={() => handleSkillClick(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <input 
                    type="hidden" 
                    name="skills" 
                    value={selectedSkills} 
                  />
                </div>
                </div>
            </CardContent>
            </Card>
            {/* <Card>
            <CardHeader>
                <CardTitle>Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                    <div>
                    <h3 className="font-semibold">Senior Project Manager</h3>
                    <p className="text-sm text-muted-foreground">Aug, 2021 - Present</p>
                    </div>
                    <div className="bg-primary-foreground text-primary px-2 py-1 rounded text-xs">TECH SOLUTIONS PRO</div>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Successfully led complex software projects, managing scope.</li>
                    <li>Established strong relationships with clients, understanding their needs.</li>
                </ul>
                </div>

                  <Sheet>
                    <SheetTrigger className="w-full">  <span className="cursor-pointer block text-sm mx-auto p-2 rounded-xl w-full bg-black text-white hover:font-semibold">Add Experience </span></SheetTrigger>
                    <SheetContent className="w-2/3 sm:w-full overflow-scroll">
                      <SheetHeader className="flex text-start mb-5">
                        <SheetTitle className="text-2xl">Experience</SheetTitle>
                      </SheetHeader>
                      <AddExperienceForm />
                    </SheetContent>
                  </Sheet>
            </CardContent>
            </Card> */}
        </div>
        </div>
     </form>
    </Form>
  );
}