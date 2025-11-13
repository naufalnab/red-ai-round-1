export interface User {
  id: number;
  name: string;
  birthdate: string;
  address: string;
  email: string;
  password: string;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  created_at?: string;
}

export interface Cart {
  id: number;
  user_id: number;
  product_id: number;
  qty: number;
  created_at?: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  cart_id: number;
  admin_fee: number;
  subtotal: number;
  total: number;
  created_at?: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
}

export interface SignUpRequest {
  name: string;
  birthdate: string;
  address: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AddToCartRequest {
  product_id: number;
  qty: number;
}

export interface CheckoutRequest {
  cart_id: number;
  admin_fee: number;
}
