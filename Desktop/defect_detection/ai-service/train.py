"""
Training script for Metal Defect Detection Model
Trains ResNet50 on NEU Surface Defect Database
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms
from pathlib import Path
import logging
from tqdm import tqdm
import json
from PIL import Image
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import matplotlib.pyplot as plt
import seaborn as sns

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Hyperparameters
BATCH_SIZE = 32
LEARNING_RATE = 0.001
NUM_EPOCHS = 50
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
DATASET_PATH = Path("../dataset")
MODEL_SAVE_PATH = Path("model/defect_model.pth")
CHECKPOINT_PATH = Path("model/checkpoint_latest.pth")

# Class names
DEFECT_CLASSES = [
    "Crazing",
    "Inclusion",
    "Patches",
    "Pitted_Surface",
    "Rolled-in_Scale",
    "Scratches"
]

logger.info(f"Using device: {DEVICE}")


class MetalDefectDataset(Dataset):
    """Custom dataset for metal defect images"""

    def __init__(self, data_dir, transform=None):
        self.data_dir = Path(data_dir)
        self.transform = transform
        self.images = []
        self.labels = []

        # Load image paths and labels
        for class_idx, class_name in enumerate(DEFECT_CLASSES):
            class_dir = self.data_dir / class_name
            if not class_dir.exists():
                logger.warning(f"Class directory not found: {class_dir}")
                continue

            for img_path in class_dir.glob("*.jpg"):
                self.images.append(str(img_path))
                self.labels.append(class_idx)

        logger.info(f"Found {len(self.images)} images in {data_dir}")

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path = self.images[idx]
        label = self.labels[idx]

        try:
            image = Image.open(img_path).convert("RGB")
            if self.transform:
                image = self.transform(image)
            return image, label
        except Exception as e:
            logger.error(f"Error loading image {img_path}: {e}")
            # Return a black image and label on error
            return torch.zeros(3, 224, 224), label


def get_transforms():
    """Define image transformation pipelines"""
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    return train_transform, val_transform


def build_model():
    """Build ResNet50 model with custom head"""
    logger.info("Building ResNet50 model...")

    # Load pretrained ResNet50
    model = models.resnet50(pretrained=True)

    # Freeze backbone layers
    for param in model.parameters():
        param.requires_grad = False

    # Unfreeze last 2 layers for fine-tuning
    for param in model.layer4.parameters():
        param.requires_grad = True

    # Replace classification head
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_features, 512),
        nn.BatchNorm1d(512),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(512, 128),
        nn.BatchNorm1d(128),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(128, len(DEFECT_CLASSES))
    )

    return model.to(DEVICE)


def train_epoch(model, train_loader, criterion, optimizer, epoch):
    """Train for one epoch"""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    progress_bar = tqdm(train_loader, desc=f"Epoch {epoch + 1} [TRAIN]")

    for images, labels in progress_bar:
        images, labels = images.to(DEVICE), labels.to(DEVICE)

        # Forward pass
        outputs = model(images)
        loss = criterion(outputs, labels)

        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        # Statistics
        running_loss += loss.item()
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

        # Update progress bar
        avg_loss = running_loss / (progress_bar.n + 1)
        acc = 100 * correct / total
        progress_bar.set_postfix({"loss": f"{avg_loss:.4f}", "acc": f"{acc:.2f}%"})

    epoch_loss = running_loss / len(train_loader)
    epoch_acc = 100 * correct / total

    logger.info(f"Epoch {epoch + 1} - Train Loss: {epoch_loss:.4f}, Accuracy: {epoch_acc:.2f}%")
    return epoch_loss, epoch_acc


def validate(model, val_loader, criterion, epoch):
    """Validate model"""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    all_preds = []
    all_labels = []

    progress_bar = tqdm(val_loader, desc=f"Epoch {epoch + 1} [VAL]")

    with torch.no_grad():
        for images, labels in progress_bar:
            images, labels = images.to(DEVICE), labels.to(DEVICE)

            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

            avg_loss = running_loss / (progress_bar.n + 1)
            acc = 100 * correct / total
            progress_bar.set_postfix({"loss": f"{avg_loss:.4f}", "acc": f"{acc:.2f}%"})

    epoch_loss = running_loss / len(val_loader)
    epoch_acc = 100 * correct / total

    logger.info(f"Epoch {epoch + 1} - Val Loss: {epoch_loss:.4f}, Accuracy: {epoch_acc:.2f}%")

    return epoch_loss, epoch_acc, all_preds, all_labels


def train():
    """Main training function"""
    # Check dataset exists
    train_dir = DATASET_PATH / "train"
    test_dir = DATASET_PATH / "test"

    if not train_dir.exists() or not test_dir.exists():
        logger.error(f"Dataset not found at {DATASET_PATH}")
        logger.error("Please download the NEU Surface Defect Database from Kaggle:")
        logger.error("https://www.kaggle.com/datasets/kaustubhdikshit/neu-surface-defect-database")
        logger.error(f"And extract it to {DATASET_PATH}")
        return False

    # Create model save directory
    MODEL_SAVE_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Get transforms
    train_transform, val_transform = get_transforms()

    # Create datasets
    logger.info("Loading datasets...")
    train_dataset = MetalDefectDataset(train_dir, transform=train_transform)
    val_dataset = MetalDefectDataset(test_dir, transform=val_transform)

    if len(train_dataset) == 0:
        logger.error("No training images found!")
        return False

    # Create dataloaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=0,
        pin_memory=True
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=0,
        pin_memory=True
    )

    logger.info(f"Train samples: {len(train_dataset)}, Val samples: {len(val_dataset)}")

    # Build model
    model = build_model()

    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), 
                          lr=LEARNING_RATE)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', 
                                                     factor=0.5, patience=5, verbose=True)

    # Training loop
    best_val_acc = 0.0
    best_val_loss = float('inf')
    train_losses, val_losses = [], []
    train_accs, val_accs = [], []

    logger.info("Starting training...")
    logger.info(f"Total epochs: {NUM_EPOCHS}")

    for epoch in range(NUM_EPOCHS):
        # Train
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, epoch)
        train_losses.append(train_loss)
        train_accs.append(train_acc)

        # Validate
        val_loss, val_acc, preds, labels = validate(model, val_loader, criterion, epoch)
        val_losses.append(val_loss)
        val_accs.append(val_acc)

        # Learning rate scheduling
        scheduler.step(val_loss)

        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_val_loss = val_loss
            logger.info(f"Saving best model with accuracy: {best_val_acc:.2f}%")
            torch.save(model.state_dict(), MODEL_SAVE_PATH)

        # Save latest checkpoint
        torch.save({
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'train_loss': train_loss,
            'val_loss': val_loss,
            'train_acc': train_acc,
            'val_acc': val_acc
        }, CHECKPOINT_PATH)

        # Early stopping
        if epoch - train_losses.index(min(train_losses)) > 15:
            logger.info("Early stopping triggered")
            break

    logger.info("Training completed!")
    logger.info(f"Best validation accuracy: {best_val_acc:.2f}%")
    logger.info(f"Model saved to: {MODEL_SAVE_PATH}")

    # Final evaluation
    model.eval()
    all_preds = []
    all_labels = []

    with torch.no_grad():
        for images, labels in tqdm(val_loader, desc="Final Evaluation"):
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            outputs = model(images)
            _, predicted = torch.max(outputs.data, 1)
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    # Print classification report
    logger.info("\nClassification Report:")
    logger.info(classification_report(all_labels, all_preds, target_names=DEFECT_CLASSES))

    # Plot training curves
    plot_training_curves(train_losses, val_losses, train_accs, val_accs)

    # Save training metrics
    save_training_metrics({
        'train_losses': train_losses,
        'val_losses': val_losses,
        'train_accs': train_accs,
        'val_accs': val_accs,
        'best_val_acc': best_val_acc,
        'classes': DEFECT_CLASSES
    })

    return True


def plot_training_curves(train_losses, val_losses, train_accs, val_accs):
    """Plot training and validation curves"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

    # Loss curve
    ax1.plot(train_losses, label='Train Loss', linewidth=2)
    ax1.plot(val_losses, label='Val Loss', linewidth=2)
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Loss')
    ax1.set_title('Training and Validation Loss')
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # Accuracy curve
    ax2.plot(train_accs, label='Train Accuracy', linewidth=2)
    ax2.plot(val_accs, label='Val Accuracy', linewidth=2)
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Accuracy (%)')
    ax2.set_title('Training and Validation Accuracy')
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig('model/training_curves.png', dpi=100)
    logger.info("Training curves saved to model/training_curves.png")
    plt.close()


def save_training_metrics(metrics):
    """Save training metrics to JSON"""
    with open('model/training_metrics.json', 'w') as f:
        json.dump({
            'train_losses': metrics['train_losses'],
            'val_losses': metrics['val_losses'],
            'train_accs': metrics['train_accs'],
            'val_accs': metrics['val_accs'],
            'best_val_acc': float(metrics['best_val_acc']),
            'classes': metrics['classes']
        }, f, indent=4)
    logger.info("Training metrics saved to model/training_metrics.json")


if __name__ == "__main__":
    success = train()
    if not success:
        exit(1)
