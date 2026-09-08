export interface ProductImage {
  id: number;
  url: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  sizes_text: string;
  is_active: boolean;
  category_id: number | null;
  images: ProductImage[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface OrderItemOut {
  product_id: number;
  product_name: string;
  qty: number;
}

export interface Order {
  id: number;
  customer_name: string;
  phone: string;
  comment: string;
  status: string;
  items: OrderItemOut[];
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  sizes_text?: string;
  category_id?: number | null;
  is_active?: boolean;
}

const API_BASE = "/api/v1";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Ошибка запроса (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products/`);
  return handle(res);
}

export async function fetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${slug}`);
  return handle(res);
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories/`);
  return handle(res);
}

export interface OrderCreateInput {
  customer_name: string;
  phone: string;
  comment?: string;
  items: { product_id: number; qty: number }[];
}

export async function createOrder(payload: OrderCreateInput): Promise<void> {
  const res = await fetch(`${API_BASE}/orders/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await handle(res);
}

export async function login(email: string, password: string): Promise<string> {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await handle<{ access_token: string }>(res);
  return data.access_token;
}

async function adminFetch<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  return handle<T>(res);
}

export const adminApi = {
  listProducts: (token: string) => adminFetch<Product[]>("/admin/products/", token),
  createProduct: (token: string, data: ProductInput) =>
    adminFetch<Product>("/admin/products/", token, { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (token: string, id: number, data: Partial<ProductInput>) =>
    adminFetch<Product>(`/admin/products/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteProduct: (token: string, id: number) =>
    adminFetch<void>(`/admin/products/${id}`, token, { method: "DELETE" }),
  uploadImage: (token: string, id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return adminFetch<Product>(`/admin/products/${id}/images`, token, {
      method: "POST",
      body: form,
    });
  },
  deleteImage: (token: string, productId: number, imageId: number) =>
    adminFetch<Product>(`/admin/products/${productId}/images/${imageId}`, token, {
      method: "DELETE",
    }),

  listCategories: (token: string) => adminFetch<Category[]>("/admin/categories/", token),
  createCategory: (token: string, name: string) =>
    adminFetch<Category>("/admin/categories/", token, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  updateCategory: (token: string, id: number, name: string) =>
    adminFetch<Category>(`/admin/categories/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),
  deleteCategory: (token: string, id: number) =>
    adminFetch<void>(`/admin/categories/${id}`, token, { method: "DELETE" }),

  listOrders: (token: string) => adminFetch<Order[]>("/admin/orders/", token),
  updateOrderStatus: (token: string, id: number, status: string) =>
    adminFetch<Order>(`/admin/orders/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
