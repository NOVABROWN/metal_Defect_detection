"""
Dataset Download and Setup Guide for Metal Defect Detection

This script helps download and organize the NEU Surface Defect Database from Kaggle
"""

import os
import shutil
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATASET_PATH = Path("../dataset")


def create_dataset_structure():
    """Create expected dataset directory structure"""
    logger.info("Creating dataset directory structure...")

    # Create main directories
    DATASET_PATH.mkdir(parents=True, exist_ok=True)
    (DATASET_PATH / "train").mkdir(exist_ok=True)
    (DATASET_PATH / "test").mkdir(exist_ok=True)

    # Define defect classes
    classes = [
        "Crazing",
        "Inclusion",
        "Patches",
        "Pitted_Surface",
        "Rolled-in_Scale",
        "Scratches"
    ]

    # Create subdirectories for each class
    for class_name in classes:
        (DATASET_PATH / "train" / class_name).mkdir(exist_ok=True)
        (DATASET_PATH / "test" / class_name).mkdir(exist_ok=True)

    logger.info(f"Dataset structure created at: {DATASET_PATH}")
    return True


def print_download_instructions():
    """Print instructions for downloading the dataset"""
    instructions = """
╔════════════════════════════════════════════════════════════════════════════╗
║                 NEU SURFACE DEFECT DATABASE DOWNLOAD GUIDE                 ║
╚════════════════════════════════════════════════════════════════════════════╝

STEP 1: Install Kaggle CLI
    pip install kaggle

STEP 2: Get Your Kaggle API Credentials
    - Go to https://www.kaggle.com/settings/account
    - Click "Create New API Token"
    - Save the kaggle.json file to ~/.kaggle/ (Linux/Mac) or 
      C:\\Users\\<YourUsername>\\.kaggle\\ (Windows)
    - Run: chmod 600 ~/.kaggle/kaggle.json (Linux/Mac)

STEP 3: Download the Dataset
    - Open terminal/PowerShell in the project root directory
    - Run: kaggle datasets download -d kaustubhdikshit/neu-surface-defect-database
    - This will download a ZIP file (~2GB)

STEP 4: Extract the Dataset
    - Unzip the downloaded file to the 'dataset/' folder
    - Expected structure:
    
    dataset/
    ├── train/
    │   ├── Crazing/          (300 images)
    │   ├── Inclusion/        (300 images)
    │   ├── Patches/          (300 images)
    │   ├── Pitted_Surface/   (300 images)
    │   ├── Rolled-in_Scale/  (300 images)
    │   └── Scratches/        (300 images)
    └── test/
        ├── Crazing/          (100 images)
        ├── Inclusion/        (100 images)
        ├── Patches/          (100 images)
        ├── Pitted_Surface/   (100 images)
        ├── Rolled-in_Scale/  (100 images)
        └── Scratches/        (100 images)

STEP 5: Run Training Script
    cd ai-service
    python train.py

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATASET INFORMATION:
    - Total Images: 1,800 (1,500 train + 300 test)
    - Image Format: JPG
    - Image Size: ~200x200 pixels (will be resized to 224x224)
    - Defect Classes: 6 types
    - Source: Northeastern University

ALTERNATIVE DOWNLOAD METHOD:
    If Kaggle CLI doesn't work:
    1. Visit: https://www.kaggle.com/datasets/kaustubhdikshit/neu-surface-defect-database
    2. Click "Download" button (requires Kaggle account)
    3. Extract to dataset/ folder
    4. Run: python organize_dataset.py (if needed)

TROUBLESHOOTING:
    - If extraction creates extra nested folders, run organize_dataset.py
    - Make sure class names match exactly (including underscores)
    - Check image count: train should have ~1500 images, test ~300 images

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    """
    print(instructions)


def verify_dataset():
    """Verify dataset structure and count images"""
    logger.info("Verifying dataset structure...")

    classes = [
        "Crazing",
        "Inclusion",
        "Patches",
        "Pitted_Surface",
        "Rolled-in_Scale",
        "Scratches"
    ]

    print("\n" + "="*70)
    print("DATASET VERIFICATION REPORT")
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

        status_train = "✓" if train_count > 0 else "✗"
        status_test = "✓" if test_count > 0 else "✗"

        print(f"{class_name:20} | Train: {status_train} {train_count:4} images | Test: {status_test} {test_count:3} images")

    print("-"*70)
    print(f"{'TOTAL':20} | Train: {total_train:4} images | Test: {total_test:3} images")
    print("="*70)

    if total_train > 0 and total_test > 0:
        logger.info("✓ Dataset verified successfully!")
        return True
    else:
        logger.error("✗ Dataset verification failed. Please check the dataset structure.")
        return False


def main():
    """Main function"""
    print("\n" + "="*70)
    print("NEU SURFACE DEFECT DATABASE SETUP")
    print("="*70 + "\n")

    # Create directory structure
    create_dataset_structure()

    # Print download instructions
    print_download_instructions()

    # Check if dataset exists
    if (DATASET_PATH / "train").exists():
        print("\nVerifying existing dataset...")
        if verify_dataset():
            logger.info("\nDataset is ready for training!")
            logger.info("Run: python train.py")
        else:
            logger.warning("\nDataset structure incomplete. Please download the dataset.")


if __name__ == "__main__":
    main()
