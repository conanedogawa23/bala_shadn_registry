"use client";

import * as React from "react";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff, ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePublicRoute } from "@/lib/auth";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form/FormInput";
import { FormWrapper } from "@/components/ui/form/FormWrapper";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { themeColors } from "@/registry/new-york/theme-config/theme-config";

// Create a FormCheckbox component similar to FormInput
interface FormCheckboxProps {
  name: string;
  label: React.ReactNode;
  description?: string;
  className?: string;
}

const FormCheckbox = ({ 
  name, 
  label, 
  description, 
  className 
}: FormCheckboxProps) => {
  const { control } = useFormContext();
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row items-start space-x-3 space-y-0", className)}>
          <FormControl>
            <Checkbox 
              checked={field.value} 
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="text-sm font-medium leading-none cursor-pointer">
              {label}
            </FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

// Password Strength Meter component
interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  // Calculate password strength
  const getStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };
  
  const strength = getStrength(password);
  
  // Get description based on strength
  const getDescription = (): string => {
    if (password.length === 0) return "Enter password";
    if (strength === 0) return "Very weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    if (strength === 4) return "Strong";
    return "Very strong";
  };
  
  // Get color based on strength
  const getColor = (): string => {
    if (password.length === 0) return "bg-gray-200";
    if (strength <= 1) return "bg-red-500";
    if (strength === 2) return "bg-orange-500";
    if (strength === 3) return "bg-yellow-500";
    if (strength === 4) return "bg-green-500";
    return "bg-green-600";
  };
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
          {password && (
            <div 
              className={`h-full transition-all duration-300 ${getColor()}`} 
              style={{ width: `${(strength / 5) * 100}%` }}
            ></div>
          )}
        </div>
        <span className="ml-2 text-xs text-gray-500 min-w-[60px] text-right">
          {getDescription()}
        </span>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <div className={`text-xs ${password.length >= 8 ? "text-green-600" : "text-gray-500"}`}>
          {password.length >= 8 ? "✓" : "•"} 8+ characters
        </div>
        <div className={`text-xs ${/[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"}`}>
          {/[A-Z]/.test(password) ? "✓" : "•"} Uppercase
        </div>
        <div className={`text-xs ${/[a-z]/.test(password) ? "text-green-600" : "text-gray-500"}`}>
          {/[a-z]/.test(password) ? "✓" : "•"} Lowercase
        </div>
        <div className={`text-xs ${/[0-9]/.test(password) ? "text-green-600" : "text-gray-500"}`}>
          {/[0-9]/.test(password) ? "✓" : "•"} Number
        </div>
      </div>
    </div>
  );
};

// Create a FormSelect component
interface FormSelectProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  description?: string;
  placeholder?: string;
  className?: string;
}

