import { useState, useEffect, useCallback } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select as SecondSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStaffSchema } from "@/app/server/dtos";
import { z } from "zod";
import Select from "react-select";
import { trpc } from "@/app/_providers/trpc-provider";
import { Badge } from "@/components/ui/badge";
import { Designation, EmergencyContact, StaffProfile, Team, TeamDesignation, User, WorkHistory } from "@prisma/client";
import { format } from "date-fns";
import { toast } from "sonner";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import CreatableSelect from "react-select/creatable";
import debounce from "lodash/debounce";
import { DocumentPreference } from "@/app/server/module/preference";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DocumentMetadata, StaffDocumentState } from "@/app/server/types";
import { Label } from "@/components/ui/label";
import { PutBlobResult } from "@vercel/blob";


interface StaffFormProps {
  staffProfile: StaffProfile & {
    user: User & {emergency_contact: EmergencyContact | null}; work_history: WorkHistory[]; team_designation: TeamDesignation & {
      designation: Designation; team: Team
    } | null
  }
}

type TFormData = z.infer<typeof createStaffSchema>;

interface BankOption {
  value: string;
  label: string;
  __isNew__?: boolean;
}


export default function EditStaffForm({ staffProfile }: StaffFormProps) {
  const form = useForm<TFormData>({ resolver: zodResolver(createStaffSchema), defaultValues: {
    organization_id: staffProfile.organization_id as string,
    // Pre-populate form when staff data is available
    ...(staffProfile && {
      id: staffProfile.id,
      user_id: staffProfile.user_id,
      first_name: staffProfile.user.first_name,
      last_name: staffProfile.user.last_name ?? undefined,
      email: staffProfile.user.email ?? undefined,
      phone_number: staffProfile.user.phone_number ?? undefined,
      marital_status: staffProfile.marital_status ?? undefined,
      department: staffProfile.department ?? undefined,
      team_designation_id: staffProfile.team_designation_id ?? undefined,
      date_of_birth: staffProfile.date_of_birth ?? undefined,
      joined_at: staffProfile.joined_at ?? undefined,
      bank_name: staffProfile.bank_name ?? undefined,
      bank_account_name: staffProfile.bank_account_name ?? undefined,
      bank_account_no: staffProfile.bank_account_no ?? undefined,
      nin: staffProfile.nin ?? undefined,
      tin: staffProfile.tin ?? undefined,
      passport_number: staffProfile.passport_number ?? undefined,
      passport_expiry_date: staffProfile.passport_expiry_date ?? undefined,
      emergency_contact_name: staffProfile.user.emergency_contact?.name ?? undefined,
      emergency_contact_phone_number: staffProfile.user.emergency_contact?.phone ?? undefined,
      emergency_contact_relationship: staffProfile.user.emergency_contact?.relationship ?? undefined,
      emergency_contact_address: staffProfile.user.emergency_contact?.street_address ?? undefined,
      emergency_contact_city: staffProfile.user.emergency_contact?.city ?? undefined,
      emergency_contact_state: staffProfile.user.emergency_contact?.state ?? undefined,
      emergency_contact_country: staffProfile.user.emergency_contact?.country ?? undefined,
    }),
  }, });
  const [selectedSkills, setSelectedSkills] = useState<string>("");
  const [teamId, setTeamId] = useState<string | undefined>("");
  const [confirmPassword, setConfirmPassword] = useState<string>();
    const [documents, setDocuments] = useState<StaffDocumentState[]>([]);
  const utils = trpc.useUtils();
  const { organizationSlug } = useActiveOrganizationStore();
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showOtherField, setShowOtherField] = useState(false);
  const [otherRelationship, setOtherRelationship] = useState<string | null>(null);

  const relationships = [
    { value: "parent", label: "Parent" },
    { value: "spouse", label: "Spouse" },
    { value: "sibling", label: "Sibling" },
    { value: "child", label: "Child" },
    { value: "friend", label: "Friend" },
    { value: "other", label: "Other" },
  ];

  const { data: uniqueTeams } = trpc.getUniqueTeamsFromTeamDesignationsByOrganizationId.useQuery({
    id: organizationSlug,
  });
  const { data: designations, refetch: refetchDesignations } = trpc.getTeamDesignationsByTeamId.useQuery({
    id: teamId as string,
  });

  const { data: banks } = trpc.getAllBanksByOrganizationId.useQuery({
    id: organizationSlug as string,
  });

  if(!banks){
    console.error("Fetch bank failed");
  }

  const bankOptions: BankOption[] = banks
  ? banks.map((bank) => ({
    label: bank.name,
    value: bank.id,
  }))
  : [];

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

      const { data: organizationSkills } = trpc.findOrganizationSkillsBySlug.useQuery({
        id: organizationSlug,
      });
    
      const skillsValue = organizationSkills?.value as { skills: string[] };

      const handleExpiryDateChange = (documentType: string, date: Date | null) => {
        setDocuments((prev) => prev.map((doc) => (doc.documentType === documentType ? { ...doc, expiryDate: date } : doc)));
      };

  // const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.files && event.target.files[0]) {
  //     setPhoto(event.target.files[0]);
  //   }
  // };

    useEffect(() => {
      refetchDesignations();
    },
    [teamId, refetchDesignations]);

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

  const updateStaff = trpc.updateStaff.useMutation({
    onSuccess: async () => {
      toast.success("Staff successfully updated");

      utils.getAllStaffs.invalidate();
    },
    onError: (error) => {
      console.error(error);

      toast.error("Error updating staff");
    },
  });

  const handleFileChange = (documentType: string, file: File | null) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.documentType === documentType ? { ...doc, file, fileUrl: null } : doc)),
    );
  };

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

      const debouncedSearch = useCallback(
        (term: string) => {
          debounce((searchTerm: string) => {
            setSupplierSearch(searchTerm);
          }, 300)(term);
        },
        [setSupplierSearch]
      );

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
   if(confirmPassword){ 
    if (confirmPassword !== form.getValues("password")) {
      toast.error("Password mismatch");
      return;
    }}

    const documentsToUpload = documents.filter((doc) => doc.file !== null);
    
          let uploadedUrls: (string | null)[] = [];
    
          if (documentsToUpload.length !== 0) {
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

    console.log(supplierSearch);
    updateStaff.mutate({ ...values, skill: selectedSkills, documents_url: documentMetadata, emergency_contact_relationship: otherRelationship ? otherRelationship : values.emergency_contact_relationship });

  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (error) => console.error("form err: ", error))}>
        <div className="container mx-auto p-4 z-40">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-green-700">Edit Employee</h1>
            <div className="space-x-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Loading..." : "Submit"}</Button>
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
                      defaultValue={staffProfile?.user.first_name as string}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-700"> First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Please enter first name"
                              {...field}
                              className="border-green-200 focus:border-green-500"
                            />
                          </FormControl>
                          <FormMessage className="text-green-600" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="py-1">
                    <FormField
                      control={form.control}
                      name="last_name"
                      defaultValue={staffProfile.user.last_name as string}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-700"> Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Please enter last name"
                              {...field}
                              className="border-green-200 focus:border-green-500"
                            />
                          </FormControl>
                          <FormMessage className="text-green-600" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="py-1">
                    <FormField
                      control={form.control}
                      name="email"
                      defaultValue={staffProfile.user.email as string}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-700"> Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Please enter email"
                              {...field}
                              className="border-green-200 focus:border-green-500"
                            />
                          </FormControl>
                          <FormMessage className="text-green-600" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="py-1">
                    <FormField
                      control={form.control}
                      name="phone_number"
                      defaultValue={staffProfile.user.phone_number as string}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-700">Phone No</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Please enter phone no"
                              {...field}
                              className="border-green-200 focus:border-green-500"
                            />
                          </FormControl>
                          <FormMessage className="text-green-600" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="py-1">
                  <FormField
                control={form.control}
                name="street_address"
                defaultValue={staffProfile?.user?.emergency_contact?.street_address as string}
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
              </div>
                  

              <div className="py-1">
              <FormField
                  control={form.control}
                  name="city"
                  defaultValue={staffProfile?.user?.emergency_contact?.city as string}
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
              </div>

              <div className="py-1">
              <FormField
                control={form.control}
                name="state"
                defaultValue={staffProfile?.user?.emergency_contact?.state as string}
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
              </div>

              <div className="py-1">
              <FormField
                control={form.control}
                name="country"
                defaultValue={staffProfile?.user?.emergency_contact?.country as string}
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

                <div>
                  <FormField
                    control={form.control}
                    name="marital_status"
                    defaultValue={staffProfile.marital_status as string}
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel className="text-green-700">Marital Status</FormLabel>
                        <SecondSelect onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl className="mt-1">
                            <SelectTrigger className="border-green-200">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Divorced">Divorced</SelectItem>
                          </SelectContent>
                        </SecondSelect>
                        <FormMessage className="text-green-600" />
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
                            defaultValue={{value: staffProfile?.team_designation?.team.id, label: staffProfile?.team_designation?.team.name}}
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
                            defaultValue={{value: staffProfile?.team_designation?.designation.id, label: staffProfile?.team_designation?.designation.name}}
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
                    defaultValue={staffProfile.date_of_birth as Date}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-green-700">Date of Birth</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter date of birth" type="date" {...field} value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                            onChange={(e) => {
                              const date = new Date(e.target.value);
                              if (!isNaN(date.getTime())) {
                                field.onChange(date);
                              }
                            }}
                            className="border-green-200 focus:border-green-500" />
                        </FormControl>
                        <FormMessage className="text-green-600" />
                      </FormItem>
                    )} />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="joined_at"
                    defaultValue={staffProfile.joined_at as Date}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-green-700">Date of Employment</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                            onChange={(e) => {
                              const date = new Date(e.target.value);
                              if (!isNaN(date.getTime())) {
                                field.onChange(date);
                              }
                            }}
                            className="border-green-200 focus:border-green-500" />
                        </FormControl>
                        <FormMessage className="text-green-600" />
                      </FormItem>
                    )} />
                </div>

              </CardContent>
            </Card>
            <Card className="border-green-100">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-700">Bank Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="py-1">
                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-green-700">Bank Name</FormLabel>
                        <FormControl>
                          <CreatableSelect
                            options={bankOptions}
                            defaultValue={{value: staffProfile.bank_name, label: staffProfile.bank_name}}
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
                    defaultValue={staffProfile.bank_account_name as string}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-green-700">Bank Account Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Please enter acc name"
                            {...field}
                            className="border-green-200 focus:border-green-500"
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
                    defaultValue={staffProfile.bank_account_no as string}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-green-700">Bank Account No.</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Please enter acc no"
                            {...field}
                            className="border-green-200 focus:border-green-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>


                <hr className="my-10 border-green-200" />

                <div>
                  <h2 className="font-semibold text-green-700">Personal Information</h2>

                  <div className="py-1">
                    <FormField
                      control={form.control}
                      name="nin"
                      defaultValue={staffProfile.nin as string}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-700">NIN</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Please enter NIN"
                              {...field}
                              className="border-green-200 focus:border-green-500"
                            />
                          </FormControl>
                          <FormMessage className="text-green-600" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="py-1">
                    <FormField
                      control={form.control}
                      name="tin"
                      defaultValue={staffProfile.tin as string}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-700">TIN</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Please enter TIN"
                              {...field}
                              className="border-green-200 focus:border-green-500"
                            />
                          </FormControl>
                          <FormMessage className="text-green-600" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="py-1">
                    <FormField
                      control={form.control}
                      name="passport_number"
                      defaultValue={staffProfile.passport_number as string}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-700">Passport No</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Please enter passport no"
                              {...field}
                              className="border-green-200 focus:border-green-500"
                            />
                          </FormControl>
                          <FormMessage className="text-green-600" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name="passport_expiry_date"
                      defaultValue={staffProfile.passport_expiry_date as Date}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-700">Passport Expiry Date</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter date of birth" type="date" {...field} value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                              onChange={(e) => {
                                const date = new Date(e.target.value);
                                if (!isNaN(date.getTime())) {
                                  field.onChange(date);
                                }
                              }}
                              className="border-green-200 focus:border-green-500" />
                          </FormControl>
                          <FormMessage className="text-green-600" />
                        </FormItem>
                      )} />
                  </div>
                </div>

                <hr className="my-10 border-green-200" />

                {/* <Card className="border-green-100">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-700">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">

                  <div>
                    <Label htmlFor="documents" className="text-green-700">Add Employee Documents</Label>
                    <Input
                      id="documents"
                      type="file"
                      onChange={handleDocumentUpload}
                      multiple
                      className="cursor-pointer border-green-200"
                    />
                  </div>
                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-green-700">Uploaded Documents:</Label>
                      <ul className="space-y-2">
                        {documents.map((doc, index) => (
                          <li key={index} className="flex items-center justify-between bg-green-50 p-2 rounded-md">
                            <span className="truncate">{doc.name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDocument(index)}
                              className="text-green-700 hover:text-green-800"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="w-full space-y-2">
                    <label className="text-sm font-semibold text-green-700">Select Skills</label>
                    <div className="flex flex-wrap gap-2 p-4 bg-green-50 rounded-lg">
                      {possibleSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant={isSkillSelected(skill) ? "default" : "secondary"}
                          className={`cursor-pointer ${isSkillSelected(skill) ? "bg-green-600" : "bg-green-100 text-green-700"} hover:bg-green-200`}
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
            </Card> */}

            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">

                { documents.length == 0 ? 
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
                      {skillsValue?.skills?.map((skill) => (
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
                defaultValue={staffProfile?.user?.emergency_contact?.name as string}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_phone_number"
                defaultValue={staffProfile?.user?.emergency_contact?.phone as string}
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

            <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="emergency_contact_relationship"
                    defaultValue={staffProfile?.user?.emergency_contact?.relationship as string}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <SecondSelect
                          onValueChange={(value) => {
                            field.onChange(value);
                            setShowOtherField(value === "other");
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {relationships.map((relationship) => (
                              <SelectItem key={relationship.value} value={relationship.value}>
                                {relationship.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </SecondSelect>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showOtherField && (
                    
                        <div>
                          <Label>Specify Relationship</Label>
                          <Input placeholder="Enter relationship" onChange={(e)=> setOtherRelationship(e.target.value)} />
                        </div>
                    
                  )}
                </div>

              <FormField
                control={form.control}
                name="emergency_contact_address"
                defaultValue={staffProfile?.user?.emergency_contact?.street_address as string}
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
                defaultValue={staffProfile?.user?.emergency_contact?.city as string}
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
                defaultValue={staffProfile?.user?.emergency_contact?.state as string}
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
                defaultValue={staffProfile?.user?.emergency_contact?.country as string}
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