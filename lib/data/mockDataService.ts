export interface Client {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  birthday: {
    day: string;
    month: string;
    year: string;
  };
  gender: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  clinic: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  clientName: string;
  clientId: string;
  productCount: number;
  totalAmount: number;
  totalPaid: number;
  totalOwed: number;
  status: "paid" | "partially paid" | "unpaid";
  products: {
    name: string;
    description: string;
    price: number;
    quantity: number;
  }[];
  clinic: string;
}

export interface Payment {
  id: string;
  paymentDate: string;
  clientName: string;
  clientId: string;
  invoiceNumber: string;
  paymentMethod: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  clinic: string;
}

export interface Clinic {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface ClinicStats {
  clientCount: number;
  orderCount: number;
  paymentCount: number;
  totalRevenue: number;
  isOrthopedic: boolean;
}

// Real clinic data from your database
const realClinicsData: Clinic[] = [
  {
    id: 1,
    name: "Orthopedic Orthotic Appliances",
    address: "3833 Midland Ave.",
    city: "Toronto",
    province: "Ontario",
    postalCode: "M1V 5L6"
  },
  {
    id: 2,
    name: "Markham Orthopedic", 
    address: "7155 Woodbine Avenue",
    city: "Markham",
    province: "Ontario",
    postalCode: "L3R 1A3"
  },
  {
    id: 3,
    name: "Bioform Health",
    address: "6033 Shawson Dr",
    city: "Mississauga", 
    province: "Ontario",
    postalCode: "L5T 1H8"
  },
  {
    id: 4,
    name: "BodyBliss",
    address: "1933A Leslie Street",
    city: "Toronto",
    province: "Ontario", 
    postalCode: "M3B 2M3"
  },
  {
    id: 5,
    name: "Evergold",
    address: "3833 Midland Ave.",
    city: "Toronto",
    province: "Ontario",
    postalCode: "M1V 5L6"
  },
  {
    id: 6,
    name: "Ortholine Duncan Mills",
    address: "220 Duncan Mill",
    city: "Toronto",
    province: "Ontario",
    postalCode: "M3B 2M3"
  },
  {
    id: 9,
    name: "bodyblissphysio",
    address: "1929 Leslie Street",
    city: "Toronto",
    province: "Ontario",
    postalCode: "M3B 2M3"
  },
  {
    id: 11,
    name: "ExtremePhysio",
    address: "3660 Midland Ave., Unit 102",
    city: "Scarborough",
    province: "Ontario",
    postalCode: "M1V 0B8"
  },
  {
    id: 14,
    name: "Physio Bliss",
    address: "6033 Shawson Dr",
    city: "Mississauga",
    province: "Ontario",
    postalCode: "L5T 1H8"
  },
  {
    id: 18,
    name: "BodyBlissOneCare",
    address: "1585 Markham Rd",
    city: "Scarborough",
    province: "Ontario",
    postalCode: "M1M 1M1"
  },
  {
    id: 19,
    name: "Active force eh",
    address: "4040 Finch Ave East Unit 209",
    city: "Scarborough",
    province: "Ontario",
    postalCode: "M1S4V5"
  },
  {
    id: 20,
    name: "My Cloud",
    address: "203-3459 Sheppard Ave .East",
    city: "Toronto",
    province: "Ontario",
    postalCode: "M1T 3K5"
  },
  {
    id: 21,
    name: "Century Care",
    address: "",
    city: "",
    province: "",
    postalCode: ""
  }
];

// Real client names from your database
const realClientNames = [
  "Amin, Hasmukhlal",
  "Banquerigo, Charity", 
  "Campagna, Frank",
  "David, G. Levi",
  "Enverga, Rosemer",
  "Fung, Mei Chu",
  "Galang, Alma",
  "Gotzev, Boris",
  "Gotzev, Valeri",
  "Henderson, Sarah",
  "Jackson, Michael",
  "Williams, Jennifer",
  "Robinson, David",
  "Smith, John",
  "Johnson, Mary",
  "Brown, Patricia",
  "Anderson, Jennifer",
  "Taylor, Michael",
  "Wilson, Linda",
  "Miller, James",
  "Clark, Susan",
  "Health Bioform"
];

export class MockDataService {
  static getAllClinics(): Clinic[] {
    return realClinicsData;
  }

