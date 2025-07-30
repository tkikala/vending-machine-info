export type VendingMachine = {
  id: string;
  name: string;
  location: string;
  description?: string;
  isActive: boolean;
  owner: { id: number; name: string; email?: string };
  products: Array<{
    id: number;
    name: string;
    description?: string;
    photo?: string;
    price?: number;
    slotCode?: string;
    isAvailable: boolean;
  }>;
  paymentMethods: Array<{
    id: number;
    type: string;
    available: boolean;
  }>;
  photos: Array<{
    id: number;
    url: string;
    caption?: string;
  }>;
  reviews: Array<{
    id: number;
    rating: number;
    comment: string;
    isApproved: boolean;
    user: { id: number; name: string };
  }>;
  createdAt: string;
  updatedAt: string;
}; 