"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useClinic } from "@/lib/contexts/clinic-context";
import { getBackendClinicName } from "@/lib/route-utils";
import { CreateUserRequest, UpdateUserRequest, User, UserPermissions } from "@/lib/api/userApiService";

type PermissionKey = Exclude<keyof UserPermissions, "allowedClinics">;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSave: (userData: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  mode: "create" | "edit";
}

interface UserDialogFormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  status: string;
  permissions: UserPermissions;
}

const ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
  { label: "Staff", value: "staff" },
  { label: "Practitioner", value: "practitioner" },
  { label: "Client", value: "client" }
] as const;

const PERMISSION_SECTIONS: Array<{
  title: string;
  permissions: Array<{
    description: string;
    key: PermissionKey;
    label: string;
  }>;
}> = [
  {
    title: "Administration",
    permissions: [
      {
        key: "canManageUsers",
        label: "Manage users",
        description: "Create, update, suspend, unlock, and delete users."
      },
      {
        key: "canManageClinic",
        label: "Manage clinic settings",
        description: "Update clinic setup, resources, and administrative data."
      },
      {
        key: "canViewReports",
        label: "View reports",
        description: "Open and export operational and financial reports."
      }
    ]
  },
  {
    title: "Operations",
    permissions: [
      {
        key: "canManageAppointments",
        label: "Manage appointments",
        description: "Create and update appointments."
      },
      {
        key: "canManageOrders",
        label: "Manage orders",
        description: "Create and update clinic orders."
      },
      {
        key: "canManagePayments",
        label: "Manage payments overview",
        description: "High-level payments access flag for internal tooling."
      }
    ]
  },
  {
    title: "Payments",
    permissions: [
      {
        key: "canViewPayments",
        label: "View payments",
        description: "See payment history and payment screens."
      },
      {
        key: "canCreatePayments",
        label: "Create payments",
        description: "Record new payments and payment batches."
      },
      {
        key: "canEditPayments",
        label: "Edit payments",
        description: "Adjust saved payments and related billing data."
      },
      {
        key: "canDeletePayments",
        label: "Delete payments",
        description: "Remove saved payment entries."
      },
      {
        key: "canProcessRefunds",
        label: "Process refunds",
        description: "Issue or approve payment refunds."
      }
    ]
  }
];

const getDefaultPermissions = (role: string): UserPermissions => {
  const basePermissions: UserPermissions = {
    canManageUsers: false,
    canManageClinic: false,
    canViewReports: false,
    canManageAppointments: false,
    canManageOrders: false,
    canManagePayments: false,
    canViewPayments: false,
    canCreatePayments: false,
    canEditPayments: false,
    canDeletePayments: false,
    canProcessRefunds: false,
    canAccessAllClinics: false,
    allowedClinics: []
  };

  switch (role) {
    case "admin":
      return {
        ...basePermissions,
        canManageUsers: true,
        canManageClinic: true,
        canViewReports: true,
        canManageAppointments: true,
        canManageOrders: true,
        canManagePayments: true,
        canViewPayments: true,
        canCreatePayments: true,
        canEditPayments: true,
        canDeletePayments: true,
        canProcessRefunds: true,
        canAccessAllClinics: true
      };
    case "manager":
      return {
        ...basePermissions,
        canManageClinic: true,
        canViewReports: true,
        canManageAppointments: true,
        canManageOrders: true,
        canManagePayments: true,
        canViewPayments: true,
        canCreatePayments: true,
        canEditPayments: true,
        canProcessRefunds: true,
        canAccessAllClinics: true
      };
    case "practitioner":
      return {
        ...basePermissions,
        canViewReports: true,
        canManageAppointments: true,
        canManageOrders: true,
        canViewPayments: true,
        canCreatePayments: true
      };
    case "staff":
      return {
        ...basePermissions,
        canManageAppointments: true,
        canManageOrders: true,
        canViewPayments: true
      };
    default:
      return basePermissions;
  }
};

const createEmptyFormState = (): UserDialogFormState => ({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  phone: "",
  role: "staff",
  status: "active",
  permissions: getDefaultPermissions("staff")
});

