from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse
from typing import List
import os
import shutil
from pathlib import Path
from trainer import Trainer
from display import Display
from config import Config

import torch
from PIL import Image
import io
import torchvision.transforms as transforms
from fastapi.responses import FileResponse


app = FastAPI()


config = Config()

frontend = os.path.join(config.FRONTEND_DIR, "index.html")

@app.get("/")
def home():
    # return {"message": "API is up and running!"}
    return FileResponse(frontend, media_type="text/html", status_code=200)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        display = Display()
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


# Create upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/upload")
async def upload_single_file(file: UploadFile = File(...)):
    """Upload a single file with basic validation"""
    if file.filename == "":
        raise HTTPException(status_code=400, detail="No file selected")

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": file.size,
        "location": str(file_path)
    }


@app.post("/train")
async def train():
    try:
        trainer = Trainer()
        trainer.train_model()
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Training failed: {str(e)}"})
    return {"message": "Training completed successfully"}


@app.get("/test")
async def test():
    return {"message": "Test endpoint is working"}
