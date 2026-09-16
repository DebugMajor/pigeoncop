from pathlib import Path
import shutil
import random


V3_ROOT = Path("datasets/pigeon-v3")
NEGATIVE_ROOT = Path("datasets/pigeon-v3-negatives/humans")

RANDOM_SEED = 42

TRAIN_COUNT = 420
VALID_COUNT = 90
TEST_COUNT = 90

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
}


def get_images():
    return [
        path
        for path in NEGATIVE_ROOT.iterdir()
        if path.is_file()
        and path.suffix.lower()
        in IMAGE_EXTENSIONS
    ]


def copy_images(images, split, start_index):
    destination = V3_ROOT / split / "images"
    destination.mkdir(
        parents=True,
        exist_ok=True
    )

    for index, image in enumerate(
        images,
        start=start_index
    ):
        new_name = (
            f"negative_{index:04d}"
            f"{image.suffix.lower()}"
        )

        shutil.copy2(
            image,
            destination / new_name
        )


def main():
    random.seed(RANDOM_SEED)

    images = get_images()

    print(
        f"Negative images found: {len(images)}"
    )

    if len(images) < (
        TRAIN_COUNT +
        VALID_COUNT +
        TEST_COUNT
    ):
        raise RuntimeError(
            "Not enough negative images."
        )

    random.shuffle(images)

    train = images[:TRAIN_COUNT]

    valid_start = TRAIN_COUNT
    valid_end = (
        valid_start +
        VALID_COUNT
    )

    valid = images[
        valid_start:valid_end
    ]

    test = images[
        valid_end:
        valid_end + TEST_COUNT
    ]

    print(f"Train negatives: {len(train)}")
    print(f"Valid negatives: {len(valid)}")
    print(f"Test negatives: {len(test)}")

    copy_images(
        train,
        "train",
        1
    )

    copy_images(
        valid,
        "valid",
        TRAIN_COUNT + 1
    )

    copy_images(
        test,
        "test",
        TRAIN_COUNT +
        VALID_COUNT +
        1
    )

    print("\nV3 negatives merged successfully.")


if __name__ == "__main__":
    main()