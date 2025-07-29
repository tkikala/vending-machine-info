export type VendingMachine = {
  id: string;
  name: string;
  location: string;
  owner: { id: number; name: string };
  products: Array<{
    id: number;
    name: string;
    description?: string;
    photo?: string;
  }>;
  paymentMethods: Array<{
    id: number;
    type: string;
    available: boolean;
  }>;
  photos: Array<{
    id: number;
    url: string;
  }>;
  reviews: Array<{
    id: number;
    rating: number;
    comment: string;
    user: { id: number; name: string };
  }>;
}; 