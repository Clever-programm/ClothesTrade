import io

from PIL import Image, ImageOps

MAX_DIMENSION = 1600
JPEG_QUALITY = 85


def optimize_image(data: bytes) -> bytes:
    """Fix orientation, downscale, and re-encode an uploaded image as a compact JPEG."""
    image = Image.open(io.BytesIO(data))
    image = ImageOps.exif_transpose(image)

    if image.mode not in ("RGB", "L"):
        background = Image.new("RGB", image.size, (255, 255, 255))
        background.paste(image, mask=image.convert("RGBA").split()[-1])
        image = background
    else:
        image = image.convert("RGB")

    image.thumbnail((MAX_DIMENSION, MAX_DIMENSION))

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    return buffer.getvalue()
