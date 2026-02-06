/**
 * Tipos para Planes - Jardines del Renacer
 */

export type PlanCategory = 
  | 'excellence' 
  | 'exequial' 
  | 'premium' 
  | 'familiar' 
  | 'corporativo' 
  | 'mascotas';

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  description?: string;
  price: string;
  priceNumeric?: number;
  image: string;
  featured: boolean;
  benefits: string[];
  category: PlanCategory;
  coverage?: {
    people: number;
    duration: string;
  };
}

export interface PlanQuote {
  planId: string;
  fullName: string;
  email: string;
  phone: string;
  beneficiaries?: number;
  message?: string;
  createdAt: Date;
}
