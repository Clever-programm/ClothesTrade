from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin_categories,
    admin_orders,
    admin_products,
    auth,
    categories,
    orders,
    products,
)

api_router = APIRouter()
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(
    admin_products.router, prefix="/admin/products", tags=["admin"]
)
api_router.include_router(
    admin_categories.router, prefix="/admin/categories", tags=["admin"]
)
api_router.include_router(admin_orders.router, prefix="/admin/orders", tags=["admin"])
