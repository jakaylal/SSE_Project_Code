from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse
from trainer import Trainer
from display import Display
from config import Config

import torch
from PIL import Image
import io
import torchvision.transforms as transforms

app = FastAPI()

fixed_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])


config = Config()
trainer = Trainer()
display = Display()

@app.get("/")
def home():
    return {"message": "API is up and running!"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        # Save temporarily
        with open("temp_predict_image.png", "wb") as f:
            f.write(contents)

        # Get prediction and images
        result = display.identify_image("temp_predict_image.png")

        # Remove the temporary file if present
        import os
        os.remove("temp_predict_image.png")  # Ensure error handling here
        return result
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Model inference failed: {str(e)}"})


@app.post("/train")
async def train():
    try:
        trainer.train_model()
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Training failed: {str(e)}"})
    return {"message": "Training completed successfully"}


@app.get("/test")
async def test():
    return {"message": "Test endpoint is working"}
