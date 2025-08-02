export type Product = {
  id: string;
  name: string;
  description?: string;
  photo?: string;
  price?: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MachineProduct = {
  id: string;
  vendingMachineId: string;
  productId: string;
  isAvailable: boolean;
  product: Product;
  createdAt: string;
  updatedAt: string;
};

export type VendingMachine = {
  id: string;
  name: string;
  location: string;
  description?: string;
  logo?: string;
  coordinates?: string;
  isActive: boolean;
  owner: { id: number; name: string; email?: string };
  products: MachineProduct[];
  paymentMethods: Array<{
    id: number;
    type: string;
    available: boolean;
  }>;
  photos: Array<{
    id: number;
    url: string;
    caption?: string;
    fileType?: 'image' | 'video';
    originalName?: string;
    fileSize?: number;
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