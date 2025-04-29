// Mock data for Body Bliss Visio

export const heroData = {
  title: "Your Journey to Wellness Starts Here",
  subtitle: "Experience personalized care with Body Bliss Visio's comprehensive health and wellness services",
  ctaText: "Book an Appointment",
  secondaryCtaText: "Learn More",
  image: "/images/hero-image.jpg" // This would be a placeholder path
};

export const featuresData = [
  {
    id: 1,
    title: "Personalized Treatment Plans",
    description: "Our specialists create custom wellness programs tailored to your specific health needs and goals.",
    icon: "Sparkles"
  },
  {
    id: 2,
    title: "Advanced Diagnostics",
    description: "State-of-the-art technology to accurately assess your condition and monitor your progress.",
    icon: "Activity"
  },
  {
    id: 3,
    title: "Holistic Approach",
    description: "We treat the whole person, addressing physical, emotional, and lifestyle factors for complete wellness.",
    icon: "Heart"
  },
  {
    id: 4,
    title: "Expert Practitioners",
    description: "Our team of certified professionals brings years of experience and specialized training.",
    icon: "GraduationCap"
  }
];

export const servicesData = [
  {
    id: 1,
    title: "Advanced Therapeutic Bodywork",
    description: "Our signature integrative therapy combines deep tissue techniques, myofascial release, and trigger point therapy for comprehensive pain relief.",
    image: "/images/advanced-bodywork.jpg"
  },
  {
    id: 2,
    title: "Functional Rehabilitation",
    description: "Evidence-based rehabilitation protocols designed to restore optimal movement patterns and prevent recurrence of injuries.",
    image: "/images/rehabilitation.jpg"
  },
  {
    id: 3,
    title: "Integrative Nutritional Analysis",
    description: "Comprehensive metabolic assessment with personalized nutrition plans based on your unique biochemistry and health objectives.",
    image: "/images/nutrition-analysis.jpg"
  },
  {
    id: 4,
    title: "Mind-Body Wellness Therapy",
    description: "Holistic approach combining cognitive techniques, biofeedback, and mindfulness practices for stress reduction and mental resilience.",
    image: "/images/mind-body-wellness.jpg"
  }
];

export const testimonialsData = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Yoga Instructor",
    content: "The physical therapy program at Body Bliss completely transformed my recovery after a shoulder injury. I'm back to teaching full-time with no pain!",
    avatar: "/avatars/sarah.jpg"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Marathon Runner",
    content: "Their sports massage therapy is exceptional. Regular sessions have significantly improved my performance and recovery time between races.",
    avatar: "/avatars/michael.jpg"
  },
  {
    id: 3,
    name: "Jessica Rodriguez",
    role: "Office Professional",
    content: "The stress management program helped me break the cycle of chronic tension headaches that I've struggled with for years. Highly recommended!",
    avatar: "/avatars/jessica.jpg"
  }
];

export const clinicsData = [
  {
    id: 1,
    name: "Body Bliss - Main Street",
    address: "123 Main Street, Suite 200",
    city: "Wellness City",
    state: "WS",
    zip: "12345",
    phone: "(555) 123-4567",
    hours: "Mon-Fri: 8am-7pm, Sat: 9am-5pm, Sun: Closed"
  },
  {
    id: 2,
    name: "Body Bliss - Downtown",
    address: "456 Center Avenue",
    city: "Wellness City",
    state: "WS",
    zip: "12345",
    phone: "(555) 987-6543",
    hours: "Mon-Fri: 7am-8pm, Sat-Sun: 10am-4pm"
  },
  {
    id: 3,
    name: "Body Bliss - West Side",
    address: "789 Sunset Boulevard",
    city: "Wellness City",
    state: "WS",
    zip: "12346",
    phone: "(555) 567-8901",
    hours: "Mon-Thu: 8am-8pm, Fri: 8am-6pm, Sat-Sun: 9am-2pm"
  },
  {
    id: 4,
    name: "Body Bliss - East Side",
    address: "321 Sunrise Road",
    city: "Wellness City",
    state: "WS",
    zip: "12347",
    phone: "(555) 234-5678",
    hours: "Mon-Fri: 9am-6pm, Sat: 10am-4pm, Sun: Closed"
  },
  {
    id: 5,
    name: "Body Bliss - North Center",
    address: "555 Wellness Avenue",
    city: "Wellness City",
    state: "WS",
    zip: "12348",
    phone: "(555) 876-5432",
    hours: "Mon-Fri: 8am-7pm, Sat-Sun: 9am-3pm"
  }
];

