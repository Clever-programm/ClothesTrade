import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.config import settings
from app.db.session import get_db
from app.models.product import Product, ProductImage
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate
from app.utils.slugify import slugify

router = APIRouter(dependencies=[Depends(get_current_admin)])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


def _get_product_or_404(db: Session, product_id: int) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product


@router.get("/", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)) -> list[Product]:
    return list(db.scalars(select(Product).order_by(Product.created_at.desc())))


@router.post("/", response_model=ProductOut)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> Product:
    product = Product(**payload.model_dump(), slug=slugify(payload.name))
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)
) -> Product:
    product = _get_product_or_404(db, product_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)) -> None:
    product = _get_product_or_404(db, product_id)
    db.delete(product)
    db.commit()


@router.post("/{product_id}/images", response_model=ProductOut)
async def upload_product_image(
    product_id: int, file: UploadFile, db: Session = Depends(get_db)
) -> Product:
    product = _get_product_or_404(db, product_id)
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Разрешены только JPEG, PNG, WebP")

    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.uploads_dir, filename)
    with open(path, "wb") as f:
        f.write(await file.read())

    next_order = len(product.images)
    db.add(ProductImage(product_id=product.id, url=f"/uploads/{filename}", sort_order=next_order))
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}/images/{image_id}", response_model=ProductOut)
def delete_product_image(
    product_id: int, image_id: int, db: Session = Depends(get_db)
) -> Product:
    product = _get_product_or_404(db, product_id)
    image = db.get(ProductImage, image_id)
    if image is None or image.product_id != product_id:
        raise HTTPException(status_code=404, detail="Фото не найдено")

    file_path = os.path.join(settings.uploads_dir, os.path.basename(image.url))
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(image)
    db.commit()
    db.refresh(product)
    return product
