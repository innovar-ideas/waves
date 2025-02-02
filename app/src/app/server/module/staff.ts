import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { createStaffSchema, externalStaffBulkUploadSchema, findByIdSchema, findByIdSchemaSchema, getAllStaffByOrganizationSlugSchema, StaffBulkUploadSchema, staffByIdSchema } from "../dtos";
import { userRoleNames } from "@/lib/constants";
import { TRPCError } from "@trpc/server";
import { updateStaffDepartmentSchema } from "@/lib/dtos";


export type StaffBultUploadType = {
  first_name: string;
  last_name: string;
  password: string;
  phone_number: string;
  email: string;
  tin: string;
  nin: string;
  bank_account_no: string;
  bank_name: string;
  passport_number: string;
  passport_expiry_date: Date;
  marital_status: string;
  date_of_birth: Date;
  profile_picture_url: string;
  documents_url: string;
  position: string;
  department: string;
  joined_at: Date;
  salary_basis: string;
  amount_per_month: number;
  effective_date: Date;
  payment_type: string;
  skill: string;
  team_designation_id: string;
  organization_id?: string;
  
};



export const createStaffBulkUpload = publicProcedure.input(StaffBulkUploadSchema).mutation(async (opts) => {
  await prisma.staffRole.upsert({
    where: {
      description: userRoleNames.employee 
    },
    create: {
      description: userRoleNames.employee 
    },
    update: {
      description: userRoleNames.employee 
    }
  });
  
  const org = await prisma.organization.findUnique({
    where: {
      id: opts.input.organization_id
    }
  });
 

  if (!org) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Organization not found"
    });
  }
  

  const staffList = opts.input.list_of_staff;
  const results = {
    successful: 0,
    failed: 0, 
    errors: [] as string[]
  };
let count = 0;
const random = Math.floor(Math.random() * 1000000);
  for (const staff of staffList) {
    try {
count++;
if(staff.phone_number === ""){
  staff.phone_number = `+234${random}`+count;
}

      const staffUser = await prisma.user.upsert({
        where: {
          email: staff.email
        },
        create: {
          email: staff.email || "",
          password: bcrypt.hashSync(staff.password || "", 10),
          phone_number: staff.phone_number || "",
          first_name: staff.first_name || "",
          last_name: staff.last_name || "",
          organization_id: org.id
        },
        update: {
          phone_number: staff.phone_number || "",
          first_name: staff.first_name || "",
          last_name: staff.last_name || "",
          organization_id: org.id,
          ...(staff.password ? {
            password: bcrypt.hashSync(staff.password, 10)
          } : {})
        }
      });
     
     await prisma.role.upsert({
        where: {
          name: userRoleNames.employee 
        },
        create: {
          name: userRoleNames.employee ,
          display_name: userRoleNames.employee 
        },
        update: {
          display_name: userRoleNames.employee 
        }
      });
     await prisma.userRole.upsert({
        where: {
          unique_user_role: {
            role_name: userRoleNames.employee ,
            user_id: staffUser.id
          }
        },
        create: {
          role_name: userRoleNames.employee ,
          user_id: staffUser.id
        },
        update: {
          role_name: userRoleNames.employee ,
          user_id: staffUser.id
        }
      });
     await prisma.staffProfile.upsert({
        where: {
          user_id: staffUser.id
        },
        create: {
          user_id: staffUser.id,
          tin: staff.tin || "",
          nin: staff.nin || "",
          bank_account_no: staff.bank_account_no || "",
          bank_name: staff.bank_name || "",
          passport_number: staff.passport_number || "",
          passport_expiry_date: staff.passport_expiry_date || new Date(),
          marital_status: staff.marital_status || "",
          date_of_birth: staff.date_of_birth || new Date(),
          profile_picture_url: staff.profile_picture_url || "",
          documents_url: staff.documents_url || "",
          position: staff.position || "",
          department: staff.department || "",
          joined_at: staff.joined_at || new Date(),
          salary_basis: staff.salary_basis || "",
          amount_per_month: staff.amount_per_month || 0,
          // effective_date: staff.effective_date || new Date(),
          payment_type: staff.payment_type || "",
          organization_id: org.id,
          
        },
        update: {
          tin: staff.tin || "",
          nin: staff.nin || "",
          bank_account_no: staff.bank_account_no || "",
          bank_name: staff.bank_name || "",
          passport_number: staff.passport_number || "",
          passport_expiry_date: staff.passport_expiry_date || new Date(),
          marital_status: staff.marital_status || "",
          date_of_birth: staff.date_of_birth || new Date(),
          profile_picture_url: staff.profile_picture_url || "",
          documents_url: staff.documents_url || "",
          position: staff.position || "",
          department: staff.department || "",
          joined_at: staff.joined_at || new Date(),
          salary_basis: staff.salary_basis || "",
          amount_per_month: staff.amount_per_month || 0,
          // effective_date: staff.effective_date || new Date(),
          payment_type: staff.payment_type || "",
          organization_id: org.id,
          
        }
      });
      results.successful++;

    } catch (error) {
      results.failed++;
      results.errors.push(`Failed to process staff with email ${staff.email || "MISSING_EMAIL"}: ${(error as Error).message}`);
      continue; // Continue with next staff member even if current one fails
    }
  }

  return {
    success: true,
    results: {
      total: staffList.length,
      ...results
    }
  };
});