// Dashboard mock data
export const upcomingAppointmentsData = [
  {
    id: 1,
    serviceName: "Therapeutic Massage",
    provider: "Dr. Emma Wilson",
    date: "2023-06-15",
    time: "10:30 AM",
    location: "Body Bliss - Main Street",
    status: "confirmed"
  },
  {
    id: 2,
    serviceName: "Physical Therapy",
    provider: "Dr. James Martinez",
    date: "2023-06-22",
    time: "2:00 PM",
    location: "Body Bliss - Downtown",
    status: "confirmed"
  },
  {
    id: 3,
    serviceName: "Nutritional Consultation",
    provider: "Lisa Thompson, RD",
    date: "2023-07-05",
    time: "11:15 AM",
    location: "Body Bliss - West Side",
    status: "pending"
  }
];

export const recentTreatmentsData = [
  {
    id: 1,
    serviceName: "Deep Tissue Massage",
    provider: "Dr. Emma Wilson",
    date: "2023-05-28",
    notes: "Focused on lower back tension. Recommended stretching exercises and heat therapy."
  },
  {
    id: 2,
    serviceName: "Physical Therapy",
    provider: "Dr. James Martinez",
    date: "2023-05-15",
    notes: "Shoulder mobility improving. Continuing with current exercise protocol."
  }
];

export const wellnessScoresData = {
  physical: 78,
  nutrition: 65,
  stress: 72,
  sleep: 80,
  overall: 74
};

export const recommendationsData = [
  {
    id: 1,
    title: "Schedule a follow-up massage",
    description: "Based on your last treatment, we recommend booking a follow-up deep tissue massage within the next 2 weeks.",
    priority: "high"
  },
  {
    id: 2,
    title: "Try our new stress management workshop",
    description: "Your stress indicators suggest you might benefit from our new mindfulness workshop starting next month.",
    priority: "medium"
  },
  {
    id: 3,
    title: "Nutrition consultation",
    description: "It's been 6 months since your last nutrition review. Consider scheduling a follow-up to update your plan.",
    priority: "low"
  }
];

export const availableAppointmentsData = [
  {
    id: 1,
    serviceId: 1,
    serviceName: "Therapeutic Massage",
    provider: "Dr. Emma Wilson",
    date: "2023-06-18",
    availableTimes: ["9:00 AM", "11:30 AM", "3:00 PM", "4:30 PM"]
  },
  {
    id: 2,
    serviceId: 1,
    serviceName: "Therapeutic Massage",
    provider: "Dr. Mark Johnson",
    date: "2023-06-19",
    availableTimes: ["10:00 AM", "1:00 PM", "2:30 PM", "5:00 PM"]
  },
  {
    id: 3,
    serviceId: 2,
    serviceName: "Physical Therapy",
    provider: "Dr. James Martinez",
    date: "2023-06-20",
    availableTimes: ["8:30 AM", "10:00 AM", "2:00 PM", "4:00 PM"]
  }
];

