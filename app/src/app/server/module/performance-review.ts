import { prisma } from "@/lib/prisma";
import { assignPerformanceReviewTemplateToTeamSchema, createPerformanceForStaffReviewSchema, createPerformanceReviewTemplateSchema, updatePerformanceReviewSchema, updatePerformanceReviewTemplateSchema } from "../dtos";
import { publicProcedure } from "../trpc";
import { z } from "zod";
import { StaffProfile } from "@prisma/client";


export type performanceReviewTemplateMetricsType = {
    column_name: string;
    column_description: string;
    column_type: "number" | "date" | "text" | "link"| "boolean" | "select" | "multi-select" | "other";
    column_value: string;
};

export type performanceReviewFeedbackType = {
  column_name: string;
  column_description: string;
  column_type: "number" | "date" | "text" | "link"| "boolean" | "select" | "multi-select" | "other";
  column_value: string;
};


export type performanceReviewTemplateAssignmentColumnType = {
 team_name: string;
 number_of_designations: number;
 number_of_staffs: number;
 template_name: string;
 created_by_name: string;
 performance_review_assigned_id: string;
 staff: StaffProfile;
};

export const createPerformanceReviewTemplate = publicProcedure.input(createPerformanceReviewTemplateSchema).mutation(async ({input}) => {
 
const organization = await prisma.organization.findUnique({
  where: {
    id: input.organization_id
  }
});

if(!organization) {
  throw new Error("Organization not found");
}

    const { organization_id, name, type, metrics } = input;
const filteredMetrics = metrics?.filter(metric => metric.column_name && metric.column_type);
    

 return await prisma.performanceReviewTemplate.create({
    data: {
      organization_id,
      name,
      type,
      metrics: filteredMetrics as performanceReviewTemplateMetricsType[],
      created_by_id: input.created_by_id
    }
  });
});

export const getAllPerformanceReviewTemplateByOrganizationSlug = publicProcedure.input(z.object({
  organization_slug: z.string()
})).query(async ({input}) => {
  return await prisma.performanceReviewTemplate.findMany({
    where: {
      organization_id: input.organization_slug,
      deleted_at: null
    },
    orderBy: {
      created_at: "desc"
    },
    include: {
      created_by: true,
    },

  });
});

export const deletePerformanceReviewTemplate = publicProcedure.input(z.object({
  id: z.string()
})).mutation(async ({input}) => {
  return await prisma.performanceReviewTemplate.update({
    where: {
      id: input.id
    },
    data: {
      deleted_at: new Date()
    }
  });
});

export const updatePerformanceReviewTemplate = publicProcedure.input(updatePerformanceReviewTemplateSchema).mutation(async ({input}) => {
  return await prisma.performanceReviewTemplate.update({
    where: {
      id: input.id
    },
    data: input
  });
});


export const assignPerformanceReviewTemplateToTeam = publicProcedure.input(assignPerformanceReviewTemplateToTeamSchema).mutation(async ({input}) => {
  
  return await prisma.performanceReviewTemplateAssignment.create({
    data: {
      template_id: input.template_id,
      team_id: input.team_id
    }
  });
});

export const deletePerformanceReview = publicProcedure.input(z.object({
  id: z.string()
})).mutation(async ({input}) => {
  const review = await prisma.performanceReview.findFirst({
    where: {
      staff_id: input.id
    }
  });
const assignment = await prisma.performanceReviewTemplateAssignment.findFirst({
  where: {
    team_id: review?.team_id || "",
    template_id: review?.template_id || "",
    deleted_at: null
  }
});

if (assignment) {
  await prisma.performanceReviewTemplateAssignment.update({
    where: {
      id: assignment.id
    },
    data: {
      deleted_at: new Date()
    }
  });
}
  return await prisma.performanceReview.update({
    where: {
      id: review?.id
    },
    data: {
      deleted_at: new Date()
    }
  });
});

