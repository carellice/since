from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "logo.png"
RES = ROOT / "android" / "app" / "src" / "main" / "res"

SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size, size), radius=radius, fill=255)
    return mask


def compose_launcher_icon(source: Image.Image, size: int, rounded: bool = False) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), "#ffffff")
    inset = int(size * 0.12)
    content_size = size - inset * 2
    logo = source.resize((content_size, content_size), Image.Resampling.LANCZOS)
    canvas.alpha_composite(logo, (inset, inset))

    if rounded:
        canvas.putalpha(rounded_mask(size, int(size * 0.22)))

    return canvas


def compose_foreground(source: Image.Image, size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    inset = int(size * 0.18)
    content_size = size - inset * 2
    logo = source.resize((content_size, content_size), Image.Resampling.LANCZOS)
    canvas.alpha_composite(logo, (inset, inset))
    return canvas


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")

    for folder, size in SIZES.items():
        out_dir = RES / folder
        out_dir.mkdir(parents=True, exist_ok=True)
        compose_launcher_icon(source, size).save(out_dir / "ic_launcher.png")
        compose_launcher_icon(source, size, rounded=True).save(out_dir / "ic_launcher_round.png")
        compose_foreground(source, size).save(out_dir / "ic_launcher_foreground.png")

    print("Icone Android generate con sfondo bianco.")


if __name__ == "__main__":
    main()
