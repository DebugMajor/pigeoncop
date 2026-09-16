from pathlib import Path
import random
import shutil


SOURCE_ROOT = Path("datasets/people-detection")

OUTPUT_ROOT = Path("datasets/pigeon-v3-negatives/humans")

TARGET_COUNT = 600
RANDOM_SEED = 42

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
}

# Classes that represent humans/people in the downloaded dataset.
HUMAN_CLASSES = {
    "Pedestrian",
    "Pedestrians",
    "Persona",
    "Pessoa",
    "people",
    "person",
    "persons",
    "0",
    "1",
    "2",
}

# If any of these appear in an image, we do NOT want to use
# that image as a negative sample.
UNSAFE_CLASSES = {
    "bird",
}


def load_class_names():
    yaml_path = SOURCE_ROOT / "data.yaml"

    if not yaml_path.exists():
        raise FileNotFoundError(
            f"Could not find {yaml_path}"
        )

    text = yaml_path.read_text(
        encoding="utf-8"
    )

    names_line = None

    for line in text.splitlines():
        if line.startswith("names:"):
            names_line = line
            break

    if names_line is None:
        raise RuntimeError(
            "Could not find 'names:' in data.yaml"
        )

    raw = names_line.split(":", 1)[1].strip()

    # The names list is Python-list syntax, so safely parse it.
    import ast

    names = ast.literal_eval(raw)

    if not isinstance(names, list):
        raise RuntimeError(
            "Could not parse class names."
        )

    return names


def get_all_images():
    return [
        path
        for path in SOURCE_ROOT.rglob("*")
        if path.is_file()
        and path.suffix.lower()
        in IMAGE_EXTENSIONS
    ]


def get_label_path(image_path):
    # Convert:
    # train/images/example.jpg
    #
    # into:
    # train/labels/example.txt

    parts = list(image_path.parts)

    try:
        images_index = parts.index("images")
    except ValueError:
        return None

    parts[images_index] = "labels"

    label_path = Path(*parts).with_suffix(".txt")

    return label_path


def analyze_image(image_path, class_names):
    label_path = get_label_path(image_path)

    if label_path is None or not label_path.exists():
        return False

    text = label_path.read_text(
        encoding="utf-8"
    ).strip()

    if not text:
        return False

    contains_human = False
    contains_unsafe = False

    for line in text.splitlines():

        parts = line.split()

        if not parts:
            continue

        try:
            class_id = int(parts[0])
        except ValueError:
            continue

        if class_id < 0 or class_id >= len(class_names):
            continue

        class_name = class_names[class_id]

        if class_name in HUMAN_CLASSES:
            contains_human = True

        if class_name in UNSAFE_CLASSES:
            contains_unsafe = True

    # We only want images containing humans,
    # and we explicitly reject images containing birds.
    return contains_human and not contains_unsafe


def main():
    random.seed(RANDOM_SEED)

    class_names = load_class_names()

    print("Classes loaded:", len(class_names))
    print()

    print(
        "Human classes being accepted:"
    )

    for name in sorted(HUMAN_CLASSES):
        print("  ", name)

    print()

    images = get_all_images()

    print(
        f"Total images found: {len(images)}"
    )

    valid_images = []

    for image in images:
        if analyze_image(
            image,
            class_names
        ):
            valid_images.append(image)

    print(
        f"Human-only candidate images: "
        f"{len(valid_images)}"
    )

    if not valid_images:
        raise RuntimeError(
            "No suitable human images found."
        )

    random.shuffle(valid_images)

    selected = valid_images[
        :TARGET_COUNT
    ]

    OUTPUT_ROOT.mkdir(
        parents=True,
        exist_ok=True
    )

    for index, image in enumerate(
        selected,
        start=1
    ):
        destination = (
            OUTPUT_ROOT
            / f"human_negative_{index:04d}"
            f"{image.suffix.lower()}"
        )

        shutil.copy2(
            image,
            destination
        )

    print()
    print(
        f"Selected {len(selected)} "
        "human negative images."
    )

    print(
        f"Output: {OUTPUT_ROOT}"
    )


if __name__ == "__main__":
    main()