export const createStaff = publicProcedure.input(createStaffSchema).mutation(async (opts) => {
  const user = await prisma.user.create({
    data: {
      email: opts.input.email ?? "",
      password: bcrypt.hashSync(opts.input.password as string, 10),
      phone_number: opts.input.phone_number ?? "",
      first_name: opts.input.first_name ?? "",
      created_at: new Date(),
      last_name: opts.input.last_name ?? "",
      organization_id: opts.input.organization_id,
      street_address: opts.input.street_address,
      city: opts.input.city,
      state: opts.input.state,
      country: opts.input.country,

    }
  });

  const staff = await prisma.staffProfile.create({
    data: {
      user_id: user.id,
      tin: opts.input.tin,
      nin: opts.input.nin,
      bank_account_no: opts.input.bank_account_no,
      bank_name: opts.input.bank_name,
      bank_id: opts.input.bank_id,
      bank_account_name: opts.input.bank_account_name,
      passport_number: opts.input.passport_number,
      passport_expiry_date: opts.input.passport_expiry_date,
      marital_status: opts.input.marital_status,
      date_of_birth: opts.input.date_of_birth,
      profile_picture_url: opts.input.profile_picture_url,
      documents_url: opts.input.documents_url,
      position: opts.input.position,
      department: opts.input.department,
      joined_at: opts.input.joined_at,
      salary_basis: opts.input.salary_basis,
      amount_per_month: opts.input.amount_per_month,
      payment_type: opts.input.payment_type,
      skill: opts.input.skill,
      organization_id: opts.input.organization_id,
      team_designation_id: opts.input.team_designation_id
    }
  });

  if(opts.input.emergency_contact_name){
    await prisma.emergencyContact.create({
      data: {
        user_id: user.id,
        name: opts.input.emergency_contact_name,
        phone: opts.input.emergency_contact_phone_number ?? "",
        city: opts.input.emergency_contact_city ?? "",
        relationship: opts.input.emergency_contact_relationship ?? "",
        street_address: opts.input.emergency_contact_address ?? "",
        state: opts.input.emergency_contact_state ?? "",
        country: opts.input.emergency_contact_country ?? "",
        created_at: new Date()
      }
    });
  }

  if(!opts.input.bank_id && opts.input.bank_name){
    const bank = await prisma.bank.create({
      data: {
        name: opts.input.bank_name as string,
        organization_id: opts.input.organization_id as string
      }
    });

    await prisma.staffProfile.update({
      where: {
        id: staff.id,
      },
      data: {
        bank_id: bank.id,
      }
    });
  }

  await prisma.userRole.create({
    data: {
      role_name: userRoleNames.employee,
      user_id: user.id
    }
  });

  return user;

});
export const getStaffProfileByUserId = publicProcedure.input(findByIdSchema).query(async (opts) => {
  return await prisma.staffProfile.findFirst({ where: { user_id: opts.input.id, deleted_at: null }, include: { user: true, work_history: true, team_designation: { include: { designation: true, team: true } } } });
});

