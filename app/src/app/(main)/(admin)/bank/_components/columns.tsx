import { Bank, Organization } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

  
  export const columns: ColumnDef<Bank & {organization: Organization}>[] = [
    {
      accessorKey: "name",
      header: "Name",

    },
    {
      accessorKey: "sort_code",
      header: "Sort Code",
      cell: ({row}) => {
        return (
          <p className="text-black">{row.original.sort_code}</p>
        );
      }
    },
    {
      accessorKey: "organization",
      header: "Organization",
      cell: ({row}) => {
        const org = row.original.organization;
        return (
          <p className="text-black">{org.name}</p>
        );
      }
    }


  ];