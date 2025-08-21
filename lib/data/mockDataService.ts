// Import real data from JSON file
import realData from './realData.json';
import { realClinicsData, getRealDataClinicName } from './clinics';

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
  status?: string;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface PaymentLineItem {
  id: string;
  serviceCode: string;
  serviceName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxable: boolean;
}

export interface Payment {
  id: string;
  paymentDate: string;
  clientName: string;
  clientId: string;
  invoiceNumber: string;
  orderNumber?: string;
  paymentMethod: string;
  amount: number;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  discountAmount?: number;
  netAmount: number;
  status: "completed" | "pending" | "failed" | "refunded" | "partial";
  clinic: string;
  clinicAddress?: string;
  providerName?: string;
  paymentReference?: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: PaymentLineItem[];
  notes?: string;
  paymentType: "POP" | "DPA" | "Insurance" | "COB" | "Cash" | "Credit" | "Debit";
  insuranceInfo?: {
    primaryInsurance?: string;
    secondaryInsurance?: string;
    claimNumber?: string;
    authorizationNumber?: string;
  };
}

export interface Clinic {
  id: number;
  name: string;
  displayName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  status: 'active' | 'inactive' | 'historical' | 'no-data';
  lastActivity?: string;
  totalAppointments?: number;
  clientCount?: number;
  description?: string;
}

export interface ClinicStats {
  clientCount: number;
  orderCount: number;
  paymentCount: number;
  totalRevenue: number;
  isOrthopedic: boolean;
}

// Real client names from your database
const realClientNames = realData.realClientNames;

export class MockDataService {
  static getAllClinics(): Clinic[] {
    return realClinicsData;
  }

