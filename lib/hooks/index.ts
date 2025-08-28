// Client hooks
export {
  useClients,
  useClient,
  useClientSearch,
  useClientStats
} from './useClients';

// Appointment hooks
export {
  useAppointments,
  useAppointmentStats
} from './useAppointments';

// Payment hooks and enums
export {
  usePayments,
  usePaymentsByClinic,
  usePayment,
  usePaymentsByClient,
  usePaymentStats,
  useOutstandingPayments,
  usePaymentsByOrder,
  useRevenueData
} from './usePayments';

// Payment enums and types
export {
  PaymentApiService,
  PaymentStatus,
  PaymentType,
  PaymentMethod,
  type Payment,
  type PaymentAmounts
} from '../api/paymentService';

// Product hooks
export {
  useProducts,
  useProduct,
  useProductsByClinic,
  useProductSearch,
  useProductAnalytics,
  useProductMutation
} from './useProducts';

// Order hooks
export {
  useOrders,
  useOrder,
  useOrdersByClient,
  useOrdersByClinic,
  useBillingOrders,
  useRevenueAnalytics,
  useProductPerformance,
  useOrderMutation,
  OrderUtils
} from './useOrders';

// Order enums and types
export {
  OrderStatus,
  type Order
} from '../api/orderService';

// Event hooks
export {
  useEvents,
  useEvent,
  useEventsByClinic,
  useEventsByClient,
  useUpcomingEvents,
  useEventStats,
  useEventSearch
} from './useEvents';

// Event enums and types
export {
  EventApiService,
  EventType,
  EventStatus,
  type Event,
  type EventFilters
} from '../api/eventService';
