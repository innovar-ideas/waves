"use client";

import { useMemo, useState } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import Spinner from "@/components/ui/spinner";
import { trpc } from "@/app/_providers/trpc-provider";
// import useActiveOrganizationStore from "@/store/active-organization.store";
// import { getActiveSessionId } from "@/lib/helper-function";
// import { MultiSelector } from "@/components/ui/multi-select";
// import { SchoolEventTypes } from "@/lib/constants";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { EventSchema, eventSchema } from "@/app/server/dtos";
import { MultiSelector } from "@/components/ui/multi-select";
import Spinner from "@/components/ui/spinner";
import { EventTypes } from "@/lib/constants";

interface NewEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewEventDialog({ open, onOpenChange }: NewEventDialogProps) {
  const { toast } = useToast();
  const { organizationSlug } = useActiveOrganizationStore();

  const [attendeesGroupType, setAttendeesGroupType] = useState<
    "by-individuals" | "by-team" | "by-roles" | "all-roles"
  >("by-individuals");

  // const { data: students } = trpc.getStudentsByOrganization.useQuery({ slug: organizationSlug });
  const { data: staff } = trpc.getStaffsByOrganizationId.useQuery({ id: organizationSlug });
  // const { data: parents } = trpc.getGuardians.useQuery({ organization_slug: organizationSlug });

  const utils = trpc.useUtils();
  // const activeSessionData = getActiveSessionId(organizationSlug);
  // const activeSessionChildId = activeSessionData?.activeSessionId as string;
  // const activeSessionParentId = activeSessionData?.activeSessionParentId as string;

  const { data: teams } = trpc.getTeamsByOrganizationId.useQuery({
    id: organizationSlug,
  });

  const rolesData = useMemo(
    () => [
      { id: "Staff", value: "staff" },
      { id: "Parents", value: "parent" },
      { id: "Students", value: "student" },
      { id: "Teachers", value: "teacher" },
    ],
    []
  );

  const defaultValues: Partial<EventSchema> = {
    name: "",
    slug: organizationSlug,
    starts: new Date(),
    ends: new Date(),
    all_day: false,
    repeat: "NONE",
    save_to_calendar: false,
  };