export const updatePerformanceReview = publicProcedure.input(updatePerformanceReviewSchema).mutation(async ({input}) => {
  const { id, ...updateData } = input;
  return await prisma.performanceReview.update({
    where: { id },
    data: updateData
  });
});

export const getAllPerformanceReviewByOrganizationSlug = publicProcedure.input(z.object({
  organization_slug: z.string()
})).query(async ({input}) => {
  return await prisma.performanceReview.findMany({
    where: {
      organization_id: input.organization_slug,
      deleted_at: null
    },
  });
});

export const getAllAssignedPerformanceReviewTemplateToTeam = publicProcedure.input(z.object({
  organization_slug: z.string()
})).query(async ({input}) => {
  const assignments = await prisma.performanceReviewTemplateAssignment.findMany({
    where: {
      team: {
        organization_id: input.organization_slug
      }
    },
    include: {
      template: {
        include: {
          created_by: {
            select: {
              first_name: true,
              last_name: true
            }
          }
        }
      },
      team: {
        include: {
          parentTeam: true,
          designations: {
            include: {
              designation: {
                include: {
                  teamDesignations: {
                    include: {
                      staffs: {
                        include: {
                          user: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const formattedAssignments = assignments.map(assignment => ({
    ...assignment,
    staff: assignment.team.designations.map(designation => designation.designation.teamDesignations.map(td => td.staffs)).flat(),
    created_by_name: `${assignment.template.created_by.first_name} ${assignment.template.created_by.last_name}`,
    team_name: assignment.team.name,
    number_of_designations: assignment.team.designations.length,
    number_of_staffs: assignment.team.designations.reduce((acc, designation) => 
      acc + designation.designation.teamDesignations.reduce((total, td) => 
        total + td.staffs.length, 0
      ), 0
    ),
    template_name: assignment.template.name,
    performance_review_assigned_id: assignment.id,
  }));

  return formattedAssignments;
});

export const getPerformanceReviewAssignedById = publicProcedure.input(z.object({
  id: z.string()
})).query(async ({input}) => {
  return await prisma.performanceReviewTemplateAssignment.findUnique({
    where: { id: input.id , deleted_at: null},
    include: {
      template: {
        include: {
          created_by: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          },
        }
      },
      team: {
        include: {
          parentTeam: true,
          childTeams: true,
          organization: true,
          designations: {
            include: {
              designation: {
                include: {
                  teamDesignations: {
                    include: {
                      staffs: {
                        include: {
                          user: {
                            select: {
                              id: true,
                              first_name: true,
                              last_name: true,
                              email: true
                            }
                          },
                          performance_reviews: {
                            where: {
                              deleted_at: null
                            },
                            include: {
                              reviewer: true
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
});

export const createPerformanceForStaffReview = publicProcedure.input(createPerformanceForStaffReviewSchema).mutation(async ({input}) => {
if(!input.feedback.map(feedback => feedback.column_name && feedback.column_value && feedback.column_type)) {
  throw new Error("Feedback is required");
}
const { created_by_id,feedback, ...rest } = input;
const feedbackData = feedback as performanceReviewFeedbackType[];
const filteredFeedback = feedbackData.filter(feedback => feedback.column_name && feedback.column_value && feedback.column_type);
  return await prisma.performanceReview.create({
    data: {
      ...rest,
      feedback: filteredFeedback,
      created_by: created_by_id
    }
  });
});

export const findPerformanceReviewByStaffId = publicProcedure.input(z.object({
  staff_id: z.string()
})).query(async ({input}) => {
  return await prisma.performanceReview.findFirst({
    where: { staff_id: input.staff_id, deleted_at: null }
  });
});

export const updatePerformanceReviewById = publicProcedure.input(updatePerformanceReviewSchema).mutation(async ({input}) => {
  return await prisma.performanceReview.update({
    where: { id: input.id },
    data: input
  });
});

