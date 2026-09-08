import { useEffect, useState, type FormEvent } from "react";

import { adminApi, type Category } from "../../api";
import { useAuth } from "../../auth";

export default function CategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!token) return;
    adminApi
      .listCategories(token)
      .then(setCategories)
      .catch(() => setError("Ошибка загрузки"));
  }

  useEffect(load, [token]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!token || !name.trim()) return;
    try {
      await adminApi.createCategory(token, name.trim());
      setName("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания");
    }
  }

  async function handleRename(id: number) {
    if (!token || !editingName.trim()) return;
    await adminApi.updateCategory(token, id, editingName.trim());
    setEditingId(null);
    load();
  }

  async function handleDelete(id: number) {
    if (!token) return;
    if (!confirm("Удалить категорию? Товары останутся, но без категории.")) return;
    await adminApi.deleteCategory(token, id);
    load();
  }

  return (
    <div>
      <h1>Категории</h1>
      {error && <p className="form-error">{error}</p>}

      <form className="inline-form" onSubmit={handleCreate}>
        <input
          placeholder="Название категории"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Добавить</button>
      </form>

      <table className="admin-table">
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>
                {editingId === c.id ? (
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  c.name
                )}
              </td>
              <td className="actions">
                {editingId === c.id ? (
                  <button onClick={() => handleRename(c.id)}>Сохранить</button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setEditingName(c.name);
                    }}
                  >
                    Переименовать
                  </button>
                )}
                <button className="danger" onClick={() => handleDelete(c.id)}>
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
