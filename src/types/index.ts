// src/types/index.ts

export type UserRole = 'admin' | 'driver' | 'customer' | 'employee';

export type OrderStatus =
  | 'pending'
  | 'approved'
  | 'assigned'
  | 'pickedup'
  | 'transit'
  | 'arrived'
  | 'outfordelivery'
  | 'delivered'
  | 'failed'
  | 'rejected';

export type PaymentMethod = 'cod' | 'qr' | 'card';
export type PaymentStatus = 'unpaid' | 'paid';
export type ServiceType   = 'direct' | 'consolidated';

export interface User {
  uid:       string;
  username:  string;
  email:     string;
  phone?:    string;
  address?:  string;
  role:      UserRole;
  // driver-only
  vehicle?:  string;
  branch?:   string;
  status?:   'active' | 'inactive';
  createdAt?: string;
}

export interface HistoryEntry {
  status: OrderStatus;
  time:   string;
  note:   string;
}

export interface Order {
  orderId:        string;
  trackingId:     string;
  customerId:     string | null;   // null for guest walk-in orders (no account)
  customerName:   string;
  customerPhone?: string;          // captured for guest orders, so staff can reach them without an account
  senderName:     string;
  receiverName:   string;
  phone:          string;
  address:        string;
  packageType:    string;
  weight:         number;
  branch:         string;
  assignedDriver: string | null;
  driverName:     string | null;
  driverUid:      string | null;
  status:         OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  serviceType?:   ServiceType;
  senderLat?:    number;
  senderLng?:    number;
  receiverLat?:  number;
  receiverLng?:  number;
  receiverBranch?: string;
  distanceKm?:    number;
  price?:         number;
  locationTag?:   string;          // e.g. "Shelf A3" — set by branch staff when marking an order arrived
  createdByRole?: 'customer' | 'employee';
  createdByUid?:  string;          // employee uid, for walk-in orders staff created
  createdAt:      string;
  updatedAt:      string;
  history:        HistoryEntry[];
}

export interface Branch {
  id:        string;
  name:      string;
  lat?:      number;
  lng?:      number;
  createdAt?: string;
}

export interface Notification {
  id:    string;
  uid:   string;
  title: string;
  body:  string;
  type:  'success' | 'info' | 'pending' | 'warning';
  read:  boolean;
  time:  string;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:        'Pending',
  approved:       'Approved',
  assigned:       'Assigned',
  pickedup:       'Picked Up',
  transit:        'In Transit',
  arrived:        'Arrived at Branch',
  outfordelivery: 'Out For Delivery',
  delivered:      'Delivered',
  failed:         'Failed',
  rejected:       'Rejected',
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod:  'Cash on Delivery',
  qr:   'QR / Bank Transfer',
  card: 'Card',
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  direct:       'Direct Delivery',
  consolidated: 'Branch Drop-off',
};