export const getStaffByOrganizationId = publicProcedure.input(findByIdSchema).query(async (opts) => {
  return await prisma.staffProfile.findMany({ where: { organization_id: opts.input.id, deleted_at: null }, include: { user: true, work_history: true, team_designation: { include: { designation: true, team: true } } } });
});

export const getAllStaffs = publicProcedure.query(async () => {
  return await prisma.staffProfile.findMany({ where: { deleted_at: null }, include: { user: true, work_history: true, team_designation: { include: { designation: true, team: true } } } });
});

export const getAllStaffsWithoutRoles = publicProcedure.query(async () => {
  return await prisma.staffProfile.findMany({ where: { deleted_at: null, team_designation_id: null }, include: { user: true, work_history: true, team_designation: { include: { designation: true, team: true } } } });
});

export const getStaffById = publicProcedure.input(staffByIdSchema).query(async (opts) => {
  return await prisma.staffProfile.findFirst({
    where: {
      user_id: opts.input.id,
      deleted_at: null,
    },
    include: { user: {include: {emergency_contact: true}}, work_history: true, team_designation: { include: { designation: true, team: true } } }
  });
});

export const getSingleStaffById = publicProcedure.input(staffByIdSchema).query(async (opts) => {
  return await prisma.staffProfile.findFirst({
    where: {
      id: opts.input.id,
      deleted_at: null,
    },
    include: { user: true, work_history: true, team_designation: true, contracts: true }
  });
});

export const getStaffByUserId = publicProcedure.input(findByIdSchema).query(async (opts) => {
  const staff = await prisma.staffProfile.findUnique({ where: { user_id: opts.input.id as string }, include: { user: true, work_history: true,
    organization: {
      include: {
        LoanSetting: {
          select: {
            max_repayment_months: true,
            number_of_times: true
          }
        }
      }
    }
   } });

  return staff;
});

