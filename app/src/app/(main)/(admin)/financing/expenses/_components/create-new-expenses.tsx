import { Form, FormControl, FormLabel, FormItem, FormField, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "@/app/_providers/trpc-provider";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { AccountFormValues, accountSchema } from "@/app/server/dtos";

interface NewExpenseAccountFormProps {
  handleCreate: () => void;
}

export default function NewExpenseAccountForm({ handleCreate }: NewExpenseAccountFormProps) {
  const { toast } = useToast();
  const { organizationSlug } = useActiveOrganizationStore();


  const defaultValues: Partial<AccountFormValues> = {
    account_name: "",
    organization_slug: organizationSlug || "",
    account_type_enum: "EXPENSE",
  };

  const utils = trpc.useUtils();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues,
    mode: "onChange",
  });

  const createExpensesAccount = trpc.createExpenses.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Expense Account created successfully.",
      });
      form.reset();

      utils.getAllExpensesAccounts.invalidate().then(() => {
        handleCreate();
      });
    },
    onError: (error) => {
      console.error(error);

      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "An unexpected error occurred",
      });
    },
  });

  const onSubmit = (values: AccountFormValues) => {
    createExpensesAccount.mutate(values);
  };

  return (
    <div className='mx-auto w-full space-y-6 rounded-lg bg-white p-6 shadow-lg'>
      <h4 className='font-bold'>New Expense Account</h4>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (error) => console.error(error))}>
          <fieldset>
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='account_name'
                render={({ field }) => (
                  <FormItem className='col-span-2 grid space-y-3'>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input data-cy='fee-name' placeholder='e.g. salaries' id='account_name' {...field} required />
                    </FormControl>
                    <FormMessage className='text-xs font-normal' />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex justify-between py-5'>
              <Button
                data-cy='close-template-button'
                disabled={form.formState.isSubmitting}
                className='border border-white bg-primaryTheme-600 px-5 outline-2 hover:bg-primaryTheme-600 active:outline'
                type='button'
                onClick={() => handleCreate()}
              >
                Close
              </Button>

              <Button
                data-cy='submit-button'
                key='submit-button'
                disabled={form.formState.isSubmitting}
                className='border border-white bg-primaryTheme-600 px-5 outline-2 hover:bg-primaryTheme-600 active:outline'
                type='submit'
              >
                Save
              </Button>
            </div>
          </fieldset>
        </form>
      </Form>
    </div>
  );
}
