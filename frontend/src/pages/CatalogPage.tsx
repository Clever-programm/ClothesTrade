import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchCategories, fetchProducts, type Category, type Product } from "../api";

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | "all">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("Не удалось загрузить каталог"));
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const visible =
    categoryId === "all" ? products : products.filter((p) => p.category_id === categoryId);

  if (error) return <p className="page">{error}</p>;

  return (
    <div className="page">
      <h1>Каталог</h1>

      {categories.length > 0 && (
        <div className="filters">
          <button
            className={categoryId === "all" ? "chip chip-active" : "chip"}
            onClick={() => setCategoryId("all")}
          >
            Все
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={categoryId === c.id ? "chip chip-active" : "chip"}
              onClick={() => setCategoryId(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 && <p>Товаров пока нет.</p>}

      <div className="catalog-grid">
        {visible.map((product) => (
          <Link className="product-card" to={`/product/${product.slug}`} key={product.id}>
            {product.images[0] && <img src={product.images[0].url} alt={product.name} />}
            <h3>{product.name}</h3>
            <p>{product.price} ₽</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
