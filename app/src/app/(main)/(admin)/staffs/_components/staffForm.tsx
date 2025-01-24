import { useState, Dispatch, SetStateAction, useEffect, useCallback } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select as SecondSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStaffSchema } from "@/app/server/dtos";
import { z } from "zod";
import Select from "react-select";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import CreatableSelect from "react-select/creatable";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import debounce from "lodash/debounce";
import { DocumentPreference } from "@/app/server/module/preference";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { PutBlobResult } from "@vercel/blob";
import { DocumentMetadata, StaffDocumentState } from "@/app/server/types";

interface StaffFormProps {
  setOpenStaffForm: Dispatch<SetStateAction<boolean>>;
}

type TFormData = z.infer<typeof createStaffSchema>;

interface BankOption {
  value: string;
  label: string;
  __isNew__?: boolean;
}

export default function StaffForm({ setOpenStaffForm }: StaffFormProps) {
  const { organizationSlug } = useActiveOrganizationStore();
  const form = useForm<TFormData>({
    resolver: zodResolver(createStaffSchema), defaultValues: {
      organization_id: organizationSlug
    }
  });
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const [selectedSkills, setSelectedSkills] = useState<string>("");
  const [teamId, setTeamId] = useState<string | undefined>("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const utils = trpc.useUtils();
  const [documents, setDocuments] = useState<StaffDocumentState[]>([]);

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

  const { data: uniqueTeams } = trpc.getUniqueTeamsFromTeamDesignationsByOrganizationId.useQuery({
    id: organizationSlug,
  });
  const { data: designations, refetch: refetchDesignations } = trpc.getTeamDesignationsByTeamId.useQuery({
    id: teamId as string,
  });

    const { data: documentPreferenceByOrganizationId } = trpc.findDocumentPreferenceByOrganizationSlug.useQuery({
      id: organizationSlug,
    });
  
    const preferenceValue = documentPreferenceByOrganizationId?.value as DocumentPreference;

    useEffect(() => {
      if (preferenceValue?.documents) {
        const initialDocuments = preferenceValue.documents.map((doc) => ({
          documentType: doc.type,
          file: null,
          expiryDate: null,
          isUploading: false,
          fileUrl: null,
        }));
        setDocuments(initialDocuments);
      }
    }, [preferenceValue]);

  const { data: banks } = trpc.getAllBanksByOrganizationId.useQuery({
    id: organizationSlug as string,
  });

  if(!banks){
    console.error("Fetch bank failed");
  }

  useEffect(() => {
    refetchDesignations();
  },
  [teamId, refetchDesignations]);

  const bankOptions: BankOption[] = banks
  ? banks.map((bank) => ({
    label: bank.name,
    value: bank.id,
  }))
  : [];

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

  const debouncedSearch = useCallback(
    (term: string) => {
      debounce((searchTerm: string) => {
        setSupplierSearch(searchTerm);
      }, 300)(term);
    },
    [setSupplierSearch]
  );

  const handleBankChange = useCallback(
    (selectedOption: BankOption | null) => {
      if (selectedOption) {
        form.setValue("bank_name", selectedOption.label);

        if (selectedOption.__isNew__) {
          form.setValue("bank_id", undefined);
        } else {
          form.setValue("bank_id", selectedOption.value);
        }
      } else {
        form.setValue("bank_id", undefined);
      }
    },
    [form]
  );

  const handleFileChange = (documentType: string, file: File | null) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.documentType === documentType ? { ...doc, file, fileUrl: null } : doc)),
    );
  };

  const handleExpiryDateChange = (documentType: string, date: Date | null) => {
    setDocuments((prev) => prev.map((doc) => (doc.documentType === documentType ? { ...doc, expiryDate: date } : doc)));
  };

  const uploadFile = async (doc: StaffDocumentState): Promise<string | null> => {
    if (!doc.file) return null;

    try {
      setDocuments((prev) => prev.map((d) => (d.documentType === doc.documentType ? { ...d, isUploading: true } : d)));

      const response = await fetch(`/api/upload?filename=${doc.file.name}`, {
        method: "POST",
        body: doc.file,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const newBlob = (await response.json()) as PutBlobResult;

      setDocuments((prev) =>
        prev.map((d) => (d.documentType === doc.documentType ? { ...d, isUploading: false, fileUrl: newBlob.url } : d)),
      );

      return newBlob.url;
    } catch (error) {
      console.error(`Error uploading ${doc.documentType}:`, error);
      toast.error(`Failed to upload ${doc.documentType}`);
      return null;
    }
  };

  const onSubmit = async (values: TFormData) => {

    try {
      
    if (confirmPassword !== form.getValues("password")) {
      toast.error("Password mismatch");
      return;
    }
    console.log(supplierSearch);
      // Filter documents that have files
      const documentsToUpload = documents.filter((doc) => doc.file !== null);

      let uploadedUrls: (string | null)[] = [];

      if (documentsToUpload.length === 0) {
        // Upload all files first
        const uploadPromises = documentsToUpload.map((doc) => uploadFile(doc));
        uploadedUrls = await Promise.all(uploadPromises);

      }
      
      // Transform to the required documents_url format
      const documentMetadata: DocumentMetadata[] = documentsToUpload
        .map((doc, index) => {
          const url = uploadedUrls[index];
          if (!url) return null;

          return {
            document_name: doc.documentType,
            file: url,
            expiry_date: doc.expiryDate || null,
          };
        })
        .filter((doc) => doc !== null);

      if (documentMetadata.length === 0) {
        console.error("No files were successfully uploaded");
      }

    addStaff.mutate({ ...values, skill: selectedSkills, documents_url: documentMetadata });

    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to save documents");
    } finally {
      // setIsSubmitting(false)
    }

  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (e) => console.error("form: ", e))}>
        <div className="container mx-auto p-4 z-40">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-green-700">Create Employee</h1>
            <div className="space-x-2">
              <Button onClick={() => setOpenStaffForm(false)} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">Cancel</Button>
              <Button disabled={form.formState.isSubmitting} type="submit" className="bg-green-600 hover:bg-green-700 text-white">{form.formState.isSubmitting ? "Loading..." : "Save"}</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-green-100">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-700">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="py-1">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-700"> First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Please enter first name"
                              {...field}
                              className="border-green-200 focus:border-green-400 focus:ring-green-400"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
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
                          <FormLabel className="text-green-700"> Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Please enter last name"
                              {...field}
                              className="border-green-200 focus:border-green-400 focus:ring-green-400"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
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
               
                <div className="py-1">

                  <FormField
                    control={form.control}
                    name={"department"}
                    render={() => (
                      <FormItem>
                        <FormLabel> Select Team</FormLabel>
                        <FormControl>
                          <Select
                            {...form.register("department")}
                            placeholder="Select team"
                            options={uniqueTeams?.map((team) => ({
                              label: team.team.name,
                              value: team.team.id,
                            }))}
                            onChange={(selectedOptions) => {
                              setTeamId(selectedOptions?.value);
                              form.setValue("department", selectedOptions?.label as string);
                            }}

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
                    name={"team_designation_id"}
                    render={() => (
                      <FormItem>
                        <FormLabel> Select Staff Designation</FormLabel>
                        <FormControl>
                          <Select
                            {...form.register("team_designation_id")}
                            placeholder="Select designation"
                            options={designations?.map((designation) => ({
                              label: designation.designation.name,
                              value: designation.id,
                            }))}
                            onChange={(selectedOptions) => {
                              form.setValue("team_designation_id", selectedOptions?.value as string);
                            }}

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
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gblue">Date of Birth</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter date of birth" type="date" onChange={field.onChange} />
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
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <CreatableSelect
                            options={bankOptions}
                            onChange={(option) => {
                              handleBankChange(option as BankOption | null);
                              field.onChange(option ? option.label : field.value);
                            }}
                            onInputChange={(newValue) => {
                              debouncedSearch(newValue);
                            }}
                            placeholder="Select or enter bank name"
                            isClearable
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
                    name="bank_account_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Account Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Please enter acc name"
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
                            <Input placeholder="Enter date of birth" type="date" onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                  </div>
                </div>

                <hr className="my-10" />


            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">

                { !documents ? 
                <Card>
                      <CardContent className="pt-6">
                        <p>No document types configured for this organization.</p>
                      </CardContent>
                    </Card>
                    :
                    documents.map((doc) => {
                      const docPreference = preferenceValue.documents.find((d) => d.type === doc.documentType);

                      return (
                        <div key={doc.documentType} className="space-y-4 grid md:grid-cols-2 items-end gap-2">
                          <div className="space-y-2">
                            <FormLabel>{doc.documentType}</FormLabel>
                            <div className="flex items-center gap-4">
                              <Input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  handleFileChange(doc.documentType, file);
                                }}
                                accept="application/pdf,image/*"
                                disabled={doc.isUploading}
                              />
                              {doc.isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                            </div>
                            {doc.fileUrl && <p className="text-sm text-muted-foreground">File ready for submission</p>}
                          </div>

                          {docPreference?.expires && (
                            <div className="space-y-2">
                              <FormLabel>Expiry Date</FormLabel>
                              <div>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={
                                      `w-[240px] pl-3 text-left font-normal",
                                      ${!doc.expiryDate && "text-muted-foreground"},
                                    `}
                                    disabled={doc.isUploading}
                                  >
                                    {doc.expiryDate ? format(doc.expiryDate, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={doc.expiryDate || undefined}
                                    onSelect={(date) => handleExpiryDateChange(doc.documentType, date!)}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

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

              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>Add emergency contact information for this staff member</CardDescription>
              </CardHeader>
              <CardContent>
              <div className=" space-y-4 grid md:grid-cols-2 gap-6 items-end">
              <FormField
                control={form.control}
                name="emergency_contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <Input placeholder="Enter relationship" {...field} />
                    
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            </CardContent>
            </Card>
          
          </div>
        </div>
      </form>
    </Form>
  );
}