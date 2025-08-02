export type User = {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OWNER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  photo?: string;
  price?: number; // Default price
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MachineProduct = {
  id: string;
  vendingMachineId: string;
  productId: string;
  price?: number; // Override price for this machine
  isAvailable: boolean;
  product: Product;
  createdAt: string;
  updatedAt: string;
};

export type PaymentMethodType = {
  id: string;
  type: 'COIN' | 'BANKNOTE' | 'GIROCARD' | 'CREDIT_CARD';
  name: string;
  description?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
};

export type MachinePaymentMethod = {
  id: string;
  vendingMachineId: string;
  type: 'COIN' | 'BANKNOTE' | 'GIROCARD' | 'CREDIT_CARD';
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type VendingMachine = {
  id: string;
  name: string;
  location: string;
  description?: string;
  logo?: string;
  coordinates?: string;
  isActive: boolean;
  owner: { id: string; name: string; email?: string };
  products: MachineProduct[];
  paymentMethods: MachinePaymentMethod[];
  photos: Array<{
    id: string;
    url: string;
    caption?: string;
    fileType: string;
    originalName?: string;
    fileSize?: number;
    createdAt: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    isApproved: boolean;
    user: { id: string; name: string };
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}; 