  static getClinicByName(clinicName: string): Clinic | undefined {
    return realClinicsData.find((clinic: Clinic) => clinic.name === clinicName);
  }

  static getClinicsBySlug(slug: string): Clinic | undefined {
    // Convert slug back to clinic name (handle common cases)
    const clinicMappings: Record<string, string> = {
      'orthopedic-orthotic-appliances': 'Orthopedic Orthotic Appliances',
      'markham-orthopedic': 'Markham Orthopedic',
      'bioform-health': 'Bioform Health',
      'bodybliss': 'BodyBliss',
      'evergold': 'Evergold',
      'ortholine-duncan-mills': 'Ortholine Duncan Mills',
      'bodyblissphysio': 'bodyblissphysio',
      'extremephysio': 'ExtremePhysio',
      'physio-bliss': 'Physio Bliss',
      'bodyblissonecare': 'BodyBlissOneCare',
      'active-force-eh': 'Active force eh',
      'my-cloud': 'My Cloud',
      'century-care': 'Century Care'
    };

    const clinicName = clinicMappings[slug] || slug.replace(/-/g, ' ');
    return this.getClinicByName(clinicName);
  }

  static getClientsByClinic(clinicName: string): Client[] {
    const clinic = this.getClinicByName(clinicName);
    if (!clinic) return [];

    // Generate different number of clients per clinic based on clinic characteristics
    const clientCounts: Record<string, number> = {
      "Orthopedic Orthotic Appliances": 25,
      "Markham Orthopedic": 30,
      "Bioform Health": 45,
      "BodyBliss": 15,
      "Evergold": 8,
      "Ortholine Duncan Mills": 50,
      "bodyblissphysio": 12,
      "ExtremePhysio": 22,
      "Physio Bliss": 18,
      "BodyBlissOneCare": 28,
      "Active force eh": 10,
      "My Cloud": 20,
      "Century Care": 16
    };

    const clientCount = clientCounts[clinicName] || 15;
    const clients: Client[] = [];

    for (let i = 0; i < clientCount; i++) {
      const nameIndex = (clinic.id * 7 + i) % realClientNames.length;
      const name = realClientNames[nameIndex];
      const [lastName, firstName] = name.split(', ');
      
      clients.push({
        id: `${clinic.id}${String(i + 1000).padStart(4, '0')}`,
        name: name,
        firstName: firstName || '',
        lastName: lastName || '',
        birthday: {
          day: String(Math.floor(Math.random() * 28) + 1).padStart(2, '0'),
          month: String(Math.floor(Math.random() * 12) + 1).padStart(2, '0'),
          year: String(1950 + Math.floor(Math.random() * 50))
        },
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        city: clinic.city || 'Toronto',
        province: clinic.province || 'Ontario',
        phone: `(416) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        email: `${firstName?.toLowerCase() || 'client'}.${lastName?.toLowerCase() || 'user'}@email.com`,
        clinic: clinicName
      });
    }

    return clients;
  }

  static getOrdersByClinic(clinicName: string): Order[] {
    const clinic = this.getClinicByName(clinicName);
    if (!clinic) return [];

    const clients = this.getClientsByClinic(clinicName);
    const isOrthopedic = clinicName.toLowerCase().includes('orthopedic') || 
                        clinicName.toLowerCase().includes('ortholine') ||
                        clinicName.toLowerCase().includes('orthotic');

    const products = isOrthopedic ? [
      { name: "Custom Orthotics", price: 350, desc: "Custom-made orthotic insoles" },
      { name: "Heel Cups", price: 45, desc: "Gel heel cups for comfort" },
      { name: "Arch Supports", price: 60, desc: "Arch support insoles" },
      { name: "Orthopedic Shoes", price: 180, desc: "Therapeutic footwear" },
      { name: "Compression Stockings", price: 75, desc: "Medical compression wear" }
    ] : [
      { name: "Physiotherapy Session", price: 80, desc: "60-minute therapy session" },
      { name: "Massage Therapy", price: 90, desc: "Therapeutic massage" },
      { name: "Acupuncture", price: 70, desc: "Traditional acupuncture" },
      { name: "Exercise Program", price: 120, desc: "Personalized exercise plan" }
    ];

    const orders: Order[] = [];
    const orderCount = Math.min(25, clients.length);

    for (let i = 0; i < orderCount; i++) {
      const client = clients[i % clients.length];
      const productCount = Math.floor(Math.random() * 3) + 1;
      let totalAmount = 0;
      
      const orderProducts = [];
      for (let j = 0; j < productCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const price = product.price + (Math.random() * 50 - 25);
        orderProducts.push({
          name: product.name,
          description: product.desc,
          price: Math.round(price * 100) / 100,
          quantity: Math.floor(Math.random() * 2) + 1
        });
        totalAmount += price;
      }
      
      totalAmount = Math.round(totalAmount * 100) / 100;
      const statusRand = Math.random();
      let status: "paid" | "partially paid" | "unpaid";
      let totalPaid: number;
      
      if (statusRand < 0.7) {
        status = "paid";
        totalPaid = totalAmount;
      } else if (statusRand < 0.9) {
        status = "partially paid";
        totalPaid = Math.round((totalAmount * (0.3 + Math.random() * 0.4)) * 100) / 100;
      } else {
        status = "unpaid";
        totalPaid = 0;
      }
      
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 180));
      
      orders.push({
        id: (i + 1).toString(),
        orderNumber: `SH${90000 + clinic.id * 100 + i + 1}`,
        orderDate: orderDate.toISOString().split('T')[0],
        clientName: client.name,
        clientId: client.id,
        productCount: orderProducts.length,
        totalAmount,
        totalPaid,
        totalOwed: Math.round((totalAmount - totalPaid) * 100) / 100,
        status,
        products: orderProducts,
        clinic: clinicName
      });
    }
    
    return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  static getPaymentsByClinic(clinicName: string): Payment[] {
    const orders = this.getOrdersByClinic(clinicName);
    const payments: Payment[] = [];
    const paymentMethods = ["Cash", "Credit Card", "Debit", "Cheque", "Insurance"];
    
    orders.forEach((order) => {
      if (order.status === 'paid' || order.status === 'partially paid') {
        const paymentDate = new Date(order.orderDate);
        paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 14));
        
        payments.push({
          id: `PAY${order.id}`,
          paymentDate: paymentDate.toISOString().split('T')[0],
          clientName: order.clientName,
          clientId: order.clientId,
          invoiceNumber: `INV${87570000 + parseInt(order.id)}`,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          amount: order.totalPaid,
          status: "completed",
          clinic: clinicName
        });
      }
    });
    
    return payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }

  static formatClientForUI(client: Client): {
    id: string;
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    status: 'active' | 'inactive' | 'archived';
    lastVisit: string;
    totalOrders: number;
    nextAppointment?: string;
  } {
    const dateOfBirth = client.birthday.year && client.birthday.month && client.birthday.day 
      ? `${client.birthday.year}-${client.birthday.month.padStart(2, '0')}-${client.birthday.day.padStart(2, '0')}`
      : '';

    const gender = client.gender?.toLowerCase() === 'male' ? 'male' 
                 : client.gender?.toLowerCase() === 'female' ? 'female' 
                 : 'other';

    // Generate some realistic status and dates
    const status = Math.random() > 0.2 ? 'active' : 'inactive';
    const lastVisit = new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const totalOrders = Math.floor(Math.random() * 20) + 1;
    const nextAppointment = status === 'active' && Math.random() > 0.3 
      ? new Date(Date.now() + Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : undefined;

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      dateOfBirth,
      gender: gender as 'male' | 'female' | 'other',
      status: status as 'active' | 'inactive' | 'archived',
      lastVisit,
      totalOrders,
      nextAppointment
    };
  }

  static getAvailableClinics(): string[] {
    return realClinicsData.map(clinic => clinic.name);
  }
} 