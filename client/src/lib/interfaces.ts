export interface ICartItem {
    productId: string;
    quantity: number;
}

export interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    cartItems: ICartItem[];
    role: "customer" | "admin";
    comparePassword: (password: string) => Promise<boolean>;
}

export interface ISignUp {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ICategory {
  href: string;
  name: string;
  imageUrl: string;
}

export interface IProduct{
  _id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isFeatured?: boolean;
  quantity?: number;
}


export interface ICoupon {
    code: string;
    discountPercentage: number;
    expirationDate: Date;
    isActive: boolean;
    userId: string;
}

interface Product {
    productId: {
        _id: string;
        name: string;
        description: string;
        price: number;
        image: string;
        category: string;
        isFeatured: boolean;
        createdAt: string; // ISO date string
        updatedAt: string; // ISO date string
        v: number;
    };
    quantity: number;
    price: number;
    _id: string;
}

export interface IOrder {
    _id: string;
    userId: string;
    products: Product[];
    totalAmount: number;
    stripeSessionId: string;
    orderStatus: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}