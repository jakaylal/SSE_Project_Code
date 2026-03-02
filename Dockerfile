# Use Python base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create model directory
RUN mkdir -p app/model/chest_xray

# Expose port for FastAPI
EXPOSE 8000

# Run the FastAPI server
# Note: You'll need to mount the dataset and model files
# docker run -v /path/to/chest_xray:/app/app/model/chest_xray -v /path/to/model.pth:/app/app/model/DenseNet121model_prototype.pth -p 8000:8000 image-name
CMD ["uvicorn", "app.model.main:app", "--host", "0.0.0.0", "--port", "8000"]
