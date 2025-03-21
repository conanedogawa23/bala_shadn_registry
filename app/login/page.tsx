"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

// Login form schema
const loginFormSchema = z.object({
  identifier: z.string().min(1, {
    message: "Email or username is required.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Initialize form with default values
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: false,
    },
  });

  // Handle form submission
  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    
    try {
      // This would normally call an authentication API
      console.log(values);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Navigate to dashboard after successful login
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#6666FF] p-4 relative">
      {/* Background decorative elements for depth */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-indigo-300 opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-indigo-400 opacity-10 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-60 h-60 rounded-full bg-indigo-200 opacity-5 blur-3xl"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-300 opacity-10 blur-xl"></div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[#6666FF] bg-opacity-30 mix-blend-overlay" 
             style={{
               backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 25%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 35%)'
             }}>
        </div>
      </div>
      
      <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] bg-white backdrop-blur-sm relative z-10">
        {/* Left side - Visual branding element */}
        <div className="w-full md:w-1/2 relative h-64 md:h-auto overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-indigo-700 z-0"></div>
          <div 
            className="absolute inset-0 z-0 opacity-30"
            style={{
              backgroundImage: "url('/images/clinic/clinic-pattern.svg')",
              backgroundSize: '200px',
              filter: 'blur(1px)'
            }}
          ></div>
          
          <div className="absolute inset-0 flex flex-col justify-between p-10 z-10 text-white">
            <div>
              <div className="flex items-center gap-3 mb-12">
                <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                  <Image 
                    src="/images/clinic/health-icon.svg" 
                    alt="Body Bliss Visio" 
                    width={30} 
                    height={30} 
                    className="h-6 w-6"
                  />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#ffffff]">Body Bliss Visio</h1>
              </div>
              
              <h2 className="text-4xl font-bold mb-6 text-[#ffffff]">
                Welcome <span className="text-[#ffffff]">back</span>
              </h2>
              
              <p className="text-lg text-[#ffffff] max-w-xs leading-relaxed">
                Your journey to wellness continues. Sign in to access your personalized health experience.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-[#ffffff]">Secure & Private</h3>
                  <p className="text-sm text-[#ffffff]">End-to-end encryption for your data</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-[#ffffff]">Always Available</h3>
                  <p className="text-sm text-[#ffffff]">Access your account 24/7, anywhere</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-blue-600 opacity-20 blur-2xl"></div>
          <div className="absolute top-20 -right-20 h-40 w-40 rounded-full bg-indigo-500 opacity-20 blur-xl"></div>
          <div className="absolute bottom-40 right-10 h-20 w-20 rounded-full bg-blue-400 opacity-20 blur-lg"></div>
        </div>
        
        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-white to-blue-50">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h2>
              <p className="text-gray-600">
                Enter your details to access your Body Bliss account
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="you@example.com" 
                            className="pl-10 h-12 rounded-xl border-gray-200 focus-visible:ring-blue-600 shadow-sm" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                        <Link 
                          href="/forgot-password" 
                          className="text-sm text-blue-700 hover:text-blue-800 font-medium"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            className="pl-10 h-12 rounded-xl border-gray-200 focus-visible:ring-blue-600 shadow-sm" 
                            {...field} 
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-700"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          className="text-blue-700 border-gray-300 rounded data-[state=checked]:bg-blue-700 data-[state=checked]:border-blue-700"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer text-gray-600">
                        Keep me signed in
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-blue-700 hover:bg-blue-800 text-white transition-all duration-200 font-medium shadow-lg shadow-blue-700/20"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Sign in
                    </span>
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-8">
              <Separator className="mb-6" />
              
              <p className="text-center text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-blue-700 hover:text-blue-800 font-medium">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