  static getClinicByName(clinicName: string): Clinic | undefined {
    return realClinicsData.find((clinic: Clinic) => clinic.name === clinicName || clinic.displayName === clinicName);
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

    // Use the mapping utility to get the correct realData clinic name
    const realDataName = getRealDataClinicName(clinic);
    const clientCounts: Record<string, number> = realData.clientCounts;
    
    // Try the mapped name first, then fallback to other variations
    let clientCount = clientCounts[realDataName] || clientCounts[clinicName] || clientCounts[clinic.name];
    
    // Enhanced fallback generation based on clinic type
    if (!clientCount) {
      // Generate appropriate client counts based on clinic status and type
      if (clinic.status === 'active') {
        clientCount = 25 + Math.floor(Math.random() * 20); // 25-45 clients for active
      } else if (clinic.status === 'historical') {
        clientCount = 15 + Math.floor(Math.random() * 15); // 15-30 clients for historical
      } else {
        clientCount = 8 + Math.floor(Math.random() * 12); // 8-20 clients for others
      }
    }

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
    
    // Determine clinic type for appropriate products/services
    const getClinicTypeFromName = (name: string, displayName?: string): 'physiotherapy' | 'orthopedic' | 'wellness' | 'general' => {
      const combined = `${name} ${displayName || ''}`.toLowerCase();
      if (combined.includes('physio')) return 'physiotherapy';
      if (combined.includes('orthopedic') || combined.includes('orthotic')) return 'orthopedic';
      if (combined.includes('bliss') || combined.includes('wellness')) return 'wellness';
      return 'general';
    };

    const clinicType = getClinicTypeFromName(clinic.name, clinic.displayName);
    
    // Clinic-specific products/services
    const getProductsForClinicType = (type: string) => {
      switch (type) {
        case 'physiotherapy':
          return [
            { name: "Physiotherapy Session", price: 80, desc: "60-minute therapy session" },
            { name: "Massage Therapy", price: 90, desc: "Therapeutic massage" },
            { name: "Acupuncture", price: 70, desc: "Traditional acupuncture" },
            { name: "Exercise Program", price: 120, desc: "Personalized exercise plan" },
            { name: "Manual Therapy", price: 85, desc: "Hands-on treatment" },
            { name: "Electrotherapy", price: 60, desc: "Electrical stimulation therapy" }
          ];
        case 'orthopedic':
          return [
            { name: "Custom Orthotics", price: 350, desc: "Custom-made orthotic insoles" },
            { name: "Heel Cups", price: 45, desc: "Gel heel cups for comfort" },
            { name: "Arch Supports", price: 60, desc: "Arch support insoles" },
            { name: "Orthopedic Shoes", price: 180, desc: "Therapeutic footwear" },
            { name: "Compression Stockings", price: 75, desc: "Medical compression wear" },
            { name: "Knee Braces", price: 120, desc: "Supportive knee bracing" },
            { name: "Ankle Supports", price: 55, desc: "Ankle stabilization" }
          ];
        case 'wellness':
          return [
            { name: "Wellness Consultation", price: 100, desc: "Comprehensive health assessment" },
            { name: "Nutritional Counseling", price: 85, desc: "Dietary guidance" },
            { name: "Stress Management", price: 90, desc: "Stress reduction techniques" },
            { name: "Lifestyle Coaching", price: 110, desc: "Holistic lifestyle planning" },
            { name: "Meditation Session", price: 65, desc: "Guided meditation" }
          ];
        default:
          return [
            { name: "Health Consultation", price: 100, desc: "General health consultation" },
            { name: "Assessment", price: 85, desc: "Health assessment" },
            { name: "Treatment Session", price: 95, desc: "Treatment session" },
            { name: "Follow-up Visit", price: 75, desc: "Follow-up consultation" }
          ];
      }
    };

    const products = getProductsForClinicType(clinicType);
    const orders: Order[] = [];
    
    // Generate more orders for active clinics, fewer for inactive
    let orderCount = Math.min(25, clients.length);
    if (clinic.status === 'active') {
      orderCount = Math.min(35, clients.length);
    } else if (clinic.status === 'no-data') {
      orderCount = Math.min(12, Math.max(8, clients.length));
    }

    for (let i = 0; i < orderCount; i++) {
      let client;
      let clientName;
      let clientId;
      
      if (clients.length > 0) {
        client = clients[i % clients.length];
        clientName = client.name;
        clientId = client.id;
      } else {
        clientName = "Client " + (i + 1);
        clientId = `placeholder-${i}`;
      }
      
      const productCount = Math.floor(Math.random() * 3) + 1;
      let totalAmount = 0;
      
      const orderProducts = [];
      for (let j = 0; j < productCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const priceVariation = 1 + (Math.random() * 0.3 - 0.15); // ±15% variation
        const price = Math.round(product.price * priceVariation * 100) / 100;
        orderProducts.push({
          name: product.name,
          description: product.desc,
          price: price,
          quantity: Math.floor(Math.random() * 2) + 1
        });
        totalAmount += price;
      }
      
      totalAmount = Math.round(totalAmount * 100) / 100;
      const statusRand = Math.random();
      let status: "paid" | "partially paid" | "unpaid";
      let totalPaid: number;
      
      // Active clinics have better payment rates
      const paidThreshold = clinic.status === 'active' ? 0.8 : 0.7;
      
      if (statusRand < paidThreshold) {
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
      // Vary dates based on clinic status
      const daysBack = clinic.status === 'active' ? 
        Math.floor(Math.random() * 90) : // 0-90 days for active
        Math.floor(Math.random() * 365) + 90; // 90-455 days for others
      orderDate.setDate(orderDate.getDate() - daysBack);
      
      orders.push({
        id: (i + 1).toString(),
        orderNumber: `SH${90000 + clinic.id * 100 + i + 1}`,
        orderDate: orderDate.toISOString().split('T')[0],
        clientName: clientName,
        clientId: clientId,
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
    const paymentTypes: ("POP" | "DPA" | "Insurance" | "COB" | "Cash" | "Credit" | "Debit")[] = ["POP", "DPA", "Insurance", "COB", "Cash", "Credit", "Debit"];
    const clinic = this.getClinicByName(clinicName);
    
    // Enhanced status generation for more variety
    const getPaymentStatus = (orderStatus: string, clinic: Clinic | undefined): "completed" | "pending" | "failed" | "refunded" | "partial" => {
      if (orderStatus === 'unpaid') {
        return Math.random() > 0.7 ? "pending" : "failed";
      }
      
      const rand = Math.random();
      // Active clinics have higher success rates
      const successRate = clinic?.status === 'active' ? 0.85 : 0.75;
      
      if (rand < successRate) {
        return "completed";
      } else if (rand < 0.9) {
        return orderStatus === 'partially paid' ? "partial" : "pending";
      } else if (rand < 0.95) {
        return "failed";
      } else {
        return "refunded";
      }
    };
    
    orders.forEach((order) => {
      if (order.status === 'paid' || order.status === 'partially paid') {
        const paymentDate = new Date(order.orderDate);
        paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 14));
        
        const invoiceDate = new Date(order.orderDate);
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + 30);
        
        const subtotal = order.totalAmount;
        const taxRate = 0.13; // Ontario HST
        const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
        const discountAmount = Math.random() > 0.8 ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
        const netAmount = Math.round((subtotal + taxAmount - discountAmount) * 100) / 100;
        
        // Generate line items from order products
        const lineItems: PaymentLineItem[] = order.products.map((product, index) => ({
          id: `LI${order.id}_${index + 1}`,
          serviceCode: `SVC${String(index + 1).padStart(3, '0')}`,
          serviceName: product.name,
          description: product.description,
          quantity: product.quantity,
          unitPrice: product.price,
          totalPrice: Math.round(product.price * product.quantity * 100) / 100,
          taxable: true
        }));
        
        const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
        const paymentStatus = getPaymentStatus(order.status, clinic);
        
        payments.push({
          id: `PAY${order.id}`,
          paymentDate: paymentDate.toISOString().split('T')[0],
          clientName: order.clientName,
          clientId: order.clientId,
          invoiceNumber: `INV${87570000 + parseInt(order.id)}`,
          orderNumber: order.orderNumber,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          amount: order.totalPaid,
          subtotal,
          taxAmount,
          taxRate,
          discountAmount,
          netAmount,
          status: paymentStatus,
          clinic: clinicName,
          clinicAddress: clinic ? `${clinic.address}, ${clinic.city}, ${clinic.province} ${clinic.postalCode}` : undefined,
          providerName: clinic?.displayName || clinicName,
          paymentReference: `REF${Math.floor(Math.random() * 1000000)}`,
          invoiceDate: invoiceDate.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
          lineItems,
          paymentType,
          insuranceInfo: paymentType === "Insurance" ? {
            primaryInsurance: "Sun Life Financial",
            claimNumber: `CL${Math.floor(Math.random() * 100000)}`,
            authorizationNumber: `AUTH${Math.floor(Math.random() * 10000)}`
          } : undefined,
          notes: Math.random() > 0.7 ? "Payment processed successfully" : undefined
        });
      }
      
      // Also generate some pending/failed payments for unpaid orders
      if (order.status === 'unpaid' && Math.random() > 0.6) {
        const paymentDate = new Date(order.orderDate);
        paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 30));
        
        const invoiceDate = new Date(order.orderDate);
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + 30);
        
        const subtotal = order.totalAmount;
        const taxRate = 0.13;
        const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
        const netAmount = Math.round((subtotal + taxAmount) * 100) / 100;
        
        const lineItems: PaymentLineItem[] = order.products.map((product, index) => ({
          id: `LI${order.id}_${index + 1}`,
          serviceCode: `SVC${String(index + 1).padStart(3, '0')}`,
          serviceName: product.name,
          description: product.description,
          quantity: product.quantity,
          unitPrice: product.price,
          totalPrice: Math.round(product.price * product.quantity * 100) / 100,
          taxable: true
        }));
        
        payments.push({
          id: `PAY${order.id}_PENDING`,
          paymentDate: paymentDate.toISOString().split('T')[0],
          clientName: order.clientName,
          clientId: order.clientId,
          invoiceNumber: `INV${87580000 + parseInt(order.id)}`,
          orderNumber: order.orderNumber,
          paymentMethod: "Credit Card",
          amount: 0,
          subtotal,
          taxAmount,
          taxRate,
          discountAmount: 0,
          netAmount,
          status: Math.random() > 0.5 ? "pending" : "failed",
          clinic: clinicName,
          clinicAddress: clinic ? `${clinic.address}, ${clinic.city}, ${clinic.province} ${clinic.postalCode}` : undefined,
          providerName: clinic?.displayName || clinicName,
          paymentReference: `REF${Math.floor(Math.random() * 1000000)}`,
          invoiceDate: invoiceDate.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
          lineItems,
          paymentType: "POP",
          notes: "Payment pending or failed"
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