import torch.nn.functional as F
from torchvision import transforms
from PIL import Image

class_names = ['NORMAL', 'PNEUMONIA']

def IdentifyImage(image_path, dynamicEnhance=False):
    image = Image.open(image_path).convert("L") # Converts the image to grayscale 

    if dynamicEnhance:
        # Insert your DCE or CLAHE preprocessing here if needed
        pass

    fixed_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.Grayscale(num_output_channels=3),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ])

    input_tensor = fixed_transform(image).unsqueeze(0)

    global model
    with torch.no_grad():
        output = model(input_tensor)
        probabilities = F.softmax(output, dim=1)[0]

    use_len = min(len(probabilities), len(class_names))

    prediction_results = {}
    for i in range(use_len):
        prediction_results[class_names[i]] = float(probabilities[i].cpu())

    max_prob, max_index = torch.max(probabilities, 0)
    predicted_class = class_names[max_index] if max_index < len(class_names) else f"Class_{max_index}"

    return {
        "prediction_results": prediction_results,
        "predicted_class": predicted_class,
        "confidence": float(max_prob.cpu())
    }

# No execution on import
