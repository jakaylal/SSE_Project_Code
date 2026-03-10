import os
import torchvision.transforms as transforms # Import transforms


class Config:
    # Training Settings
    IMG_SIZE = 224 
    BATCH_SIZE = 32
    LEARNING_RATE = 1e-4
    NUM_EPOCHS = 25

    fixed_transform = transforms.Compose([
        transforms.Resize((IMG_SIZE,IMG_SIZE)),
        transforms.Grayscale(num_output_channels=3),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5,0.5,0.5], std=[0.5,0.5,0.5])
    ])

    # Data Paths - Use absolute paths based on config.py location
    # Get the directory where config.py is located
    CONFIG_DIR = os.path.dirname(os.path.abspath(__file__))
    # Get the project root (parent of Backend folder)
    PROJECT_ROOT = os.path.dirname(CONFIG_DIR)

    FRONTEND_DIR = os.path.join(PROJECT_ROOT, "Frontend", "ColorVisionWebsite")
    
    BASE_ROOT = os.path.join(PROJECT_ROOT, "Backend")
    DATA_ROOT = os.path.join(PROJECT_ROOT, "Backend", "chest_xray", "chest_xray")
    SAVED_MODEL_PATH = os.path.join(BASE_ROOT,"DenseNet121model_prototype.pth")

    TRAIN_PATH = os.path.join(DATA_ROOT, "train")
    VAL_PATH = os.path.join(DATA_ROOT, "val")
    TEST_PATH = os.path.join(DATA_ROOT, "test")


    # Test images
    test_image0 = os.path.join(BASE_ROOT, "test_images", "14f8c2fcbb4c6f58f82914e6e6b7462896914811-3537x2831.jpg")
    test_image1 = os.path.join(BASE_ROOT, "test_images", "NORMAL2-IM-0361-0001.jpeg")
    test_image2 = os.path.join(BASE_ROOT, "test_images", "NORMAL2-IM-0368-0001.jpeg")
    test_image3 = os.path.join(BASE_ROOT, "test_images", "NORMAL2-IM-0378-0001.jpeg")
    test_image4 = os.path.join(BASE_ROOT, "test_images", "person1655_virus_2861.jpeg")
    test_image5 = os.path.join(BASE_ROOT, "test_images", "person1662_virus_2875.jpeg")
    test_image6 = os.path.join(BASE_ROOT, "test_images", "person1669_virus_2885.jpeg")
    test_image7 = os.path.join(BASE_ROOT, "test_images", "person1678_virus_2895.jpeg")
