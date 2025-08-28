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

// Comprehensive Payment Data
export const paymentsData = [
  {
    id: "PAY001",
    clientId: "CLT001",
    clientName: "JOHNSON, SARAH",
    invoiceNumber: "INV87570001",
    orderNumber: "SH90133",
    amount: 120.50,

    netAmount: 120.50,
    paymentMethod: "Credit Card",
    paymentType: "POP",
    status: "completed",
    paymentDate: "2024-01-15",
    invoiceDate: "2024-01-10",
    dueDate: "2024-02-09",
    paymentReference: "REF123456",
    clinic: "BodyBliss Physio",
    clinicAddress: "1929 Leslie Street, Toronto, Ontario M3B 2M3",
    providerName: "BodyBliss Physio",
    services: [
      {
        id: "SVC001",
        name: "Physiotherapy Session",
        description: "60-minute therapy session",
        quantity: 1,
        unitPrice: 80.00,
        totalPrice: 80.00
      },
      {
        id: "SVC002", 
        name: "Massage Therapy",
        description: "Therapeutic massage",
        quantity: 1,
        unitPrice: 26.64,
        totalPrice: 26.64
      }
    ],
    notes: "Payment processed successfully"
  },
  {
    id: "PAY002",
    clientId: "CLT002", 
    clientName: "WILSON, MICHAEL",
    invoiceNumber: "INV87570002",
    orderNumber: "SH90134",
    amount: 350.00,

    netAmount: 350.00,
    paymentMethod: "Insurance",
    paymentType: "Insurance",
    status: "completed",
    paymentDate: "2024-01-14",
    invoiceDate: "2024-01-09",
    dueDate: "2024-02-08",
    paymentReference: "REF123457",
    clinic: "Ortholine Duncan Mills",
    clinicAddress: "220 Duncan Mill, Toronto, Ontario M3B 2M3",
    providerName: "Ortholine Duncan Mills",
    services: [
      {
        id: "SVC003",
        name: "Custom Orthotics",
        description: "Custom-made orthotic insoles",
        quantity: 1,
        unitPrice: 309.73,
        totalPrice: 309.73
      }
    ],
    insuranceInfo: {
      primaryInsurance: "Sun Life Financial",
      claimNumber: "CL12345",
      authorizationNumber: "AUTH9876"
    }
  },
  {
    id: "PAY003",
    clientId: "CLT003",
    clientName: "CHEN, LINDA",
    invoiceNumber: "INV87570003", 
    orderNumber: "SH90135",
    amount: 0,


    netAmount: 96.05,
    paymentMethod: "Credit Card",
    paymentType: "POP",
    status: "pending",
    paymentDate: "2024-01-16",
    invoiceDate: "2024-01-11",
    dueDate: "2024-02-10",
    paymentReference: "REF123458",
    clinic: "Bioform Health",
    clinicAddress: "6033 Shawson Dr, Mississauga, Ontario L5T 1H8",
    providerName: "Bioform Health",
    services: [
      {
        id: "SVC004",
        name: "Health Assessment",
        description: "Comprehensive health assessment",
        quantity: 1,
        unitPrice: 85.00,
        totalPrice: 85.00
      }
    ],
    notes: "Payment pending processing"
  },
  {
    id: "PAY004",
    clientId: "CLT004",
    clientName: "TAYLOR, PATRICIA",
    invoiceNumber: "INV87570004",
    orderNumber: "SH90125",
    amount: 75.25,


    netAmount: 75.25,
    paymentMethod: "Debit",
    paymentType: "Debit",
    status: "refunded",
    paymentDate: "2024-01-12",
    invoiceDate: "2024-01-07",
    dueDate: "2024-02-06",
    paymentReference: "REF123459",
    clinic: "Markham Orthopedic",
    clinicAddress: "7155 Woodbine Avenue, Markham, Ontario L3R 1A3",
    providerName: "Markham Orthopedic",
    services: [
      {
        id: "SVC005",
        name: "Compression Stockings",
        description: "Medical compression wear",
        quantity: 1,
        unitPrice: 66.59,
        totalPrice: 66.59
      }
    ],
    notes: "Refund processed due to sizing issue"
  },
  {
    id: "PAY005",
    clientId: "CLT005",
    clientName: "BROWN, ROBERT",
    invoiceNumber: "INV87570005",
    orderNumber: "SH90136",
    amount: 95.00,

    netAmount: 95.00,
    paymentMethod: "Cash",
    paymentType: "Cash",
    status: "completed",
    paymentDate: "2024-01-13",
    invoiceDate: "2024-01-08", 
    dueDate: "2024-02-07",
    paymentReference: "REF123460",
    clinic: "ExtremePhysio",
    clinicAddress: "3660 Midland Ave., Unit 102, Scarborough, Ontario M1V 0B8",
    providerName: "Extreme Physio",
    services: [
      {
        id: "SVC006",
        name: "Exercise Program",
        description: "Personalized exercise plan",
        quantity: 1,
        unitPrice: 84.07,
        totalPrice: 84.07
      }
    ]
  },
  {
    id: "PAY006",
    clientId: "CLT006",
    clientName: "GARCIA, MARIA",
    invoiceNumber: "INV87570006",
    orderNumber: "SH90137",
    amount: 45.00,

    netAmount: 167.00,
    paymentMethod: "Credit Card",
    paymentType: "POP",
    status: "partial",
    paymentDate: "2024-01-17",
    invoiceDate: "2024-01-12",
    dueDate: "2024-02-11",
    paymentReference: "REF123461",
    clinic: "Physio Bliss",
    clinicAddress: "220 Duncan Mills Rd, Suite 100, Toronto, Ontario M3B 2M3",
    providerName: "Physio Bliss",
    services: [
      {
        id: "SVC007",
        name: "Acupuncture",
        description: "Traditional acupuncture treatment",
        quantity: 2,
        unitPrice: 70.00,
        totalPrice: 140.00
      },
      {
        id: "SVC008",
        name: "Consultation",
        description: "Initial consultation",
        quantity: 1,
        unitPrice: 7.79,
        totalPrice: 7.79
      }
    ],
    notes: "Partial payment received"
  },
  {
    id: "PAY007",
    clientId: "CLT007",
    clientName: "ANDERSON, DAVID",
    invoiceNumber: "INV87570007",
    orderNumber: "SH90130",
    amount: 0,

    netAmount: 203.40,
    paymentMethod: "Credit Card",
    paymentType: "POP",
    status: "failed",
    paymentDate: "2024-01-18",
    invoiceDate: "2024-01-13",
    dueDate: "2024-02-12",
    paymentReference: "REF123462",
    clinic: "Orthopedic Orthotic Appliances",
    clinicAddress: "3833 Midland Ave., Toronto, Ontario M1V 5L6",
    providerName: "Orthopedic Orthotic Appliances",
    services: [
      {
        id: "SVC009",
        name: "Orthopedic Shoes",
        description: "Therapeutic footwear",
        quantity: 1,
        unitPrice: 180.00,
        totalPrice: 180.00
      }
    ],
    notes: "Payment failed - card declined"
  },
  
  // Additional BodyBliss Physio payments
  {
    id: "PAY008",
    clientId: "CLT008",
    clientName: "THOMPSON, JENNIFER",
    invoiceNumber: "INV87570008",
    orderNumber: "SH90138",
    amount: 150.00,

    netAmount: 150.00,
    paymentMethod: "Insurance",
    paymentType: "Insurance",
    status: "completed",
    paymentDate: "2024-01-20",
    invoiceDate: "2024-01-15",
    dueDate: "2024-02-14",
    paymentReference: "REF123463",
    clinic: "BodyBliss Physio",
    clinicAddress: "1929 Leslie Street, Toronto, Ontario M3B 2M3",
    providerName: "BodyBliss Physio",
    services: [
      {
        id: "SVC010",
        name: "Physiotherapy Assessment",
        description: "Initial physiotherapy evaluation",
        quantity: 1,
        unitPrice: 132.74,
        totalPrice: 132.74
      }
    ],
    insuranceInfo: {
      primaryInsurance: "Manulife Financial",
      claimNumber: "CL12346",
      authorizationNumber: "AUTH9877"
    }
  },
  {
    id: "PAY009",
    clientId: "CLT009",
    clientName: "MARTINEZ, CARLOS",
    invoiceNumber: "INV87570009",
    orderNumber: "SH90139",
    amount: 85.00,

    netAmount: 85.00,
    paymentMethod: "Debit",
    paymentType: "Debit",
    status: "completed",
    paymentDate: "2024-01-19",
    invoiceDate: "2024-01-14",
    dueDate: "2024-02-13",
    paymentReference: "REF123464",
    clinic: "BodyBliss Physio",
    clinicAddress: "1929 Leslie Street, Toronto, Ontario M3B 2M3",
    providerName: "BodyBliss Physio",
    services: [
      {
        id: "SVC011",
        name: "Therapeutic Massage",
        description: "45-minute therapeutic massage",
        quantity: 1,
        unitPrice: 75.22,
        totalPrice: 75.22
      }
    ]
  },
  {
    id: "PAY010",
    clientId: "CLT010",
    clientName: "WALKER, STEPHANIE",
    invoiceNumber: "INV87570010",
    orderNumber: "SH90140",
    amount: 0,

    netAmount: 107.35,
    paymentMethod: "Credit Card",
    paymentType: "POP",
    status: "pending",
    paymentDate: "2024-01-22",
    invoiceDate: "2024-01-17",
    dueDate: "2024-02-16",
    paymentReference: "REF123465",
    clinic: "BodyBliss Physio",
    clinicAddress: "1929 Leslie Street, Toronto, Ontario M3B 2M3",
    providerName: "BodyBliss Physio",
    services: [
      {
        id: "SVC012",
        name: "Manual Therapy",
        description: "Manual therapy treatment session",
        quantity: 1,
        unitPrice: 95.00,
        totalPrice: 95.00
      }
    ],
    notes: "Payment processing - awaiting confirmation"
  },
  {
    id: "PAY011",
    clientId: "CLT011",
    clientName: "RODRIGUEZ, MIGUEL",
    invoiceNumber: "INV87570011",
    orderNumber: "SH90141",
    amount: 200.00,

    netAmount: 200.00,
    paymentMethod: "Cash",
    paymentType: "Cash",
    status: "completed",
    paymentDate: "2024-01-16",
    invoiceDate: "2024-01-11",
    dueDate: "2024-02-10",
    paymentReference: "REF123466",
    clinic: "BodyBliss Physio",
    clinicAddress: "1929 Leslie Street, Toronto, Ontario M3B 2M3",
    providerName: "BodyBliss Physio",
    services: [
      {
        id: "SVC013",
        name: "Physiotherapy Session",
        description: "60-minute treatment session",
        quantity: 1,
        unitPrice: 85.00,
        totalPrice: 85.00
      },
      {
        id: "SVC014",
        name: "Exercise Therapy",
        description: "Therapeutic exercise program",
        quantity: 1,
        unitPrice: 45.00,
        totalPrice: 45.00
      },
      {
        id: "SVC015",
        name: "Hot/Cold Pack",
        description: "Thermal therapy application",
        quantity: 1,
        unitPrice: 46.99,
        totalPrice: 46.99
      }
    ]
  },
  {
    id: "PAY012",
    clientId: "CLT012",
    clientName: "PATEL, PRIYA",
    invoiceNumber: "INV87570012",
    orderNumber: "SH90142",
    amount: 75.00,

    netAmount: 201.01,
    paymentMethod: "Credit Card",
    paymentType: "POP",
    status: "partial",
    paymentDate: "2024-01-21",
    invoiceDate: "2024-01-16",
    dueDate: "2024-02-15",
    paymentReference: "REF123467",
    clinic: "BodyBliss Physio",
    clinicAddress: "1929 Leslie Street, Toronto, Ontario M3B 2M3",
    providerName: "BodyBliss Physio",
    services: [
      {
        id: "SVC016",
        name: "Acupuncture",
        description: "Traditional acupuncture session",
        quantity: 2,
        unitPrice: 65.00,
        totalPrice: 130.00
      },
      {
        id: "SVC017",
        name: "Electrotherapy",
        description: "TENS/electrical stimulation",
        quantity: 1,
        unitPrice: 47.88,
        totalPrice: 47.88
      }
    ],
    notes: "Partial payment received - balance due $126.01"
  },
  {
    id: "PAY013",
    clientId: "CLT013",
    clientName: "LEE, KEVIN",
    invoiceNumber: "INV87570013",
    orderNumber: "SH90143",
    amount: 110.00,

    netAmount: 110.00,
    paymentMethod: "Debit",
    paymentType: "Debit",
    status: "completed",
    paymentDate: "2024-01-23",
    invoiceDate: "2024-01-18",
    dueDate: "2024-02-17",
    paymentReference: "REF123468",
    clinic: "BodyBliss Physio",
    clinicAddress: "1929 Leslie Street, Toronto, Ontario M3B 2M3",
    providerName: "BodyBliss Physio",
    services: [
      {
        id: "SVC018",
        name: "Sports Injury Assessment",
        description: "Comprehensive sports injury evaluation",
        quantity: 1,
        unitPrice: 97.35,
        totalPrice: 97.35
      }
    ]
  },
  {
    id: "PAY014",
    clientId: "CLT014",
    clientName: "CLARK, AMANDA",
    invoiceNumber: "INV87570014",
    orderNumber: "SH90144",
    amount: 65.00,

    netAmount: 65.00,
    paymentMethod: "Insurance",
    paymentType: "Insurance",
    status: "completed",
    paymentDate: "2024-01-24",
    invoiceDate: "2024-01-19",
    dueDate: "2024-02-18",
    paymentReference: "REF123469",
    clinic: "BodyBliss Physio",
    clinicAddress: "1929 Leslie Street, Toronto, Ontario M3B 2M3",
    providerName: "BodyBliss Physio",
    services: [
      {
        id: "SVC019",
        name: "Follow-up Session",
        description: "Follow-up physiotherapy session",
        quantity: 1,
        unitPrice: 57.52,
        totalPrice: 57.52
      }
    ],
    insuranceInfo: {
      primaryInsurance: "Great-West Life",
      claimNumber: "CL12347",
      authorizationNumber: "AUTH9878"
    }
  }
];

