"""snapshot product name on order items

Revision ID: a20e20a2ca7d
Revises: 65e03853b184
Create Date: 2026-09-08 10:08:02.348621

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "a20e20a2ca7d"
down_revision: str | None = "65e03853b184"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("order_items", sa.Column("product_name", sa.String(length=200), nullable=True))
    op.execute(
        """
        UPDATE order_items
        SET product_name = products.name
        FROM products
        WHERE order_items.product_id = products.id
        """
    )
    # Any leftover NULLs (product already deleted before this migration) get a placeholder.
    op.execute("UPDATE order_items SET product_name = '(товар удалён)' WHERE product_name IS NULL")
    op.alter_column("order_items", "product_name", existing_type=sa.String(length=200), nullable=False)

    op.alter_column("order_items", "product_id", existing_type=sa.INTEGER(), nullable=True)
    op.drop_constraint(op.f("order_items_product_id_fkey"), "order_items", type_="foreignkey")
    op.create_foreign_key(
        None, "order_items", "products", ["product_id"], ["id"], ondelete="SET NULL"
    )


def downgrade() -> None:
    op.drop_constraint(None, "order_items", type_="foreignkey")
    op.create_foreign_key(
        op.f("order_items_product_id_fkey"), "order_items", "products", ["product_id"], ["id"]
    )
    op.alter_column("order_items", "product_id", existing_type=sa.INTEGER(), nullable=False)
    op.drop_column("order_items", "product_name")
