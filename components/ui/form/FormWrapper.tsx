"use client";

import * as React from "react";
import { UseFormReturn, useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { z } from "zod";

export interface FormWrapperProps<T extends z.ZodSchema> {
  schema: T;
  defaultValues: z.infer<T>;
  onSubmit: (values: z.infer<T>) => void;
  children: (form: UseFormReturn<z.infer<T>>) => React.ReactNode;
}

export function FormWrapper<T extends z.ZodSchema>({
  schema,
  defaultValues,
  onSubmit,
  children,
}: FormWrapperProps<T>) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {children(form)}
        </form>
      </Form>
    </FormProvider>
  );
}

export { FormField } from "@/components/ui/form";