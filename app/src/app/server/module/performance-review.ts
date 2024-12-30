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
  id: string;
 team_name?: string;
 number_of_designations?: number;
 number_of_staffs?: number;
 template_name?: string;
 created_by_name?: string;
 performance_review_assigned_id?: string;
 staff?: StaffProfile;
 created_at?: Date;
 created_by_id?: string;
};
export type performanceReviewTemplateAssignmentRoleRangeColumnType = {
  id: string;
 max_role_level?: number; 
 min_role_level?: number; 
 number_of_designations?: number;
 number_of_staffs?: number;
 template_name?: string;
 created_by_name?: string;
 performance_review_assigned_id?: string;
 staff?: StaffProfile;
 created_at?: Date;
 created_by_id?: string;
};
export type performanceReviewTemplateAssignmentRoleLevelColumnType = {
  id: string;
 role_level? : number;
 number_of_designations?: number;
 number_of_staffs?: number;
 template_name?: string;
 created_by_name?: string;
 performance_review_assigned_id?: string;
 staff?: StaffProfile;
 created_at?: Date;
 created_by_id?: string;
};
export type performanceReviewAssignmentType = {
  id: string;
  template?: {
    id: string;
    name: string;
    metrics: performanceReviewTemplateMetricsType[];
    created_by?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  team?: {
    id: string;
    name: string;
    parentTeam?: {
      id: string;
      name: string;
    };
    childTeams?: {
      id: string;
      name: string;
    }[];
    organization?: {
      id: string;
      name: string;
    };
    designations?: {
      id: string;
      designation?: {
        id: string;
        name: string;
        teamDesignations?: {
          id: string;
          staffs?: {
            id: string;
            user?: {
              id: string;
              first_name: string;
              last_name: string;
              email: string;
            };
            performance_reviews?: {
              id: string;
              reviewer?: {
                id: string;
                name: string;
              };
            }[];
          }[];
        }[];
      };
    }[];
  };
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


let performanceReviewTemplate;
 try {
  performanceReviewTemplate = await prisma.performanceReviewTemplate.create({
    data: {
      organization_id,
      name,
      type,
      metrics: filteredMetrics as performanceReviewTemplateMetricsType[],
      created_by_id: input.created_by_id,
    }
  });
 
  return performanceReviewTemplate;
} catch (error) {
  
  throw new Error("Failed to create performance review template", error as Error );
}
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

export const getPerformanceReviewTemplateAssignmentId = publicProcedure.input(z.object({
  id: z.string()
})).query(async ({input}) =>{
  return await prisma.performanceReviewTemplateAssignment.findUnique({
    where: {
      id: input.id
    }
  });
});


export const assignPerformanceReviewTemplateToTeam = publicProcedure.input(assignPerformanceReviewTemplateToTeamSchema).mutation(async ({input}) => {
  // Check if assignment already exists for this template-team combination
  const existingAssignment = await prisma.performanceReviewTemplateAssignment.findFirst({
    where: {
      template_id: input.template_id,
      team_id: input.team_id,
      deleted_at: null 
    }
  });

  if (existingAssignment) {
    throw new Error("This template is already assigned to this team");
  }

  if(!input.team_id){
 
    return await prisma.performanceReviewTemplateAssignment.create({
      data: {
        template_id: input.template_id,
        role_level: input.role_level || 0,
        role_level_max: input.role_level_max || 0,
        role_level_min: input.role_level_min || 0,
        organization_id: input.organization_id ?? ""
      }
    });
  }
  return await prisma.performanceReviewTemplateAssignment.create({
    data: {
      template_id: input.template_id,
      team_id: input.team_id || "",
      role_level: input.role_level || 0,
      role_level_max: input.role_level_max || 0,
      role_level_min: input.role_level_min || 0,
      organization_id: input.organization_id ?? ""
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
    staff: assignment.team?.designations.map(designation => designation.designation.teamDesignations.map(td => td.staffs)).flat() || [],
    created_by_name: `${assignment.template.created_by.first_name} ${assignment.template.created_by.last_name}`,
    team_name: assignment.team?.name || "",
    number_of_designations: assignment.team?.designations.length || 0,
    number_of_staffs: assignment.team?.designations.reduce((acc, designation) => 
      acc + designation.designation.teamDesignations.reduce((total, td) => 
        total + td.staffs.length, 0
      ), 0
    ),
    template_name: assignment.template.name,
    performance_review_assigned_id: assignment.id,
  }));

  return formattedAssignments;
});

export const getAllStaffForReviewByOrgIdAndRange = publicProcedure.input(
  z.object({
    org_id: z.string(),
    role_max_level: z.number(), 
    role_min_level: z.number()
  })
).query(async ({input}) => {
  const staffs = await prisma.staffProfile.findMany({
    where: {
      organization_id: input.org_id,
      deleted_at: null,
      team_designation: {
        designation: {
          role_level: {
            gte: input.role_min_level,
            lte: input.role_max_level
          }
        }
      }
    },
    include: {
      user: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true
        }
      },
      team_designation: {
        include: {
          designation: true,
          team: {
            include: {
              parentTeam: true
            }
          }
        }
      },
      performance_reviews: {
        where: { deleted_at: null },
        include: { reviewer: true }
      }
    }
  });

  return staffs;
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
 await prisma.performanceReviewTemplate.findUnique({
  where: {
    id: input.template_id
  }
});

// Add null checks and default to 0 if undefined
const { created_by_id,feedback} = input;
const feedbackData = feedback as performanceReviewFeedbackType[];
const filteredFeedback = feedbackData.filter(feedback => feedback.column_name && feedback.column_value && feedback.column_type);
  return await prisma.performanceReview.create({
    data: {
      staff_id: input.staff_id,
      template_id: input.template_id,
      reviewer_id: input.reviewer_id,
      organization_id: input.organization_id,
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

export const findPerformanceReviewById = publicProcedure.input(z.object({
  id: z.string()
})).query(async ({input}) => {
  return await prisma.performanceReview.findFirst({ where: { staff_id: input.id, deleted_at: null }, include: { staff: {
    include: {
      user: true
      }
    },
    reviewer: {
      select: {
        first_name: true,
        last_name: true
      }
    },
    template: true,
    team: true
    }
  });
});

export const getAllUnassignedPerformanceReviewByOrganizationSlug = publicProcedure.input(z.object({
  organization_slug: z.string()
})).query(async ({input}) => {
  return await prisma.performanceReviewTemplateAssignment.findMany({ where: { organization_id: input.organization_slug, deleted_at: null },
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
    } ,
    orderBy: {
      created_at: "desc"
    }
   });
});



export const getAllUnassignedPerformanceReviewByOrganizationSlugAndRoleLevel = publicProcedure.input(z.object({
  organization_slug: z.string(),
  
})).query(async ({input}) => {
  return await prisma.performanceReviewTemplateAssignment.findMany({ where: { organization_id: input.organization_slug, deleted_at: null, team: null, role_level: 0 },
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
    } ,
    orderBy: {
      created_at: "desc"
    }
   });
});

export const getAllUnassignedPerformanceReviewByOrganizationSlugAndRoleLevelOnly = publicProcedure.input(z.object({
  organization_slug: z.string(),
  
})).query(async ({input}) => {
  return await prisma.performanceReviewTemplateAssignment.findMany({ where: { organization_id: input.organization_slug, deleted_at: null, team: null, role_level: {
    gt: 0
  } },
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
    } ,
    orderBy: {
      created_at: "desc"
    }
   });
});





export const getPerformanceReviewRoleLevelRangeById = publicProcedure.input(z.object({
  id: z.string(),
 
})).query(async ({ input }) => {

const previewevie = await prisma.performanceReviewTemplateAssignment.findUnique({
    where: {
      id: input.id,
    },
});

  return await prisma.performanceReviewTemplateAssignment.findUnique({
    where: {
      id: previewevie?.id,
    },
    include: {
      template: {
        select: {
          id: true,
          name: true,
          type: true,
          metrics: true,
          organization_id: true,
          created_by_id: true,
          created_at: true,
          updated_at: true,
          deleted_at: true
        },
      },
      organization: {
        include: {
          teamDesignations: {
            where: {
              designation: {
                role_level: {
                  lte: previewevie?.role_level_max || 0,
                  gte: previewevie?.role_level_min || 0,
                }
              }
            },
            include: {
               team: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  parent_team_id: true,
                  organization_id: true,
                  created_at: true,
                  updated_at: true,
                  deleted_at: true
                }
              },
              designation: true,
              staffs: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      first_name: true,
                      last_name: true,
                      active: true,
                      password: true,
                      phone_number: true,
                      created_at: true,
                      updated_at: true,
                      deleted_at: true,
                      organization_id: true,
                      fcmToken: true
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

export const getPerformanceReviewRoleLevelAndId = publicProcedure.input(z.object({
  id: z.string(),
})).query(async ({ input }) => {

  const previewevie = await prisma.performanceReviewTemplateAssignment.findUnique({
    where: {
      id: input.id,
    },
});
  return await prisma.performanceReviewTemplateAssignment.findUnique({
    where: {
      id: input.id,
    },
    include: {
      template: {
        select: {
          id: true,
          name: true,
          type: true,
          metrics: true,
          organization_id: true,
          created_by_id: true,
          created_at: true,
          updated_at: true,
          deleted_at: true
        },
      },
      organization: {
        include: {
          teamDesignations: {
            where: {
              designation: {
                role_level: previewevie?.role_level
              }
            },
            include: {
              team: {
                select: {
                  name: true
                }
              },
              designation: true,
              staffs: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      first_name: true,
                      last_name: true,
                      active: true,
                      password: true,
                      phone_number: true,
                      created_at: true,
                      updated_at: true,
                      deleted_at: true,
                      organization_id: true,
                      fcmToken: true
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