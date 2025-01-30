"use client";

import { Button } from "@/components/ui/button";
import { AccountTypeEnum } from "@prisma/client";
import {  MoreHorizontal, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ChartOfAccountsPage() {

  const router = useRouter();


  return (
    <div className="container mx-auto py-6 bg-white rounded-lg shadow-md min-h-dvh">


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.values(AccountTypeEnum).map((accountType) => (
          <div 
            key={accountType} 
            className="p-4 border rounded-lg shadow-sm hover:shadow-md flex-1 transition-shadow cursor-pointer active:scale-95"
            onClick={() => router.push(`/financing/chart-of-accounts/${accountType}`)}
          >
            <div className="flex items-center justify-between ">
              <div>
                <h3 className="font-medium">{accountType.replace("_"," ")}</h3>
                
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                     <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => router.push(`/financing/chart-of-accounts/${accountType}`)}
                    className="cursor-pointer"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Accounts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}