  const form = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues,
    mode: "onChange",
  });

  const createEvent = trpc.createEvent.useMutation({
    onSuccess: () => {
      toast({ description: "Event created successfully." });
      form.reset();
      utils.getAllEventsForOrganizationBySlug.invalidate();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ description: error.message, variant: "destructive" });
      console.error(error);
    },
  });

  const onSubmit = async (values: EventSchema) => {
    createEvent.mutate({ ...values, slug: organizationSlug });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-screen max-w-[425px] overflow-y-scroll p-0'>
        <DialogHeader className='p-4 pb-0'>
          <DialogTitle className='text-xl'>New Event</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-4'>
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className='border-0 bg-secondary/50 px-3 py-2 placeholder:text-muted-foreground'
                        placeholder='Add Title'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='space-y-2'>
                <FormField
                  control={form.control}
                  name='starts'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className='flex items-center gap-3 rounded-md bg-secondary/50 px-3 py-2'>
                          <Calendar className='h-4 w-4 text-muted-foreground' />
                          <Input
                            type='date'
                            className='border-0 bg-transparent p-0'
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                            onChange={(e) => {
                              const date = new Date(e.target.value);
                              field.onChange(date);
                            }}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className='flex items-center gap-3 rounded-md bg-secondary/50 px-3 py-2'>
                  <Clock className='h-4 w-4 text-muted-foreground' />
                  <div className='flex items-center gap-2'>
                    <FormField
                      control={form.control}
                      name='starts'
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type='time'
                              className='border-0 bg-transparent p-0'
                              {...field}
                              value={
                                field.value
                                  ? new Date(field.value).toLocaleTimeString("en-US", {
                                    hour12: false,
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                  : ""
                              }
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(":");
                                const date = new Date(field.value);
                                date.setHours(parseInt(hours), parseInt(minutes));
                                field.onChange(date);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span className='text-muted-foreground'>-</span>
                    <FormField
                      control={form.control}
                      name='ends'
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type='time'
                              className='border-0 bg-transparent p-0'
                              {...field}
                              value={
                                field.value
                                  ? new Date(field.value).toLocaleTimeString("en-US", {
                                    hour12: false,
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                  : ""
                              }
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(":");
                                const date = new Date(field.value);
                                date.setHours(parseInt(hours), parseInt(minutes));
                                field.onChange(date);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className='flex items-center justify-between px-1'>
                <div className='flex items-center gap-2'>
                  <FormField
                    control={form.control}
                    name='all_day'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} id='all-day' />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Label htmlFor='all-day'>All Day</Label>
                </div>
                <FormField
                  control={form.control}
                  name='repeat'
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='w-[140px] border-0'>
                            <SelectValue placeholder='Repeat' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='NONE'>No repeat</SelectItem>
                          <SelectItem value='DAILY'>Daily</SelectItem>
                          <SelectItem value='WEEKLY'>Weekly</SelectItem>
                          <SelectItem value='MONTHLY'>Monthly</SelectItem>
                          <SelectItem value='YEARLY'>Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='location'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='flex items-center gap-3 rounded-md bg-secondary/50 px-3 py-2'>
                        <MapPin className='h-4 w-4 text-muted-foreground' />
                        <Input
                          className='border-0 bg-transparent p-0 placeholder:text-muted-foreground'
                          placeholder='Add Location'
                          {...field}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='attendees_group_type'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='flex items-center gap-3 rounded-md bg-secondary/50 px-3 py-2'>
                        <div className='flex w-full items-center justify-between'>
                          <Select
                            value={attendeesGroupType}
                            onValueChange={(value) => {
                              setAttendeesGroupType(value as "by-individuals" | "by-team" | "by-roles" | "all-roles");
                              field.onChange(value);
                            }}
                          >
                            <SelectTrigger className='border-0 bg-transparent p-0'>
                              <SelectValue placeholder='Send Invite' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='by-individuals'>By Individuals</SelectItem>
                              <SelectItem value='by-team'>By Team</SelectItem>
                              <SelectItem value='by-roles'>By Roles</SelectItem>
                              <SelectItem value='all-roles'>All organization members</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {attendeesGroupType === "by-individuals" && (
                <div className='space-y-2'>
                  <Label>Attendees</Label>
                  <div className='flex flex-col gap-4'>
                    <FormField
                      control={form.control}
                      name='staff_ids'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Staff</FormLabel>
                          <FormControl>
                            <MultiSelector
                              data-cy='staff-multi-selector'
                              values={field.value ?? []}
                              onValuesChange={(values) => {
                                field.onBlur();
                                field.onChange(values);
                              }}
                              loop={false}
                              options={
                                staff?.map((staff) => ({
                                  label: staff.user.first_name + " " + staff.user.last_name,
                                  value: staff.user.id,
                                  "data-cy": `staff-option-${staff.id}`,
                                })) ?? []
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {attendeesGroupType === "by-team" && (
                <FormField
                  control={form.control}
                  name='class_ids'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classes</FormLabel>
                      <FormControl>
                        <MultiSelector
                          data-cy='classes-multi-selector'
                          values={field.value ?? []}
                          onValuesChange={(values) => {
                            field.onBlur();
                            field.onChange(values);
                          }}
                          loop={false}
                          options={
                            teams?.map((team) => ({
                              label: team.name,
                              value: team.id,
                              "data-cy": `class-option-${team.id}`,
                            })) ?? []
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {(attendeesGroupType === "by-roles" || attendeesGroupType === "all-roles") && (
                <fieldset disabled={attendeesGroupType === "all-roles"}>
                  <FormField
                    control={form.control}
                    name='roles'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roles</FormLabel>
                        <FormControl>
                          <MultiSelector
                            data-cy='roles-multi-selector'
                            values={field.value ?? []}
                            onValuesChange={(values) => {
                              field.onBlur();
                              field.onChange(values);
                            }}
                            loop={false}
                            options={
                              rolesData?.map((item) => ({
                                label: item.id,
                                value: item.value,
                                "data-cy": `item-option-${item.id}`,
                              })) ?? []
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </fieldset>
              )}

              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='flex items-center gap-3 rounded-md bg-secondary/50 px-3 py-2'>
                        <div className='flex w-full items-center justify-between'>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                          >
                            <SelectTrigger className='border-0 bg-transparent p-0'>
                              <SelectValue placeholder='Select Event Type' />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(EventTypes).map((eventType) => (
                                <SelectItem key={eventType} value={eventType}>
                                  {eventType}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className='flex items-center gap-2'>
                <FormField
                  control={form.control}
                  name='save_to_calendar'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch id='save-to-calendar' checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Label htmlFor='all-day'>Save to Calender</Label>
              </div>
            </div>

            <Button className='w-full bg-primary font-medium' type='submit' disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Spinner /> : "Save"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