// Filter payments by clinic 
export const getPaymentsByClinic = (clinicName: string) => {
  const clinicMappings: Record<string, string[]> = {
    'bodyblissphysio': ['BodyBliss Physio', 'BodyBliss'],
    'bodybliss-physio': ['BodyBliss Physio', 'BodyBliss'], // Handle URL slug format
    'bioform-health': ['Bioform Health'],
    'ortholine-duncan-mills': ['Ortholine Duncan Mills'],
    'markham-orthopedic': ['Markham Orthopedic'],
    'extremephysio': ['ExtremePhysio', 'Extreme Physio'],
    'extreme-physio': ['ExtremePhysio', 'Extreme Physio'], // Handle URL slug format  
    'physio-bliss': ['Physio Bliss'],
    'orthopedic-orthotic-appliances': ['Orthopedic Orthotic Appliances'],
    'bodyblissonecare': ['BodyBliss OneCare'],
    'bodybliss-onecare': ['BodyBliss OneCare'], // Handle URL slug format
    'my-cloud': ['My Cloud'],
    'century-care': ['Century Care'],
    'active-force-eh': ['Active force eh', 'Active Force'],
    'evergold': ['Evergold'],
    'bodybliss': ['BodyBliss']
  };

  const clinicNames = clinicMappings[clinicName] || [clinicName];
  
  return paymentsData.filter(payment => 
    clinicNames.some(name => 
      payment.clinic.toLowerCase().includes(name.toLowerCase()) ||
      payment.providerName.toLowerCase().includes(name.toLowerCase())
    )
  );
};

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