export const getStaffWithPayrollTemplate = publicProcedure
  .input(getAllStaffByOrganizationSlugSchema)
  .query(async (opts) => {
    try {
      return await prisma.staffProfile.findMany({
        where: {
          organization: { id: opts.input.slug },
          user: { deleted_at: null },
        },
        include: { user: true, payroll_template: true, payrolls: {
          orderBy: { created_at: "desc" },
        }, },
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error fetching staff by organization:", error);

      return [];
    }
  });

export const getStaffWithContractTemplate = publicProcedure
  .input(getAllStaffByOrganizationSlugSchema)
  .query(async (opts) => {
    try {
      return await prisma.staffProfile.findMany({
        where: {
          organization: { id: opts.input.slug },
          user: { deleted_at: null },
        },
        include: { user: true, contracts: { include: { template: true } } },
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error fetching staff by organization:", error);

      return [];
    }
  });

export const updateStaff = publicProcedure.input(createStaffSchema).mutation(async ({ input }) => {

  try {

    if (!input.id && !input.user_id) {
      console.error("Error: Staff and user Id not found");

      return;
    }

    await prisma.user.update({
      where: { id: input.user_id },
      data: {
        email: input.email,
        phone_number: input.phone_number,
        first_name: input.first_name,
        updated_at: new Date(),
        last_name: input.last_name,
        street_address: input.street_address,
        city: input.city,
        state: input.state,
        country: input.country,
      }
    });

    return await prisma.staffProfile.update({
      where: { id: input.id },
      data: {
        tin: input.tin,
        nin: input.nin,
        bank_account_no: input.bank_account_no,
        bank_name: input.bank_name,
        bank_id: input.bank_id,
        bank_account_name: input.bank_account_name,
        passport_number: input.passport_number,
        passport_expiry_date: new Date(input.passport_expiry_date!),
        marital_status: input.marital_status,
        date_of_birth: new Date(input.date_of_birth!),
        profile_picture_url: input.profile_picture_url,
        documents_url: input.documents_url,
        position: input.position,
        department: input.department,
        joined_at: new Date(input.joined_at!),
        salary_basis: input.salary_basis,
        amount_per_month: input.amount_per_month,
        // effective_date: input.effective_date ? new Date(input.effective_date) : undefined,
        payment_type: input.payment_type,
        team_designation_id: input.team_designation_id,
        skill: input.skill,
      },
    });
  } catch (error) {
    console.error("Error updating staff:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update staff",
      cause: error,
    });
  }
});

export const getStaffsByOrganizationId = publicProcedure.input(staffByIdSchema).query(async (opts) => {
  return await prisma.staffProfile.findMany({
    where: {
      organization_id: opts.input.id,
      deleted_at: null,
    },
    include: { user: true, work_history: true, team_designation: true, contracts: true }
  });
});





export const createExternalStaffBulkUpload = publicProcedure.input(externalStaffBulkUploadSchema).mutation(async (opts) => {
  await prisma.staffRole.upsert({
    where: {
      description: userRoleNames.employee 
    },
    create: {
      description: userRoleNames.employee 
    },
    update: {
      description: userRoleNames.employee 
    }
  });

  const org = await prisma.organization.findUnique({
    where: {
      id: opts.input.organization_id
    }
  });


  if (!org) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Organization not found"
    });
  }


  const staffList = opts.input.list_of_staff;
  const results = {
    successful: 0,
    failed: 0, 
    errors: [] as string[]
  };
let count = 0;
const random = Math.floor(Math.random() * 1000000);
  for (const staff of staffList) {
    try {
count++;
if(staff.phone_number === ""){
  staff.phone_number = `+234${random}`+count;
}

      const staffUser = await prisma.user.upsert({
        where: {
          email: staff.email
        },
        create: {
          email: staff.email || "",
          password: bcrypt.hashSync(staff.password || "", 10),
          phone_number: staff.phone_number || "",
          first_name: staff.first_name || "",
          last_name: staff.last_name || "",
          organization_id: org.id
        },
        update: {
          phone_number: staff.phone_number || "",
          first_name: staff.first_name || "",
          last_name: staff.last_name || "",
          organization_id: org.id,
          ...(staff.password ? {
            password: bcrypt.hashSync(staff.password, 10)
          } : {})
        }
      });

      await prisma.role.upsert({
        where: {
          name: userRoleNames.employee 
        },
        create: {
          name: userRoleNames.employee ,
          display_name: userRoleNames.employee 
        },
        update: {
          display_name: userRoleNames.employee 
        }
      });
   await prisma.userRole.upsert({
        where: {
          unique_user_role: {
            role_name: userRoleNames.employee ,
            user_id: staffUser.id
          }
        },
        create: {
          role_name: userRoleNames.employee,
          user_id: staffUser.id
        },
        update: {
          role_name: userRoleNames.employee ,
          user_id: staffUser.id
        }
      });
     await prisma.staffProfile.upsert({
        where: {
          user_id: staffUser.id
        },
        create: {
          user_id: staffUser.id,
          tin: staff.tin || "",
          nin: staff.nin || "",
          bank_account_no: staff.bank_account_no || "",
          bank_name: staff.bank_name || "",
          passport_number: staff.passport_number || "",
          passport_expiry_date: staff.passport_expiry_date || new Date(),
          marital_status: staff.marital_status || "",
          date_of_birth: staff.date_of_birth || new Date(),
          profile_picture_url: staff.profile_picture_url || "",
          documents_url: staff.documents_url || "",
          position: staff.position || "",
          department: staff.department || "",
          joined_at: staff.joined_at || new Date(),
          salary_basis: staff.salary_basis || "",
          amount_per_month: staff.amount_per_month || 0,
          effective_date: staff.effective_date || new Date(),
          payment_type: staff.payment_type || "",
          organization_id: org.id,

        },
        update: {
          tin: staff.tin || "",
          nin: staff.nin || "",
          bank_account_no: staff.bank_account_no || "",
          bank_name: staff.bank_name || "",
          passport_number: staff.passport_number || "",
          passport_expiry_date: staff.passport_expiry_date || new Date(),
          marital_status: staff.marital_status || "",
          date_of_birth: staff.date_of_birth || new Date(),
          profile_picture_url: staff.profile_picture_url || "",
          documents_url: staff.documents_url || "",
          position: staff.position || "",
          department: staff.department || "",
          joined_at: staff.joined_at || new Date(),
          salary_basis: staff.salary_basis || "",
          amount_per_month: staff.amount_per_month || 0,
          effective_date: staff.effective_date || new Date(),
          payment_type: staff.payment_type || "",
          organization_id: org.id,

        }
      });
      results.successful++;

    } catch (error) {
      results.failed++;
      results.errors.push(`Failed to process staff with email ${staff.email || "MISSING_EMAIL"}: ${(error as Error).message}`);
      continue; // Continue with next staff member even if current one fails
    }
  }

  return {
    success: true,
    results: {
      total: staffList.length,
      ...results
    }
  };
});

