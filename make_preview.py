
import pymupdf
from pathlib import Path

pdf_path = Path("public/pdfs/Money Behind The scene-1.pdf")
output_path = Path("public/pdfs/money-behind-the-scene-preview.png")

if not pdf_path.exists():
    raise FileNotFoundError(f"PDF not found: {pdf_path}")

with pymupdf.open(pdf_path) as pdf:
    page = pdf[0]
    pix = page.get_pixmap(
        matrix=pymupdf.Matrix(1.5, 1.5),
        alpha=False
    )
    pix.save(output_path)

print(f"Preview created: {output_path}")
