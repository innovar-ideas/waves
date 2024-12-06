import { z } from "zod";
import { EventTypes } from "@/lib/constants";
import { Event } from "@prisma/client";
import { eventDateRangeSchema, eventSchema, getEventsSchema, getEventsUsingFilterSchema, organizationSlugSchema } from "../dtos";
import { publicProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { groupEventsByMonth } from "@/lib/helper-function";

export type EventItem = {
    start?: Date;
    end?: Date;
    data?: { event?: Event };
    resourceId?: number;
    title: string;
    allDay: boolean;
    resource?: string;
};


export const getAllEventOfAnOrganization = publicProcedure
    .input(getEventsUsingFilterSchema)
    .query(async ({ input }) => {
        const { slug, dateRange, type, pageSize = 10, page = 1 } = input;
        const offset = (page - 1) * pageSize;

        const events = await prisma.event.findMany({
            where: {
                organization: { id: slug },
                deleted_at: null,
                ...(type && { type: type }),
                starts: { gte: dateRange?.from ?? undefined },
                ends: { lte: dateRange?.to ?? undefined },
            },
            skip: offset,
            take: pageSize,
            orderBy: { starts: "asc" },
        });

        const totalEvents = await prisma.event.count({
            where: {
                organization: { id: slug },
                deleted_at: null,
                ...(type && { type: type }),
                starts: { gte: dateRange?.from ?? undefined },
                ends: { lte: dateRange?.to ?? undefined },
            },
        });

        return {
            events,
            totalEvents,
            page,
            pageSize,
            totalPages: Math.ceil(totalEvents / pageSize),
        };
    });

export const getAllEventsForOrganizationBySlug = publicProcedure
    .input(organizationSlugSchema)
    .query(async ({ input }) => {
        const { slug } = input;

        const events = await prisma.event.findMany({
            where: {
                organization: { id: slug },
                deleted_at: null,
            },
            orderBy: { starts: "asc" },
        });

        return { events: events };
    });

export const getEventsByDateRange = publicProcedure.input(eventDateRangeSchema).query(async ({ input }) => {
    const { slug, startDate, endDate } = input;

    const events = await prisma.event.findMany({
        where: {
            organization: { id: slug },
            starts: { gte: startDate },
            ends: { lte: endDate },
            deleted_at: null,
        },
        orderBy: { starts: "asc" },
    });

    return { events };
});

export const createEvent = publicProcedure.input(eventSchema).mutation(async ({ input }) => {
    const { slug, attendees_group_type, students_ids, staff_ids, parents_ids, class_ids, roles, repeat, ...rest } = input;
    const organization = await prisma.organization.findUnique({ where: { id: slug } });

    if (!organization) {
        throw new Error("Organization not found");
    }

    let userIds: string[] = [];

    if (attendees_group_type === "by-individuals") {
        userIds = [...(students_ids ?? []), ...(staff_ids ?? []), ...(parents_ids ?? [])].filter(Boolean);
    } else if (attendees_group_type === "by-team" && class_ids?.length) {
        const teamMembers = await prisma.team.findMany({
            where: { id: { in: class_ids }, deleted_at: null },
            select: {
                designations: { select: { staffs: { select: { user_id: true } } } },
            },
        });
        userIds = teamMembers.flatMap(member =>
            member.designations.flatMap(designation =>
                designation.staffs.map(staff => staff.user_id)
            )
        );
    } else if (attendees_group_type === "all-roles" || (attendees_group_type === "by-roles" && roles?.length)) {
        const rolesToFetch =
            attendees_group_type === "all-roles" && roles || [];

        const users = await prisma.user.findMany({
            where: {
                deleted_at: null,
                OR: [
                    {
                        organization: {
                            id: slug,
                            deleted_at: null,
                        },
                    },
                ],
                staffProfile: {
                    some: {
                        team_designation: {
                            designation: {
                                name: { in: rolesToFetch }
                            },
                        },
                    },
                },
            },
            select: { id: true },
        });

        userIds = users.map((user) => user.id);
    }



    const createdEvent = await prisma.event.create({
        data: {
            ...rest,
            ends: new Date(rest.ends),
            starts: new Date(rest.starts),
            organization_id: organization.id,
            users: {
                connect: userIds.map((id) => ({ id })),
            },
            repeat: repeat,
        },
    });

    return createdEvent;
});

export const updateEvent = publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    const { id, ...data } = input;

    const event = await prisma.event.update({
        where: { id },
        data,
    });

    return { event };
});