export async function POST(req: Request): Promise<Response> {
  try {
    // Validate request body against schema
    const body = await req.json() as {
      organization_id: string;
      list_of_staff: Array<{
        name: string;
        email: string;
        password: string;
        date_of_birth: Date;
      }>;
    };
    const { organization_id, list_of_staff }: { 
      organization_id: string;
      list_of_staff: Array<{
        name: string;
        email: string;
        password: string;
        date_of_birth: Date;
      }>;
    } = body;

    // Create or update "Staff" role
    await prisma.staffRole.upsert({
      where: { description: userRoleNames.employee  },
      create: { description: userRoleNames.employee  },
      update: { description: userRoleNames.employee }
    });

    // Find organization by ID
    const org = await prisma.organization.findUnique({
      where: { id: organization_id }
    });

    // If organization not found, return 404
    if (!org) {
      return new Response(
        JSON.stringify({ error: "Organization not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Process each staff member
    for (const staff of list_of_staff) {
      const [firstName, lastName = ""] = staff.name.split(" ");

      // Create or update user in the database
      const staffUser = await prisma.user.upsert({
        where: { email: staff.email },
        create: {
          email: staff.email,
          password: await bcrypt.hash(staff.password, 10),
          first_name: firstName,
          last_name: lastName,
          organization_id: org.id
        },
        update: {
          first_name: firstName,
          last_name: lastName,
          organization_id: org.id
        }
      });

      // Create or update role for the user
      await prisma.role.upsert({
        where: { name: userRoleNames.employee  },
        create: {
          name: userRoleNames.employee ,
          display_name: userRoleNames.employee 
        },
        update: {
          display_name: userRoleNames.employee 
        }
      });

      // Assign "Staff" role to the user
      await prisma.userRole.upsert({
        where: {
          unique_user_role: {
            role_name:userRoleNames.employee ,
            user_id: staffUser.id
          }
        },
        create: {
          role_name: userRoleNames.employee ,
          user_id: staffUser.id
        },
        update: {
          role_name: userRoleNames.employee ,
          user_id: staffUser.id
        }
      });

      // Create or update staff profile
      await prisma.staffProfile.upsert({
        where: { user_id: staffUser.id },
        create: {
          user_id: staffUser.id,
          date_of_birth: new Date(staff.date_of_birth),
          organization_id: org.id,
        },
        update: {
          date_of_birth: new Date(staff.date_of_birth),
          organization_id: org.id,
        }
      });
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Staff bulk upload successful"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

export const updateStaffDepartment = publicProcedure.input(updateStaffDepartmentSchema).mutation(async (opts) => {
  const { staff_id, team_id, department_id } = opts.input;
  const teamDesignation = await prisma.teamDesignation.findUnique({
    where: { 
      team_id_designation_id: {
        team_id,
        designation_id: department_id
      }
    },
  });

  if (!teamDesignation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Team designation not found"
    });
  }

  return await prisma.staffProfile.update({
    where: { id: staff_id }, data: { team_designation_id: teamDesignation.id } });
});


export const makeStaffHead = publicProcedure.input(staffByIdSchema).query(async (opts) => {
  return await prisma.staffProfile.findMany({
    where: {
      id: opts.input.id,
      is_head_of_dept: true,
      deleted_at: null,
    },
    include: { user: true, team_designation: true }
  });
});

export const makeStaffHeadOfDepartment = publicProcedure.input(findByIdSchemaSchema).mutation(async ({ input }) => {
  const { id } = input;

  const staff = await prisma.staffProfile.update({
    where: { id },
    data: { is_head_of_dept: true },
  });


  return staff;
});