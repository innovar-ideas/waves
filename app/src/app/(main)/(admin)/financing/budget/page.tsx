"use client";

import { Button } from "@/components/ui/button";


import { useState } from "react";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import BudgetPage from "./_components/budget-page";
import { CreateBudget } from "./_components/create-budget";
import BudgetLogPage from "./_components/budget-log-page";

enum ViewType {
  Default = "default",
  CreateBudget = "createBudget",
  LoginSpending = "loginSpending",
}

export default function MainBudgetPage() {
  const { organizationSlug } = useActiveOrganizationStore();
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.Default);


  return (
   <div className='mx-auto min-h-screen w-full space-y-6 rounded-lg bg-white p-6 shadow-lg'>
            <div className="flex flex-col justify-end space-y-2 md:flex-row md:space-y-0 md:space-x-4">
          <Button className={`w-fit ${currentView === ViewType.Default ? "" : "bg-emerald-500 hover:bg-emerald-600"}`}
            variant={currentView === ViewType.Default ? "outline" : "default"}  onClick={() => setCurrentView(ViewType.Default)}>
            View Budgets
          </Button>
          <Button className={`w-fit ${currentView === ViewType.CreateBudget ? "" : "bg-emerald-500 hover:bg-emerald-600"}`}
            variant={currentView === ViewType.CreateBudget ? "outline" : "default"}  onClick={() => setCurrentView(ViewType.CreateBudget)} >
            Create New Budget
          </Button>
          <Button className={`w-fit ${currentView === ViewType.LoginSpending ? "" : "bg-emerald-500 hover:bg-emerald-600"}`}
            variant={currentView === ViewType.LoginSpending ? "outline" : "default"}  onClick={() => setCurrentView(ViewType.LoginSpending)}>
            Login Spending
          </Button>
        </div>
 {(() => {
        switch (currentView) {
          case ViewType.Default:
            return <BudgetPage />;
          case ViewType.CreateBudget:
            return  <CreateBudget organizationSlug={organizationSlug} onSuccess={() => setCurrentView(ViewType.Default)}/>;
          case ViewType.LoginSpending:
            return <BudgetLogPage organizationSlug={organizationSlug} />;
          default:
            return null;
        }
      })()}
    </div>
  );
}
