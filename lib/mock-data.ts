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
  phone: "(555) 123-4567",
  dateOfBirth: "1985-06-15",
  profileImage: "/avatars/alex.jpg",
  preferredLocation: "Body Bliss - Main Street",
  memberSince: "2022-01-10",
  upcomingAppointments: 2,
  lastVisit: "2023-05-28"
}; 