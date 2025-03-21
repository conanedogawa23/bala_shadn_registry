"use client";

import * as React from "react";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormWrapper } from "@/components/ui/form/FormWrapper";
import { FormInput } from "@/components/ui/form/FormInput";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";

/**
 * Forgot password validation schema using Zod
 * Defines validation rules for the email field
 */
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .min(5, { message: "Email must be at least 5 characters" })
    .max(100, { message: "Email cannot exceed 100 characters" }),
});

/**
 * Type definition for forgot password form data
 */
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/**
 * ForgotPassword Page Component
 * 
 * Provides a form for users to request a password reset by entering their email
 */
export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);
  
  /**
   * Handle form submission for password reset request
   */
  const handleSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Here you would typically call your password reset API
      console.log("Password reset requested for:", data.email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setEmailSent(true);
    } catch (error) {
      console.error("Error requesting password reset:", error);
      alert("Failed to send password reset link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel with background image for larger screens */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#6666FF] to-[#5151CC] flex-col justify-center items-center p-8 text-white">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">Reset your password</h1>
          <p className="text-xl mb-8">
            We&apos;ll help you get back to your wellness journey in no time.
          </p>
          <div className="flex items-center space-x-4 mb-12">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Secure</h3>
              <p className="text-sm text-white/80">Your data is always protected</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Quick</h3>
              <p className="text-sm text-white/80">Reset your password in minutes</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right panel with form */}
      <div className="flex-1 flex flex-col justify-center p-4 sm:p-6 md:p-12 bg-white md:bg-gray-50">
        <div className="w-full max-w-md mx-auto">
          {/* Logo and mobile heading */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-14 w-14 rounded-xl mb-6" style={{ background: themeColors.gradient.primary }}>
              <div className="h-full w-full flex items-center justify-center text-white font-bold text-2xl">
                BB
              </div>
            </div>
            <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight" style={{ color: themeColors.primary }}>
              Body Bliss Visio
            </h2>
            <div className="md:hidden mt-2 text-center text-lg font-medium text-gray-700">
              Reset your password
            </div>
          </div>
          
          {emailSent ? (
            <Card className="shadow-xl border-0 bg-white">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Check your email</h3>
                  <p className="text-gray-600 mb-6">
                    We&apos;ve sent a password reset link to your email address.
                    Please check your inbox and follow the instructions.
                  </p>
                  <Button 
                    onClick={() => setEmailSent(false)}
                    className="w-full mb-4"
                    style={{ 
                      background: themeColors.gradient.primary,
                      boxShadow: themeColors.shadow.button 
                    }}
                  >
                    Try Again
                  </Button>
                  <Link 
                    href="/login" 
                    className="text-sm font-medium hover:underline"
                    style={{ color: themeColors.primary }}
                  >
                    Back to login
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-xl font-bold text-center">Forgot Password</CardTitle>
                  <CardDescription className="text-center">
                    Enter your email address and we&apos;ll send you a link to reset your password
                  </CardDescription>
                </CardHeader>
                
                <FormWrapper<typeof forgotPasswordSchema>
                  schema={forgotPasswordSchema}
                  onSubmit={handleSubmit}
                  defaultValues={{
                    email: "",
                  }}
                >
                  {() => (
                    <>
                      <CardContent className="space-y-4 pt-2">
                        <FormInput
                          name="email"
                          label="Email Address"
                          placeholder="Enter your email address"
                          type="email"
                          autoComplete="email"
                          aria-label="Your email address"
                          disabled={isSubmitting}
                        />
                        
                        <div className="pt-2">
                          <Button 
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                            aria-label="Request password reset"
                            style={{ 
                              background: themeColors.gradient.primary,
                              boxShadow: themeColors.shadow.button 
                            }}
                          >
                            {isSubmitting ? (
                              <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                              </div>
                            ) : "Send Reset Link"}
                          </Button>
                        </div>
                      </CardContent>
                    </>
                  )}
                </FormWrapper>
                
                <CardFooter className="flex flex-col space-y-4 pt-2 pb-6 px-6">
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                  </div>
                  
                  <Link 
                    href="/login" 
                    className="w-full"
                  >
                    <Button 
                      type="button"
                      className="w-full"
                      variant="outline"
                    >
                      Back to login
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <div className="mt-8 text-center text-sm text-gray-500">
                <span>Don&apos;t have an account?</span>{" "}
                <Link 
                  href="/register" 
                  className="font-medium hover:underline"
                  style={{ color: themeColors.primary }}
                >
                  Register now
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

