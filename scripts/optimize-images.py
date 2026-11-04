"""Regenerate responsive WebP assets: python -m pip install Pillow; python scripts/optimize-images.py."""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
WIDTHS = (480, 960, 1440)


def main():
    original_bytes = 0
    largest_bytes = 0
    for source in sorted((ROOT / "image").glob("*.jpg")):
        original_bytes += source.stat().st_size
        with Image.open(source) as original:
            image = ImageOps.exif_transpose(original).convert("RGB")
            widths = sorted({min(width, image.width) for width in WIDTHS})
            for width in widths:
                height = round(image.height * width / image.width)
                output = source.with_name(f"{source.stem}-{width}.webp")
                image.resize((width, height), Image.Resampling.LANCZOS).save(
                    output, "WEBP", quality=76, method=6
                )
            largest_bytes += output.stat().st_size
    print(f"Original JPEGs: {original_bytes:,} bytes")
    print(f"Largest WebP variants: {largest_bytes:,} bytes")
    print(f"Reduction: {1 - largest_bytes / original_bytes:.1%}")


if __name__ == "__main__":
    main()
