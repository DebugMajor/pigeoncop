from pathlib import Path

ROOT = Path("datasets/pigeon-v3")

SPLITS = ["train", "valid", "test"]

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
}


def get_images(folder):
    return [
        p for p in folder.iterdir()
        if p.is_file()
        and p.suffix.lower() in IMAGE_EXTENSIONS
    ]


def get_labels(folder):
    return [
        p for p in folder.iterdir()
        if p.is_file()
        and p.suffix.lower() == ".txt"
    ]


def verify_split(split):
    image_dir = ROOT / split / "images"
    label_dir = ROOT / split / "labels"

    images = get_images(image_dir)
    labels = get_labels(label_dir)

    image_stems = {image.stem for image in images}
    label_stems = {label.stem for label in labels}

    orphan_labels = label_stems - image_stems

    labeled_images = 0
    negative_images = 0

    for image in images:
        label_file = label_dir / f"{image.stem}.txt"

        if label_file.exists():
            labeled_images += 1
        else:
            negative_images += 1

    print(f"\n[{split.upper()}]")
    print(f"Images: {len(images)}")
    print(f"Labels: {len(labels)}")
    print(f"Images with labels: {labeled_images}")
    print(f"Images without labels: {negative_images}")

    if orphan_labels:
        print(f"WARNING - orphan labels: {len(orphan_labels)}")
    else:
        print("No orphan labels.")


def main():
    if not ROOT.exists():
        raise FileNotFoundError(
            f"Dataset not found: {ROOT}"
        )

    for split in SPLITS:
        verify_split(split)

    print("\nDataset verification complete.")


if __name__ == "__main__":
    main()
