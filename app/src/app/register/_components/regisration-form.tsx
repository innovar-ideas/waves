"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { registrationSchema } from "@/lib/dtos";
import { register } from "@/actions/users";
import { useRouter } from "next/navigation";
import { ERROR_MESSAGES, pageRoleMapping } from "@/lib/constants";
import { getSession } from "next-auth/react";
import Link from "next/link";

export default function RegistrationForm() {
  const router = useRouter();
  const { isPending, mutate } = useMutation({
    mutationFn: register,
    onSuccess: async (res) => {
      if (res?.error || res?.errors) {
        console.error(res.error, res.errors);
        return;
      }
      const session = await getSession();
      if (!session) {
        throw new Error(ERROR_MESSAGES.UKNOWN_ERROR);
      }
      router.push(pageRoleMapping["default"][0].pathname);
    },
  });

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      emailAddress: "",
      password: "",
    },
  });

  return (
    <Card className='w-full max-w-xs'>
      <CardHeader>
        <CardTitle className='text-2xl'>Sign Up</CardTitle>
        <CardDescription>Create your account</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (values) => mutate(values),
            (error) => console.error(error)
          )}
        >
          <fieldset disabled={isPending}>
            <CardContent className='grid gap-4'>
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem className='grid gap-2'>
                    <Label htmlFor={field.name}>First Name</Label>
                    <div className='grid gap-1'>
                      <Input {...field} autoComplete='email' />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem className='grid gap-2'>
                    <Label htmlFor={field.name}>Last Name</Label>
                    <div className='grid gap-1'>
                      <Input {...field} autoComplete='email' />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem className='grid gap-2'>
                    <Label htmlFor={field.name}>Phone Number</Label>
                    <div className='grid gap-1'>
                      <Input {...field} autoComplete='email' />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='emailAddress'
                render={({ field }) => (
                  <FormItem className='grid gap-2'>
                    <Label htmlFor={field.name}>Email Address</Label>
                    <div className='grid gap-1'>
                      <Input {...field} autoComplete='email' />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid gap-2'>
                    <Label htmlFor={field.name}>Password</Label>
                    <div className='grid gap-1'>
                      <Input {...field} type='password' autoComplete='current-password' />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className='flex-col justify-between gap-3'>
              <Button className='w-full' size={"lg"}>
                Register
              </Button>
              <div className='flex w-full items-center justify-center gap-3'>
                <hr className='flex-1 bg-gray-400' />
                <div className='text-xs tracking-tighter text-gray-500'>Already have an account?</div>
                <hr className='flex-1 bg-gray-400' />
              </div>
              <Link href='/' className='block w-full'>
                <Button variant='outline' type='button' className='w-full' size={"lg"}>
                  Login
                </Button>
              </Link>
            </CardFooter>
          </fieldset>
        </form>
      </Form>
    </Card>
  );
}
