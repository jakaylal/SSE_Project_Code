# Setup

## 1. Install Python Dependencies

Run this command to install all required libraries:

```bash
pip install torch torchvision numpy fastapi uvicorn Pillow opencv-python scikit-learn
```

Or use the requirements.txt file:

```bash
pip install -r requirements.txt
```

## 2. Download the Dataset

Download the Chest X-Ray Pneumonia dataset from Kaggle:
https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia

Extract the folder so the path is:
```
app/model/chest_xray/chest_xray/
├── test/
├── train/
└── val/
```

## 3. Download Pre-trained Model Weights

Download the pre-trained DenseNet121 model weights:
https://drive.google.com/file/d/1xeBS5xd0mklC3b0c0v1j0E4U2kgvmb/view

Save as: `app/model/DenseNet121model_prototype.pth`

## 4. Run the API (Local)

```bash
cd app/model
uvicorn main:app --reload
```

Then open http://localhost:8000 in your browser.

## 5. Run with Docker

### Build the image:
```bash
docker build -t color-vision-api .
```

### Run the container:
```bash
docker run -v /path/to/chest_xray:/app/app/model/chest_xray \
           -v /path/to/DenseNet121model_prototype.pth:/app/app/model/DenseNet121model_prototype.pth \
           -p 8000:8000 \
           color-vision-api
```

Replace `/path/to/` with the actual paths to your dataset and model files on your computer.