// User mock data
export const currentUserData = {
  id: 1,
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  phone: "555-123-4567",
  dob: "1985-06-15",
  gender: "non-binary",
  address: {
    street: "123 Wellness Avenue",
    city: "Wellness City",
    state: "WS",
    zipCode: "12345",
    country: "United States"
  },
  emergencyContact: {
    name: "Sarah Johnson",
    relationship: "Spouse",
    phone: "555-987-6543"
  },
  insurance: {
    provider: "BlueShield Health",
    policyNumber: "BSH-123456789",
    groupNumber: "GRP-987654",
    primaryHolder: true,
    coverageStartDate: "2022-01-01",
    coverageEndDate: "2023-12-31"
  },
  clinicalInformation: {
    bloodType: "O+",
    allergies: ["Penicillin", "Peanuts"],
    chronicConditions: ["Mild Asthma", "Seasonal Allergies"],
    currentMedications: [
      {
        name: "Albuterol",
        dosage: "90mcg",
        frequency: "As needed",
        purpose: "Asthma management"
      },
      {
        name: "Loratadine",
        dosage: "10mg",
        frequency: "Once daily",
        purpose: "Allergy relief"
      }
    ],
    surgicalHistory: [
      {
        procedure: "Appendectomy",
        date: "2010-03-12",
        hospital: "Wellness General Hospital"
      }
    ],
    vaccinations: [
      { name: "Influenza", date: "2022-10-05" },
      { name: "COVID-19", date: "2022-04-15" },
      { name: "Tdap", date: "2019-06-20" }
    ]
  },
  wellnessProfile: {
    height: { value: 175, unit: "cm" },
    weight: { value: 68, unit: "kg" },
    bmi: 22.2,
    exerciseFrequency: "3-4 times per week",
    dietaryPreferences: ["Vegetarian", "Low-carb"],
    sleepAverage: 7.5,
    stressLevel: "Moderate",
    goals: [
      "Improve flexibility",
      "Reduce stress",
      "Maintain current weight"
    ]
  },
  treatmentPreferences: {
    preferredClinics: [1, 3],
    preferredProviders: [2, 5],
    preferredAppointmentDays: {
      monday: true,
      tuesday: false,
      wednesday: true,
      thursday: true,
      friday: false,
      saturday: true,
      sunday: false
    },
    preferredAppointmentTimes: ["Morning", "Evening"],
    communicationPreferences: {
      appointmentReminders: "Email",
      generalCommunication: "Email",
      promotionalOffers: false
    }
  },
  accountSettings: {
    language: "English",
    timezone: "America/New_York",
    receiveNewsletter: true,
    twoFactorEnabled: true,
    notificationSettings: {
      appointmentReminders: true,
      appointmentChanges: true,
      treatmentSummaries: true,
      billingUpdates: true,
      promotionalContent: false
    },
    privacySettings: {
      shareDataForResearch: false,
      allowLocationTracking: true
    }
  },
  membershipDetails: {
    memberSince: "2021-08-15",
    membershipType: "Premium",
    membershipStatus: "Active",
    membershipExpiration: "2024-08-15",
    loyaltyPoints: 1250,
    referrals: 3
  }
};

export const activityData = [
  {
    id: 1,
    type: "order",
    title: "New order created",
    description: "Order #SH90136 for JOHNSON, MARY",
    timestamp: "2 hours ago",
    icon: "ShoppingBag"
  },
  {
    id: 2,
    type: "client",
    title: "New client registered",
    description: "WILSON, LINDA added to the system",
    timestamp: "5 hours ago",
    icon: "Users"
  },
  {
    id: 3,
    type: "payment",
    title: "Payment received",
    description: "$120.50 payment for Order #SH90133",
    timestamp: "Yesterday at 2:15 PM",
    icon: "CreditCard"
  },
  {
    id: 4,
    type: "order",
    title: "Order status updated",
    description: "Order #SH90130 marked as completed",
    timestamp: "Yesterday at 11:45 AM",
    icon: "ShoppingBag"
  },
  {
    id: 5,
    type: "client",
    title: "Client information updated",
    description: "Contact details updated for SMITH, JOHN",
    timestamp: "2 days ago",
    icon: "Users"
  },
  {
    id: 6,
    type: "payment",
    title: "Refund processed",
    description: "$75.25 refunded for Order #SH90125",
    timestamp: "2 days ago",
    icon: "CreditCard"
  },
  {
    id: 7,
    type: "order",
    title: "Order cancelled",
    description: "Order #SH90122 has been cancelled",
    timestamp: "3 days ago",
    icon: "ShoppingBag"
  },
  {
    id: 8,
    type: "settings",
    title: "System settings changed",
    description: "Email notification preferences updated",
    timestamp: "3 days ago",
    icon: "Settings"
  },
  {
    id: 9,
    type: "client",
    title: "Client appointment scheduled",
    description: "BROWN, ROBERT scheduled for next Tuesday",
    timestamp: "4 days ago",
    icon: "Calendar"
  },
  {
    id: 10,
    type: "payment",
    title: "Payment method added",
    description: "New credit card added for TAYLOR, PATRICIA",
    timestamp: "5 days ago",
    icon: "CreditCard"
  }
]; 