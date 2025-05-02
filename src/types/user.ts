export interface AuthUser {
    id: string;
    email: string;
    role: "admin" | "user";
  }
  
export interface Trip {
  id: string;
  destination: string;
  country: string;
  description: string;
  highlights: string;
  price: number;
  startDate: string;
  endDate: string;
  imageUrl?: string;
}