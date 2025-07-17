"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Mail, Phone, MapPin, Calendar, Save, X, User, Briefcase, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// Profile form schema
const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(5, {
    message: "Please enter a valid phone number.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  bio: z.string().max(500, {
    message: "Bio cannot exceed 500 characters.",
  }).optional(),
  dateOfBirth: z.string().optional(),
  emergencyContact: z.string().optional(),
  occupation: z.string().optional(),

});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserInfoProps {
  userData: ProfileFormValues;
  isEditMode: boolean;
  onSave: (values: ProfileFormValues) => void;
  onCancel: () => void;
}

export function UserInfo({ userData, isEditMode, onSave, onCancel }: UserInfoProps) {
  // Initialize form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: userData,
  });

  // Handle form submission
  function onSubmit(values: ProfileFormValues) {
    onSave(values);
  }

  // Personal info icons with labels and values
  const personalInfo = [
    { icon: Mail, label: "Email", value: userData.email },
    { icon: Phone, label: "Phone", value: userData.phone },
    { icon: MapPin, label: "Address", value: userData.address },
    { icon: Calendar, label: "Date of Birth", value: userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}) : undefined },
    { icon: Phone, label: "Emergency Contact", value: userData.emergencyContact },
    { icon: Briefcase, label: "Occupation", value: userData.occupation },
    { icon: Clock, label: "Member Since", value: "January 2023" },
  ];

  return isEditMode ? (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="emergencyContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>
                  Format: Name (Relationship) - Phone Number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occupation</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          

          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    value={field.value || ''} 
                    className="min-h-[100px] resize-none"
                  />
                </FormControl>
                <FormDescription>
                  Brief description about yourself (max 500 chars).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </form>
    </Form>
  ) : (
    <div className="space-y-6">
      {/* Basic information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
        {personalInfo.map((item, index) => item.value && (
          <div key={index} className="flex items-start gap-3">
            <div className="mt-0.5">
              <item.icon className="h-5 w-5 text-[#6666FF]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="font-medium">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Bio section */}
      {userData.bio && (
        <>
          <Separator />
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-[#6666FF]" />
              About
            </h3>
            <p className="text-gray-700">{userData.bio}</p>
          </div>
        </>
      )}
      

    </div>
  );
} 