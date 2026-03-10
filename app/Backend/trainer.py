from config import Config
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


class Trainer:
    def __init__(self):
        self.config = Config()
        self.transform = self.UpdateTransform()
        self.create_dataset()

        #Load pretrained ImageNet weights
        self.model = models.densenet121(weights=models.DenseNet121_Weights.IMAGENET1K_V1)

        self.device = self.checkDevice()
        self.model = self.model.to(self.device)
        
        #Load your custom saved weights
        if os.path.exists(self.config.SAVED_MODEL_PATH):
            print(f"Loading custom weights from {self.config.SAVED_MODEL_PATH}")
            self.model.load_state_dict(torch.load(self.config.SAVED_MODEL_PATH, weights_only=True,map_location=torch.device('cpu')))
        else:
            print(f"Custom weights not found at {self.config.SAVED_MODEL_PATH}, using pretrained ImageNet weights")



    """
    Used to transform images for training the model.
    For the eval and testing, fixed transform is used.
    Fixed transform is in the config file.  
    """
    def UpdateTransform(self):
        return transforms.Compose([
            transforms.Resize((self.config.IMG_SIZE, self.config.IMG_SIZE)),
            transforms.Grayscale(num_output_channels=3),
            transforms.RandomHorizontalFlip(),
            transforms.RandomVerticalFlip(),
            transforms.RandomRotation(10),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5,0.5,0.5], std=[0.5,0.5,0.5])
        ])


    """
    Create the datasets and data loaders needed to train the model,
    All the variables are set in the config file.
    
    Attributes: 
        dataset (datasets): 3 variables for the datasets for each folder (train, test, val).
            uses the data paths and fixed_transform found in the config file.
    """

    def create_dataset(self):
        self.train_dataset = datasets.ImageFolder(root=self.config.TRAIN_PATH, transform=self.transform)
        self.val_dataset = datasets.ImageFolder(root=self.config.VAL_PATH, transform=self.config.fixed_transform)
        self.test_dataset = datasets.ImageFolder(root=self.config.TEST_PATH, transform=self.config.fixed_transform)

        self.train_loader = DataLoader(self.train_dataset, batch_size=self.config.BATCH_SIZE, shuffle=True)
        self.val_loader = DataLoader(self.val_dataset, batch_size=self.config.BATCH_SIZE, shuffle=False)
        self.test_loader = DataLoader(self.test_dataset, batch_size=self.config.BATCH_SIZE, shuffle=False)


    """
    Sets the current device for the model to be trained on.
    Prints the current device.

    Attributes: 
        device (xla_device): sets the current device to either GPU or CPU.

    """
    def checkDevice(self):
        # try:
        #     import torch_xla.core.xla_model as xm # type: ignore
        # except ImportError:    
        #     device = xm.xla_device()
        #     print("Using TPU")
        if torch.cuda.is_available():
            device = torch.device("cuda")
            print("Using GPU")
        else:
            device = torch.device("cpu")
            print("Using CPU")
        return device


    """
    This is the training function for the model.

    It Sets all the variables needed to train the model. 
        Those being: The device, criterion, and optimizer. 
        Then it trains the model for the amount of epochs defined in the config class. 
    
    After each epoch, it prints the epoch, the loss and the evaluation. 
    """
    def train_model(self):
        print(f"Training for {self.config.NUM_EPOCHS} epochs with learning rate {self.config.LEARNING_RATE}...")


        print("Creating datasets...")
        self.create_dataset()

        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = optim.Adam(self.model.parameters(), lr=self.config.LEARNING_RATE)

        num_epochs = self.config.NUM_EPOCHS

        for epoch in range(num_epochs):
            self.model.train() #Sets the model to the training state 
            running_loss = 0.0

            if (epoch + 1) % 10 == 0:
                transform = self.UpdateTransform()
                self.train_dataset.transform = transform

            for images, labels in self.train_loader:
                images = images.to(self.device)
                labels = labels.to(self.device)

                self.optimizer.zero_grad()
                outputs = self.model(images)
                loss = self.criterion(outputs, labels)
                loss.backward()

                if 'torch_xla' in globals() and isinstance(self.device, type(self.xm.xla_device())):
                    self.xm.optimizer_step(self.optimizer)
                    self.xm.mark_step()
                else:
                    self.optimizer.step()

                running_loss += loss.item()

            print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {running_loss/len(self.train_loader):.4f}")
            self.ValidateModel(self.val_loader)

    """
    Tests the images in the val folder and prints the validation accuracy. 
    This function is run for each epoch in the train_model function. 
    """
    def ValidateModel(self, loader_set):
        self.model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for images, labels in loader_set:
                images = images.to(self.device)
                labels = labels.to(self.device)
                outputs = self.model(images)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()

        print(f'Validation Accuracy: {100 * correct / total:.2f}%')
