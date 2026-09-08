import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import { adminApi, type Category, type Product, type ProductInput } from "../../api";
import { useAuth } from "../../auth";

const emptyForm: ProductInput = {
  name: "",
  description: "",
  price: 0,
  sizes_text: "",
  category_id: null,
  is_active: true,
};

function ProductForm({
  initial,
  categories,
  onSubmit,
  onCancel,
}: {
  initial: ProductInput;
  categories: Category[];
  onSubmit: (data: ProductInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<ProductInput>(initial);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <label>
        Название
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </label>
      <label>
        Цена, ₽
        <input
          type="number"
          min={0}
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          required
        />
      </label>
      <label>
        Размеры
        <input
          placeholder="S, M, L"
          value={form.sizes_text}
          onChange={(e) => setForm({ ...form, sizes_text: e.target.value })}
        />
      </label>
      <label>
        Категория
        <select
          value={form.category_id ?? ""}
          onChange={(e) =>
            setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : null })
          }
        >
          <option value="">Без категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Описание
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={form.is_active ?? true}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
        />
        Показывать в каталоге
      </label>
      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}

function ProductCard({
  product,
  categories,
  token,
  onChanged,
}: {
  product: Product;
  categories: Category[];
  token: string;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(data: ProductInput) {
    await adminApi.updateProduct(token, product.id, data);
    setEditing(false);
    onChanged();
  }

  async function handleDelete() {
    if (!confirm(`Удалить товар «${product.name}»?`)) return;
    await adminApi.deleteProduct(token, product.id);
    onChanged();
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await adminApi.uploadImage(token, product.id, file);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить фото");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDeleteImage(imageId: number) {
    await adminApi.deleteImage(token, product.id, imageId);
    onChanged();
  }

  if (editing) {
    return (
      <div className="admin-product-card">
        <ProductForm
          initial={{
            name: product.name,
            description: product.description,
            price: product.price,
            sizes_text: product.sizes_text,
            category_id: product.category_id,
            is_active: product.is_active,
          }}
          categories={categories}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="admin-product-card">
      <div className="admin-product-header">
        <div>
          <h3>
            {product.name} {!product.is_active && <span className="badge">скрыт</span>}
          </h3>
          <p>{product.price} ₽</p>
        </div>
        <div className="actions">
          <button onClick={() => setEditing(true)}>Редактировать</button>
          <button className="danger" onClick={handleDelete}>
            Удалить
          </button>
        </div>
      </div>

      <div className="admin-images">
        {product.images.map((img) => (
          <div className="admin-image" key={img.id}>
            <img src={img.url} alt={product.name} />
            <button className="remove-image" onClick={() => handleDeleteImage(img.id)}>
              ×
            </button>
          </div>
        ))}
        <label className="upload-button">
          {uploading ? "..." : "+ фото"}
          <input type="file" accept="image/*" hidden onChange={handleUpload} />
        </label>
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export default function ProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!token) return;
    Promise.all([adminApi.listProducts(token), adminApi.listCategories(token)])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .catch(() => setError("Ошибка загрузки"));
  }

  useEffect(load, [token]);

  async function handleCreate(data: ProductInput) {
    if (!token) return;
    await adminApi.createProduct(token, data);
    setCreating(false);
    load();
  }

  return (
    <div>
      <h1>Товары</h1>
      {error && <p className="form-error">{error}</p>}

      {creating ? (
        <div className="admin-product-card">
          <ProductForm
            initial={emptyForm}
            categories={categories}
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
          />
        </div>
      ) : (
        <button onClick={() => setCreating(true)}>+ Добавить товар</button>
      )}

      <div className="admin-products-list">
        {token &&
          products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              categories={categories}
              token={token}
              onChanged={load}
            />
          ))}
      </div>
    </div>
  );
}
