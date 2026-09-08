import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import { fetchProducts, type Product } from "./api";

function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("Не удалось загрузить каталог"));
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div className="catalog">
      <h1>Каталог</h1>
      {products.length === 0 && <p>Товаров пока нет.</p>}
      <div className="catalog-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.price} ₽</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
    </Routes>
  );
}
