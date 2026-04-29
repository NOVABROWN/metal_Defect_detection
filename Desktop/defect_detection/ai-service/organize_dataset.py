"""
Organize dataset helper script
Reorganizes extracted NEU dataset to match expected structure
"""

import os
import shutil
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATASET_PATH = Path("../dataset")


def find_class_folders(root_dir):
    """Find class folders in the dataset"""
    classes = [
        "Crazing",
        "Inclusion",
        "Patches",
        "Pitted_Surface",
        "Rolled-in_Scale",
        "Scratches"
    ]

    found_folders = {}

    for root, dirs, files in os.walk(root_dir):
        for class_name in classes:
            if class_name in root:
                images = [f for f in os.listdir(root) if f.endswith(('.jpg', '.png'))]
                if images:
                    found_folders[class_name] = (root, len(images))

    return found_folders


def organize_dataset():
    """Reorganize dataset to match expected structure"""
    logger.info("Organizing dataset...")

    # Find all class folders
    logger.info("Searching for class folders...")
    all_found = {}

    for root, dirs, files in os.walk(DATASET_PATH):
        for d in dirs:
            for class_name in ["Crazing", "Inclusion", "Patches", "Pitted_Surface", "Rolled-in_Scale", "Scratches"]:
                if class_name in d:
                    full_path = Path(root) / d
                    images = list(full_path.glob("*.jpg"))
                    if images:
                        if class_name not in all_found:
                            all_found[class_name] = []
                        all_found[class_name].append((full_path, len(images)))

    # Separate train and test
    logger.info("Separating train and test sets...")

    for class_name, locations in all_found.items():
        logger.info(f"\n{class_name}:")

        for location, count in locations:
            logger.info(f"  Found {count} images in: {location}")

            # Determine if train or test based on location or image count
            # Usually NEU dataset has 300 train and 100 test per class
            if count >= 250:  # Likely training set
                dest_dir = DATASET_PATH / "train" / class_name
                set_type = "TRAIN"
            else:  # Likely test set
                dest_dir = DATASET_PATH / "test" / class_name
                set_type = "TEST"

            dest_dir.mkdir(parents=True, exist_ok=True)

            # Move images
            image_count = 0
            for img_file in location.glob("*.jpg"):
                dest_file = dest_dir / img_file.name
                if not dest_file.exists():
                    shutil.copy2(img_file, dest_file)
                    image_count += 1

            logger.info(f"  ✓ Moved {image_count} images to {set_type}")

    logger.info("\nDataset organization completed!")


def verify_final_structure():
    """Verify final dataset structure"""
    classes = [
        "Crazing",
        "Inclusion",
        "Patches",
        "Pitted_Surface",
        "Rolled-in_Scale",
        "Scratches"
    ]

    print("\n" + "="*70)
    print("FINAL DATASET STRUCTURE VERIFICATION")
    print("="*70)

    total_train = 0
    total_test = 0

    for class_name in classes:
        train_dir = DATASET_PATH / "train" / class_name
        test_dir = DATASET_PATH / "test" / class_name

        train_count = len(list(train_dir.glob("*.jpg"))) if train_dir.exists() else 0
        test_count = len(list(test_dir.glob("*.jpg"))) if test_dir.exists() else 0

        total_train += train_count
        total_test += test_count

        print(f"{class_name:20} | Train: {train_count:4} images | Test: {test_count:3} images")

    print("-"*70)
    print(f"{'TOTAL':20} | Train: {total_train:4} images | Test: {total_test:3} images")
    print("="*70 + "\n")

    return total_train > 0 and total_test > 0


if __name__ == "__main__":
    print("Dataset Organization Tool for NEU Surface Defect Database\n")
    organize_dataset()
    if verify_final_structure():
        print("✓ Dataset is now organized correctly!")
        print("Ready for training. Run: python train.py")
    else:
        print("✗ Dataset organization may have issues. Please verify manually.")
