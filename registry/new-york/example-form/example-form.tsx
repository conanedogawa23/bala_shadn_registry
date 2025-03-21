"use client"

import * as React from "react"
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { z } from "zod"

import { FormWrapper } from "@/components/ui/form/FormWrapper"
import { FormInput } from "@/components/ui/form/FormInput"
import { FormSelect } from "@/components/ui/form/FormSelect"
import { FormDatePicker } from "@/components/ui/form/FormDatePicker"
import { CustomerSchema } from "@/schemas/customer"

const exampleFormSchema = z.object({
  fullName: CustomerSchema.shape.fullName,
  email: CustomerSchema.shape.email,
  message: z.string().min(1, { message: "Message is required" }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority level",
  }),
  requestDate: z.date({
    required_error: "Please select a date",
  }),
})

type ExampleFormValues = z.infer<typeof exampleFormSchema>

export function ExampleForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)

  const handleSubmit = React.useCallback((data: ExampleFormValues) => {
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", data)
      setIsSubmitting(false)
      setShowSuccess(true)
      
      // Reset success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)
    }, 1000)
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>How can we help?</CardTitle>
        <CardDescription>
          Need help with your project? We&apos;re here to assist you.
        </CardDescription>
      </CardHeader>
      <FormWrapper<typeof exampleFormSchema>
        schema={exampleFormSchema}
        onSubmit={handleSubmit}
        defaultValues={{
          fullName: "",
          email: "",
          message: "",
          priority: "medium",
          requestDate: new Date(),
        }}
      >
        {(form) => (
          <>
            <CardContent className="space-y-4">
              <FormInput
                name="fullName"
                label="Full Name"
                placeholder="John Doe"
                description="Your complete name"
              />
              <FormInput
                name="email"
                label="Email"
                type="email"
                placeholder="john@example.com"
                description="We'll never share your email with anyone else"
              />
              <FormSelect
                name="priority"
                label="Priority"
                placeholder="Select priority level"
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
                description="How urgently do you need a response?"
              />
              <FormDatePicker
                name="requestDate"
                label="Request Date"
                description="When would you like us to start?"
                disablePastDates
                minDate={new Date()}
              />
              <FormInput
                name="message"
                label="Message"
                multiline
                placeholder="Describe how we can help you..."
                description="Please provide details about your request"
                className="min-h-24"
              />
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </CardFooter>
            {showSuccess && (
              <div className="px-6 pb-4 pt-0">
                <p className="text-sm text-green-600 font-medium">
                  Your message has been sent successfully!
                </p>
              </div>
            )}
          </>
        )}
      </FormWrapper>
    </Card>
  )
}