import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "./pages/admin/AdminLayout";
import CategoriesPage from "./pages/admin/CategoriesPage";
import LoginPage from "./pages/admin/LoginPage";
import OrdersPage from "./pages/admin/OrdersPage";
import ProductsPage from "./pages/admin/ProductsPage";
import CatalogPage from "./pages/CatalogPage";
import ProductPage from "./pages/ProductPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/product/:slug" element={<ProductPage />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/products" replace />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders" element={<OrdersPage />} />
      </Route>
    </Routes>
  );
}