const FormSelect = ({
  name,
  label,
  options,
  description,
  placeholder = "Select an option",
  className,
}: FormSelectProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <select
              {...field}
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={field.value || ""}
            >
              <option value="" disabled>
                {placeholder}
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

// Email validation checker
const isEmailAvailable = async (email: string): Promise<boolean> => {
  // This would be an API call to check if email is already registered
  // For now, we'll simulate a check against a list of "taken" emails
  const takenEmails = ["taken@example.com", "used@bodybliss.com", "registered@test.com"];
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return !takenEmails.includes(email.toLowerCase());
};

// Form schemas for each step
const personalInfoSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .refine(email => email.length > 0, { message: "Email is required" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
});

const accountInfoSchema = z.object({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const medicalInfoSchema = z.object({
  bloodType: z.string().min(1, { message: "Blood type is required" }),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  emergencyContactName: z.string().min(2, { message: "Emergency contact name is required" }),
  emergencyContactRelation: z.string().min(2, { message: "Relationship is required" }),
  emergencyContactPhone: z.string().min(10, { message: "Please enter a valid phone number" }),
});

const clinicInfoSchema = z.object({
  primaryClinic: z.string().min(1, { message: "Primary clinic is required" }),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  preferredDoctor: z.string().optional(),
  preferredAppointmentDays: z.object({
    monday: z.boolean().optional(),
    tuesday: z.boolean().optional(),
    wednesday: z.boolean().optional(),
    thursday: z.boolean().optional(),
    friday: z.boolean().optional(), 
    saturday: z.boolean().optional(),
    sunday: z.boolean().optional(),
  }).optional(),
});

const termsSchema = z.object({
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
  acceptPrivacyPolicy: z.boolean().refine(val => val === true, {
    message: "You must accept the privacy policy"
  }),
  receiveUpdates: z.boolean().optional(),
});

// Define the schema for the complete form
const registerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
  bloodType: z.string().min(1, { message: "Blood type is required" }),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  emergencyContactName: z.string().min(2, { message: "Emergency contact name is required" }),
  emergencyContactRelation: z.string().min(2, { message: "Relationship is required" }),
  emergencyContactPhone: z.string().min(10, { message: "Please enter a valid phone number" }),
  primaryClinic: z.string().min(1, { message: "Primary clinic is required" }),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  preferredDoctor: z.string().optional(),
  preferredAppointmentDays: z.object({
    monday: z.boolean().optional(),
    tuesday: z.boolean().optional(),
    wednesday: z.boolean().optional(),
    thursday: z.boolean().optional(),
    friday: z.boolean().optional(), 
    saturday: z.boolean().optional(),
    sunday: z.boolean().optional(),
  }).optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
  acceptPrivacyPolicy: z.boolean().refine(val => val === true, {
    message: "You must accept the privacy policy"
  }),
  receiveUpdates: z.boolean().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Define the type for the form values
type RegisterFormValues = z.infer<typeof registerFormSchema>;

// List of blood types for dropdown
const bloodTypeOptions = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

// List of clinic options
const clinicOptions = [
  { value: "mainStreet", label: "Body Bliss - Main Street" },
  { value: "downtown", label: "Body Bliss - Downtown" },
  { value: "westSide", label: "Body Bliss - West Side" },
  { value: "eastSide", label: "Body Bliss - East Side" },
  { value: "northCenter", label: "Body Bliss - North Center" },
];

// List of insurance providers
const insuranceOptions = [
  { value: "blueCross", label: "Blue Cross Blue Shield" },
  { value: "aetna", label: "Aetna" },
  { value: "cigna", label: "Cigna" },
  { value: "unitedHealth", label: "United Health" },
  { value: "kaiser", label: "Kaiser Permanente" },
  { value: "medicare", label: "Medicare" },
  { value: "medicaid", label: "Medicaid" },
  { value: "other", label: "Other" },
  { value: "none", label: "No Insurance" },
];

export default function RegisterPage() {
  const router = useRouter();
  usePublicRoute(); // Redirect if already authenticated
  const [currentStep, setCurrentStep] = React.useState(1);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<RegisterFormValues>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [emailChecking, setEmailChecking] = React.useState(false);
  const [emailAvailable, setEmailAvailable] = React.useState<boolean | null>(null);
  const [registrationError, setRegistrationError] = React.useState<string | null>(null);
  const [passwordInput, setPasswordInput] = React.useState("");

  // Check email availability
  const checkEmailAvailability = React.useCallback(async (email: string) => {
    if (!email || !email.includes("@")) return;
    
    setEmailChecking(true);
    try {
      const available = await isEmailAvailable(email);
      setEmailAvailable(available);
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setEmailChecking(false);
    }
  }, []);

  // Get the right form schema for each step
  const getSchemaForStep = (step: number) => {
    switch (step) {
      case 1:
        return personalInfoSchema;
      case 2:
        return accountInfoSchema;
      case 3:
        return medicalInfoSchema;
      case 4:
        return clinicInfoSchema;
      case 5:
        return termsSchema;
      default:
        return personalInfoSchema;
    }
  };

  // Handle form submission for each step
  const handleStepSubmit = async (values: Partial<RegisterFormValues>) => {
    setRegistrationError(null);
    
    // Special handling for step 1 - check email availability
    if (currentStep === 1 && values.email) {
      if (emailChecking) return; // Don't proceed if still checking
      
      if (emailAvailable === false) {
        setRegistrationError("Email address is already registered. Please use a different email or login to your account.");
        return;
      }
    }
    
    // Special handling for step 2 - store password for strength meter
    if (currentStep === 2 && values.password) {
      setPasswordInput(values.password as string);
    }
    
    // Merge the new values with the existing form data
    const updatedFormData = { ...formData, ...values };
    setFormData(updatedFormData);
    
    // If this is the final step, submit the entire form
    if (currentStep === 5) {
      handleFinalSubmit(updatedFormData as RegisterFormValues);
    } else {
      // Otherwise, move to the next step
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Handle final form submission
  const handleFinalSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    setRegistrationError(null);
    
    try {
      // Validate the complete form data against the full schema
      const validationResult = registerFormSchema.safeParse(values);
      
      if (!validationResult.success) {
        console.error("Validation failed:", validationResult.error);
        throw new Error("Validation failed. Please check your information.");
      }
      
      // Here you would send the data to your API
      console.log("Registration data:", values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate potential registration failure
      if (values.email === "fail@example.com") {
        throw new Error("Registration failed. Please try with a different email address.");
      }
      
      // Set the user as authenticated (for demo purposes)
      if (typeof window !== "undefined") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify({
          name: values.name,
          email: values.email
        }));
      }
      
      // Redirect to login page or dashboard
      router.push('/');
    } catch (error) {
      console.error("Registration error:", error);
      setRegistrationError(error instanceof Error ? error.message : "An error occurred during registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check email availability when the email input changes
  React.useEffect(() => {
    if (formData.email) {
      const timer = setTimeout(() => {
        checkEmailAvailability(formData.email as string);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [formData.email, checkEmailAvailability]);
  
  // Handle going back to the previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setRegistrationError(null);
  };
  
  // Render different form sections based on current step
  const renderFormStep = () => {
    const schema = getSchemaForStep(currentStep);
    
    // Filter form data to match the current step's schema
    const filteredDefaultValues = () => {
      switch (currentStep) {
        case 1:
          return {
            name: formData.name || "",
            email: formData.email || "",
            phone: formData.phone || "",
            dateOfBirth: formData.dateOfBirth || "",
          } as z.infer<typeof personalInfoSchema>;
        case 2:
          return {
            password: formData.password || "",
            confirmPassword: formData.confirmPassword || "",
          } as z.infer<typeof accountInfoSchema>;
        case 3:
          return {
            bloodType: formData.bloodType || "",
            allergies: formData.allergies || "",
            medicalConditions: formData.medicalConditions || "",
            medications: formData.medications || "",
            emergencyContactName: formData.emergencyContactName || "",
            emergencyContactRelation: formData.emergencyContactRelation || "",
            emergencyContactPhone: formData.emergencyContactPhone || "",
          } as z.infer<typeof medicalInfoSchema>;
        case 4:
          return {
            primaryClinic: formData.primaryClinic || "",
            insuranceProvider: formData.insuranceProvider || "",
            insurancePolicyNumber: formData.insurancePolicyNumber || "",
            preferredDoctor: formData.preferredDoctor || "",
            preferredAppointmentDays: formData.preferredAppointmentDays || {
              monday: false,
              tuesday: false,
              wednesday: false,
              thursday: false,
              friday: false,
              saturday: false,
              sunday: false,
            },
          } as z.infer<typeof clinicInfoSchema>;
        case 5:
          return {
            acceptTerms: formData.acceptTerms || false,
            acceptPrivacyPolicy: formData.acceptPrivacyPolicy || false,
            receiveUpdates: formData.receiveUpdates || false,
          } as z.infer<typeof termsSchema>;
        default:
          return {} as z.infer<typeof personalInfoSchema>;
      }
    };
    
    return (
      <FormWrapper
        schema={schema}
        onSubmit={handleStepSubmit}
        defaultValues={filteredDefaultValues()}
      >
        {() => (
          <CardContent className="space-y-4 pt-6">
            {/* Error message display */}
            {registrationError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-red-800 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{registrationError}</p>
              </div>
            )}
          
            {currentStep === 1 && (
              <>
                <FormInput
                  name="name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
                <div className="space-y-1">
                  <FormInput
                    name="email"
                    label="Email Address"
                    placeholder="Enter your email address"
                    type="email"
                    autoComplete="email"
                  />
                  {emailChecking && (
                    <div className="text-xs text-blue-600 mt-1">Checking email availability...</div>
                  )}
                  {!emailChecking && emailAvailable === true && formData.email && (
                    <div className="text-xs text-green-600 mt-1">Email is available</div>
                  )}
                  {!emailChecking && emailAvailable === false && formData.email && (
                    <div className="text-xs text-red-600 mt-1">Email is already registered</div>
                  )}
                </div>
                <FormInput
                  name="phone"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                />
                <FormInput
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  autoComplete="bday"
                />
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="submit"
                    style={{ 
                      background: themeColors.gradient.primary,
                      boxShadow: themeColors.shadow.button
                    }}
                  >
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
            
            {currentStep === 2 && (
              <>
                <div className="space-y-4">
                  <div className="relative space-y-1">
                    <FormInput
                      name="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      autoComplete="new-password"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute top-8 right-3 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <PasswordStrengthMeter password={passwordInput} />
                  </div>
                  
                  <div className="relative">
                    <FormInput
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute top-8 right-3 text-gray-400"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePrevStep}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                  </Button>
                  <Button 
                    type="submit"
                    style={{ 
                      background: themeColors.gradient.primary,
                      boxShadow: themeColors.shadow.button
                    }}
                  >
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
            
            {currentStep === 3 && (
              <>
                <FormSelect
                  name="bloodType"
                  label="Blood Type"
                  options={bloodTypeOptions}
                  placeholder="Select your blood type"
                />
                
                <FormInput
                  name="allergies"
                  label="Allergies"
                  placeholder="Enter any allergies (if none, type 'None')"
                  multiline
                />
                
                <FormInput
                  name="medicalConditions"
                  label="Medical Conditions"
                  placeholder="Enter any medical conditions (if none, type 'None')"
                  multiline
                />
                
                <FormInput
                  name="medications"
                  label="Current Medications"
                  placeholder="Enter current medications (if none, type 'None')"
                  multiline
                />
                
                <div className="space-y-4 pt-4">
                  <h4 className="font-medium">Emergency Contact</h4>
                  <FormInput
                    name="emergencyContactName"
                    label="Name"
                    placeholder="Emergency contact name"
                  />
                  <FormInput
                    name="emergencyContactRelation"
                    label="Relationship"
                    placeholder="Relation to you"
                  />
                  <FormInput
                    name="emergencyContactPhone"
                    label="Phone Number"
                    placeholder="Emergency contact phone"
                    autoComplete="tel"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePrevStep}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                  </Button>
                  <Button 
                    type="submit"
                    style={{ 
                      background: themeColors.gradient.primary,
                      boxShadow: themeColors.shadow.button
                    }}
                  >
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
            
            {currentStep === 4 && (
              <>
                <FormSelect
                  name="primaryClinic"
                  label="Primary Clinic"
                  options={clinicOptions}
                  placeholder="Select your primary clinic"
                />
                
                <FormSelect
                  name="insuranceProvider"
                  label="Insurance Provider (Optional)"
                  options={insuranceOptions}
                  placeholder="Select your insurance provider"
                />
                
                <FormInput
                  name="insurancePolicyNumber"
                  label="Insurance Policy Number (Optional)"
                  placeholder="Enter your policy number"
                />
                
                <FormInput
                  name="preferredDoctor"
                  label="Preferred Doctor (Optional)"
                  placeholder="Enter preferred doctor's name"
                />
                
                <div className="space-y-2 pt-2">
                  <h4 className="font-medium mb-2">Preferred Appointment Days</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormCheckbox 
                      name="preferredAppointmentDays.monday" 
                      label="Monday" 
                    />
                    <FormCheckbox 
                      name="preferredAppointmentDays.tuesday" 
                      label="Tuesday" 
                    />
                    <FormCheckbox 
                      name="preferredAppointmentDays.wednesday" 
                      label="Wednesday" 
                    />
                    <FormCheckbox 
                      name="preferredAppointmentDays.thursday" 
                      label="Thursday" 
                    />
                    <FormCheckbox 
                      name="preferredAppointmentDays.friday" 
                      label="Friday" 
                    />
                    <FormCheckbox 
                      name="preferredAppointmentDays.saturday" 
                      label="Saturday" 
                    />
                    <FormCheckbox 
                      name="preferredAppointmentDays.sunday" 
                      label="Sunday" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePrevStep}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                  </Button>
                  <Button 
                    type="submit"
                    style={{ 
                      background: themeColors.gradient.primary,
                      boxShadow: themeColors.shadow.button
                    }}
                  >
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
            
            {currentStep === 5 && (
              <>
                <div className="space-y-4">
                  <FormCheckbox
                    name="acceptTerms"
                    label={
                      <span>
                        I agree to the{" "}
                        <Link 
                          href="/terms" 
                          className="font-medium hover:underline"
                          style={{ color: themeColors.primary }}
                          target="_blank"
                        >
                          Terms of Service
                        </Link>
                      </span>
                    }
                  />
                  
                  <FormCheckbox
                    name="acceptPrivacyPolicy"
                    label={
                      <span>
                        I agree to the{" "}
                        <Link 
                          href="/privacy" 
                          className="font-medium hover:underline"
                          style={{ color: themeColors.primary }}
                          target="_blank"
                        >
                          Privacy Policy
                        </Link>
                      </span>
                    }
                  />
                  
                  <FormCheckbox
                    name="receiveUpdates"
                    label="I would like to receive updates about services and promotions"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePrevStep}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    style={{ 
                      background: themeColors.gradient.primary,
                      boxShadow: themeColors.shadow.button
                    }}
                  >
                    {isSubmitting ? "Registering..." : "Complete Registration"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        )}
      </FormWrapper>
    );
  };
  
  // Render progress steps
  const renderProgress = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div 
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    step === currentStep 
                      ? "bg-gradient-to-r from-[#6666FF] to-[#5151CC] text-white"
                      : step < currentStep
                        ? "bg-[#6666FF]/20 text-[#6666FF]"
                        : "bg-gray-200 text-gray-400"
                  }`}
                  style={step === currentStep ? { background: themeColors.gradient.primary } : {}}
                >
                  {step < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                <span className="text-xs mt-1 text-gray-500">
                  {step === 1 && "Personal"}
                  {step === 2 && "Account"}
                  {step === 3 && "Medical"}
                  {step === 4 && "Clinic"}
                  {step === 5 && "Terms"}
                </span>
              </div>
              
              {step < 5 && (
                <div 
                  className={`flex-1 h-1 mx-2 ${
                    step < currentStep ? "bg-[#6666FF]" : "bg-gray-200"
                  }`}
                  style={step < currentStep ? { background: themeColors.primary } : {}}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel with background and info */}
      <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#6666FF] to-[#5151CC] flex-col justify-center items-center p-8 text-white">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">Join Body Bliss Visio</h1>
          <p className="text-xl mb-8">
            Create your account to start your wellness journey with us. Your health and wellbeing are our priority.
          </p>
          
          <div className="space-y-6 mb-12">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Trusted Service</h3>
                <p className="text-sm text-white/80">We&apos;ve helped thousands improve their health</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Personalized Care</h3>
                <p className="text-sm text-white/80">Tailored wellness plans for your needs</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Easy Scheduling</h3>
                <p className="text-sm text-white/80">Book appointments with just a few clicks</p>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/20">
            <p className="text-sm">Already have an account? <Link href="/login" className="font-medium underline">Sign in</Link></p>
          </div>
        </div>
      </div>
      
      {/* Right panel with form */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 bg-white md:bg-gray-50 overflow-auto">
        <div className="w-full max-w-2xl mx-auto">
          {/* Logo and heading for mobile */}
          <div className="md:hidden flex flex-col items-center mb-6">
            <div className="h-14 w-14 rounded-xl mb-4" style={{ background: themeColors.gradient.primary }}>
              <div className="h-full w-full flex items-center justify-center text-white font-bold text-2xl">
                BB
              </div>
            </div>
            <h2 className="text-center text-2xl font-bold" style={{ color: themeColors.primary }}>
              Body Bliss Visio
            </h2>
            <p className="mt-1 text-center text-sm text-gray-600">
              Create your health and wellness account
            </p>
          </div>
          
          {/* Step indicators for desktop */}
          <div className="hidden md:block mb-6">
            <h2 className="text-3xl font-bold mb-2" style={{ color: themeColors.primary }}>
              Create your account
            </h2>
            <p className="text-gray-600">
              Step {currentStep} of 5: {
                currentStep === 1 ? "Personal Information" :
                currentStep === 2 ? "Account Security" :
                currentStep === 3 ? "Medical Details" :
                currentStep === 4 ? "Clinic Preferences" :
                "Terms & Conditions"
              }
            </p>
          </div>
          
          {renderProgress()}
          
          <Card className="shadow-lg border-0 bg-white" style={{ boxShadow: themeColors.shadow.large }}>
            <CardContent className="p-0">
              {renderFormStep()}
            </CardContent>
          </Card>
          
          {/* Mobile-only back to login */}
          <div className="md:hidden mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:underline" style={{ color: themeColors.primary }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

