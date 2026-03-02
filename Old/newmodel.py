import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import torchvision
import torchvision.transforms as transforms # Import transforms
import torchvision.datasets as datasets # Import datasets
import torchvision.models as models # Import models
import numpy as np
import os

def UpdateTransform():
    return transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.RandomHorizontalFlip(),
    # Added a random vertical flip to the dataset
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5,0.5,0.5], std=[0.5,0.5,0.5])
])

transform = UpdateTransform()
fixed_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5,0.5,0.5], std=[0.5,0.5,0.5])
])

# Load dataset folders
train_dataset = datasets.ImageFolder(root="/kaggle/input/chest-xray-pneumonia/chest_xray/chest_xray/train", transform=transform)
val_dataset = datasets.ImageFolder(root="/kaggle/input/chest-xray-pneumonia/chest_xray/chest_xray/val", transform=fixed_transform)
test_dataset = datasets.ImageFolder(root="/kaggle/input/chest-xray-pneumonia/chest_xray/chest_xray/test", transform=fixed_transform)

# Create loaders
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)
test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)

#Load neural network
model = models.densenet121(pretrained=True) #3rd Model
#model.fc = nn.Linear(model.fc.in_features, 2)

#Moves workload to GPU if available, else CPU
try:
    import torch_xla.core.xla_model as xm
    device = xm.xla_device()
    print("Using TPU")
except ImportError:
    if torch.cuda.is_available():
        device = torch.device("cuda")
        print("Using GPU")
    else:
        device = torch.device("cpu")
        print("Using CPU")

model = model.to(device)

#Accuracy criteria
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-4)

def TrainModel():
  #Trains on entire dataset for x different iterations
  num_epochs = 5
  #Training loop
  for epoch in range(num_epochs):
      #Sets model to train, running_loss keeps track of accuracy
      model.train()
      running_loss = 0.0
      iteration_count = 0

      if (epoch + 1) % 10 == 0:
            transform = UpdateTransform()
            train_dataset.transform = transform

      for images, labels in train_loader:
          images = images.to(device)
          labels = labels.to(device)

          optimizer.zero_grad()
          outputs = model(images)
          loss = criterion(outputs, labels)
          loss.backward()
          if 'torch_xla' in globals() and isinstance(device, type(xm.xla_device())):
              xm.optimizer_step(optimizer)
              xm.mark_step()
          else:
              optimizer.step()

          running_loss += loss.item()
          iteration_count += 1
      print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {running_loss/len(train_loader):.4f}")
      ValidateModel(val_loader)

def ValidateModel(loader_set):
  model.eval()
  correct = 0
  total = 0
  with torch.no_grad():
      for images, labels in loader_set:
          images = images.to(device)
          labels = labels.to(device)
          outputs = model(images)
          _, predicted = torch.max(outputs.data, 1)
          total += labels.size(0)
          correct += (predicted == labels).sum().item()

  print(f'Validation Accuracy: {100 * correct / total:.2f}%')


if __name__ == "__main__":
  ValidateModel(test_loader)
  TrainModel()
  ValidateModel(test_loader)
  torch.save(model.state_dict(), "DenseNet121model_prototype.pth")
  print("Model saved")