export function UserDialog({ open, onOpenChange, user, onSave, mode }: UserDialogProps) {
  const { availableClinics, loading: clinicsLoading } = useClinic();
  const [formData, setFormData] = useState<UserDialogFormState>(createEmptyFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clinicOptions = useMemo(() => {
    return availableClinics
      .map((clinic) => ({
        label: clinic.displayName || clinic.name,
        value: getBackendClinicName(clinic, clinic.name)
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [availableClinics]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === "edit" && user) {
      const mergedPermissions: UserPermissions = {
        ...getDefaultPermissions(user.role || "staff"),
        ...user.permissions,
        allowedClinics: user.permissions?.allowedClinics || []
      };

      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        phone: user.profile?.phone || "",
        role: user.role || "staff",
        status: user.status || "active",
        permissions: mergedPermissions
      });
    } else {
      setFormData(createEmptyFormState());
    }

    setErrors({});
  }, [mode, open, user]);

  const updatePermissions = (updater: (currentPermissions: UserPermissions) => UserPermissions) => {
    setFormData((current) => ({
      ...current,
      permissions: updater(current.permissions)
    }));
  };

  const handleRoleChange = (role: string) => {
    setFormData((current) => {
      const defaultPermissions = getDefaultPermissions(role);
      const preservedClinics = current.permissions.allowedClinics;

      return {
        ...current,
        role,
        permissions: {
          ...defaultPermissions,
          allowedClinics: defaultPermissions.canAccessAllClinics ? [] : preservedClinics
        }
      };
    });
  };

  const handlePermissionToggle = (permission: PermissionKey, checked: boolean) => {
    updatePermissions((currentPermissions) => {
      const nextPermissions: UserPermissions = {
        ...currentPermissions,
        [permission]: checked
      };

      if (permission === "canAccessAllClinics" && checked) {
        nextPermissions.allowedClinics = [];
      }

      return nextPermissions;
    });
  };

  const handleClinicToggle = (clinicName: string, checked: boolean) => {
    updatePermissions((currentPermissions) => {
      const selectedClinics = checked
        ? Array.from(new Set([...currentPermissions.allowedClinics, clinicName]))
        : currentPermissions.allowedClinics.filter((clinic) => clinic !== clinicName);

      return {
        ...currentPermissions,
        canAccessAllClinics: false,
        allowedClinics: selectedClinics
      };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (mode === "create") {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.permissions.canAccessAllClinics && formData.permissions.allowedClinics.length === 0) {
      newErrors.clinics = "Select at least one clinic or enable all-clinic access.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedPermissions: UserPermissions = {
        ...formData.permissions,
        canManagePayments: Boolean(
          formData.permissions.canManagePayments
          || formData.permissions.canViewPayments
          || formData.permissions.canCreatePayments
          || formData.permissions.canEditPayments
          || formData.permissions.canDeletePayments
          || formData.permissions.canProcessRefunds
        ),
        allowedClinics: formData.permissions.canAccessAllClinics
          ? []
          : formData.permissions.allowedClinics
      };

      if (mode === "create") {
        const userData: CreateUserRequest = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim() || undefined,
          role: formData.role,
          status: formData.status,
          clinics: normalizedPermissions.allowedClinics,
          permissions: normalizedPermissions
        };

        await onSave(userData);
      } else {
        const userData: UpdateUserRequest = {
          email: formData.email.trim(),
          role: formData.role,
          status: formData.status,
          clinics: normalizedPermissions.allowedClinics,
          permissions: normalizedPermissions,
          profile: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            phone: formData.phone.trim() || undefined
          }
        };

        await onSave(userData);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving user:", error);
      setErrors({ submit: "Failed to save user. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create the account and define clinic access before the user signs in."
              : "Update the account profile, clinic access, and permission set."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[72vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
                  placeholder="John"
                />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(event) => setFormData({ ...formData, username: event.target.value })}
                  placeholder="johndoe"
                  disabled={mode === "edit"}
                />
                {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {mode === "create" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            <section className="space-y-4 rounded-lg border p-4">
              <div>
                <h3 className="font-semibold">Clinic Access</h3>
                <p className="text-sm text-muted-foreground">
                  Choose whether this user can work across every clinic or only a selected set.
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Allow all clinics</p>
                  <p className="text-sm text-muted-foreground">
                    When enabled, clinic-specific selections are cleared.
                  </p>
                </div>
                <Switch
                  checked={formData.permissions.canAccessAllClinics === true}
                  onCheckedChange={(checked) => handlePermissionToggle("canAccessAllClinics", checked)}
                />
              </div>

              {!formData.permissions.canAccessAllClinics && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Allowed Clinics *</Label>
                    <span className="text-xs text-muted-foreground">
                      {formData.permissions.allowedClinics.length} selected
                    </span>
                  </div>

                  {clinicsLoading ? (
                    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                      Loading clinics...
                    </div>
                  ) : clinicOptions.length === 0 ? (
                    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                      No clinics are available to assign right now.
                    </div>
                  ) : (
                    <ScrollArea className="h-40 rounded-md border">
                      <div className="grid gap-3 p-3 sm:grid-cols-2">
                        {clinicOptions.map((clinic) => {
                          const checked = formData.permissions.allowedClinics.includes(clinic.value);

                          return (
                            <label
                              key={clinic.value}
                              className="flex cursor-pointer items-start gap-3 rounded-md border p-3"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(nextChecked) => handleClinicToggle(clinic.value, nextChecked === true)}
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium">{clinic.label}</p>
                                <p className="truncate text-xs text-muted-foreground">{clinic.value}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}

                  {errors.clinics && <p className="text-sm text-red-500">{errors.clinics}</p>}
                </div>
              )}
            </section>

            <section className="space-y-4 rounded-lg border p-4">
              <div>
                <h3 className="font-semibold">Permissions</h3>
                <p className="text-sm text-muted-foreground">
                  Role changes reset these toggles to the backend defaults for that role. You can then fine-tune access.
                </p>
              </div>

              {PERMISSION_SECTIONS.map((section) => (
                <div key={section.title} className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">{section.title}</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {section.permissions.map((permission) => (
                      <label
                        key={permission.key}
                        className="flex cursor-pointer items-start gap-3 rounded-md border p-3"
                      >
                        <Checkbox
                          checked={formData.permissions[permission.key] === true}
                          onCheckedChange={(checked) => handlePermissionToggle(permission.key, checked === true)}
                        />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{permission.label}</p>
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create User" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

