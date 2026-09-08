import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchProduct, type Product } from "../api";
import OrderForm from "../components/OrderForm";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchProduct(slug)
      .then(setProduct)
      .catch(() => setError("Товар не найден"));
  }, [slug]);

  if (error) return <p className="page">{error}</p>;
  if (!product) return <p className="page">Загрузка...</p>;

  return (
    <div className="page product-page">
      <Link to="/" className="back-link">
        ← В каталог
      </Link>
      <div className="product-detail">
        <div className="product-images">
          {product.images.length === 0 && <div className="product-image-placeholder" />}
          {product.images.map((img) => (
            <img key={img.id} src={img.url} alt={product.name} />
          ))}
        </div>
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="price">{product.price} ₽</p>
          {product.sizes_text && <p>Размеры: {product.sizes_text}</p>}
          <p>{product.description}</p>
          <OrderForm productId={product.id} />
        </div>
      </div>
    </div>
  );
}