export const deleteEvent = publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    const { id } = input;

    const event = await prisma.event.update({
        where: { id },
        data: { deleted_at: new Date() },
    });

    return { event };
});

export const getEvents = publicProcedure.input(getEventsSchema).query(async ({ input }) => {
    const { slug, userId } = input;

    const organization = await prisma.organization.findFirst({
        where: { id: slug },
        select: { id: true },
    });

    if (!organization) {
        throw new Error("Organization not found");
    }

    const whereClause = {
        organization_id: organization.id,
        deleted_at: null,
        users: {
            some: {
                id: userId,
                deleted_at: null,
            },
        },
    };

    const events = await prisma.event.findMany({
        where: whereClause,
        orderBy: [
            {
                starts: "asc",
            },
        ],
    });

    return events;
});

export const getAllEventsGroupedByMonth = publicProcedure.input(organizationSlugSchema).query(async ({ input }) => {
    const { slug } = input;

    const now = new Date();

    const events = await prisma.event.findMany({
        where: {
            organization: { id: slug },
            deleted_at: null,
            starts: {
                gte: now,
            },
            type: { not: EventTypes.BIRTHDAY },
        },
        orderBy: { starts: "asc" },
        include: {
            organization: {
                select: {
                    name: true,
                    slug: true,
                },
            },
        },
    });

    const groupedEvents = groupEventsByMonth(events);

    return { groupedEvents };
});

export const getAllBirthdayEventsForOrganizationBySlug = publicProcedure
    .input(organizationSlugSchema)
    .query(async ({ input }) => {
        const { slug } = input;

        const now = new Date();

        const birthdayEvents = await prisma.event.findMany({
            where: {
                organization: { id: slug },
                deleted_at: null,
                type: EventTypes.BIRTHDAY, // Only birthday events
                starts: {
                    gte: now,
                },
            },
            orderBy: { starts: "asc" },
            include: {
                users: true,
            },
        });

        const groupedByDay = birthdayEvents.reduce<
            Record<string, { date: string; users: { userId: string; userName: string }[] }>
        >((acc, event) => {
            const day = event.starts.toISOString().slice(0, 10); // Format as "YYYY-MM-DD"

            if (!acc[day]) {
                acc[day] = { date: day, users: [] };
            }

            acc[day].users.push(
                ...event.users.map((user) => ({
                    userId: user.id,
                    userName: `${user.first_name} ${user.last_name}`,
                }))
            );

            return acc;
        }, {});

        const groupedByMonth = Object.entries(groupedByDay).reduce<
            Record<string, { date: string; users: { userId: string; userName: string }[] }[]>
        >((acc, [day, { users }]) => {
            const month = day.slice(0, 7); // Format as "YYYY-MM"

            if (!acc[month]) {
                acc[month] = [];
            }

            acc[month].push({ date: day, users });

            return acc;
        }, {});

        const formattedGroups = Object.entries(groupedByMonth).map(([month, events]) => ({
            month,
            events,
        }));

        return { groupedBirthdayEvents: formattedGroups };
    });

export const getAllEventsForCalenderByOrgSlug = publicProcedure
    .input(organizationSlugSchema)
    .query(async ({ input }): Promise<{ events: EventItem[] }> => {
        const { slug } = input;

        const events = await prisma.event.findMany({
            where: {
                organization: { id: slug },
                deleted_at: null,
            },
            include: {
                organization: true,
            },
            orderBy: { starts: "asc" },
        });

        const formattedEvents: EventItem[] = events.map((event) => ({
            allDay: event.all_day,
            title: event.name,
            start: event.starts,
            end: event.ends,
            resource: event.organization_id,
            data: { event },
        }));

        return { events: formattedEvents };
    });
