import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";

interface IProduct {
  _id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isFeatured: boolean;
}

interface IProductStore {
  products: IProduct[];
  loading: boolean;
  setProducts: (products: IProduct[]) => void;
  createProduct: (productData: IProduct) => Promise<void>;
  fetchAllProducts: () => Promise<void>;
  deleteProduct: (productId: string) => void;
  toggleFeaturedProduct: (productId: string) => Promise<void>;
  fetchProductByCategory: (category: string) => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
}

export const useProductStore = create<IProductStore>((set) => ({
  products: [],
  loading: false,
  setProducts: (products) => set({ products }),

  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post("/products", productData);
      set((prevState) => ({
        products: [...prevState.products, res.data.product],
      }));
      set({ loading: false });
      toast.success("Product added successfully");
    } catch (error: unknown) {
      console.error(error);
      set({ loading: false });
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosError.response?.data?.message || "Something went wrong");
    } finally {
      set({ loading: false });
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get(`/products`);
      set({ products: res.data.products });
      set({ loading: false });
    } catch (error: unknown) {
      console.error(error);
      set({ loading: false });
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosError.response?.data?.message || "Something went wrong");
    }
  },

  fetchProductByCategory: async (category) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get(`/products/category/${category}`);
      set({ products: res.data.products });
      set({ loading: false });
    } catch (error: unknown) {
      console.error(error);
      set({ loading: false });
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosError.response?.data?.message || "Something went wrong");
    }
  },
  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await axiosInstance.delete(`/products/${productId}`);
      set((prevState) => ({
        products: prevState.products.filter((product) => product._id !== productId),
      }));
      set({ loading: false });
    } catch (error: unknown) {
      console.error(error);
      set({ loading: false });
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosError.response?.data?.message || "Something went wrong");
    }
  },
  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.patch(`/products/${productId}`);
      set((prevState) => ({
        products: prevState.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: res.data.product.isFeatured }
            : product
        ),
      }))
      set({ loading: false });
    } catch (error: unknown) {
      console.error(error);
      set({ loading: false });
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosError.response?.data?.message || "Something went wrong");
    }
  },

  fetchFeaturedProducts: async () => {
		set({ loading: true });
		try {
			const response = await axiosInstance.get("/products/featured");
      console.log(response.data, "from product store")
			set({ products: response.data.featuredProducts, loading: false });
		} catch (error: unknown) {
      console.error(error);
      set({ loading: false });
    }
	},
}));
