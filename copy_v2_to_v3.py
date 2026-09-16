from pathlib import Path
import shutil


V2_ROOT = Path("datasets/pigeon-v2")
V3_ROOT = Path("datasets/pigeon-v3")

SPLITS = ["train", "valid", "test"]


def copy_split(split):
    src_images = V2_ROOT / split / "images"
    src_labels = V2_ROOT / split / "labels"

    dst_images = V3_ROOT / split / "images"
    dst_labels = V3_ROOT / split / "labels"

    dst_images.mkdir(parents=True, exist_ok=True)
    dst_labels.mkdir(parents=True, exist_ok=True)

    image_count = 0
    label_count = 0

    for image in src_images.iterdir():
        if image.is_file():
            shutil.copy2(image, dst_images / image.name)
            image_count += 1

    for label in src_labels.iterdir():
        if label.is_file():
            shutil.copy2(label, dst_labels / label.name)
            label_count += 1

    print(
        f"{split}: copied "
        f"{image_count} images, "
        f"{label_count} labels"
    )


def main():
    if not V2_ROOT.exists():
        raise FileNotFoundError(
            f"V2 dataset not found: {V2_ROOT}"
        )

    for split in SPLITS:
        copy_split(split)

    print("\nV2 -> V3 copy complete.")


if __name__ == "__main__":
    main()