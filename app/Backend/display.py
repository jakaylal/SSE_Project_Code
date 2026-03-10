import torch
import torch.nn.functional as F
import cv2
import numpy as np
from PIL import Image
import torchvision.models as models
from config import Config
import base64
import io

class Display:
    def __init__(self):
        self.class_names = ["NORMAL", "PNEUMONIA"]
        self.model = models.densenet121(pretrained=True)

    def DCE(self, pil_image):
        gray = np.array(pil_image.convert("L"))
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl1 = clahe.apply(gray)
        cl1_rgb = cv2.cvtColor(cl1, cv2.COLOR_GRAY2RGB)
        return Image.fromarray(cl1_rgb)

    def generate_heatmap(self, model, input_tensor, target_class):
        gradients = []
        activations = []

        def backward_hook(module, grad_input, grad_output):
            gradients.append(grad_output[0].detach())

        def forward_hook(module, input, output):
            activations.append(output.detach())

        target_layer = model.features[-1]
        forward_handle = target_layer.register_forward_hook(forward_hook)
        backward_handle = target_layer.register_backward_hook(backward_hook)

        output = model(input_tensor)
        model.zero_grad()
        class_score = output[0, target_class]
        class_score.backward()

        grads = gradients[0]
        acts = activations[0]

        weights = grads.mean(dim=(2,3), keepdim=True)
        cam = (weights * acts).sum(dim=1, keepdim=True)
        cam = F.relu(cam)

        cam = cam.squeeze().cpu().numpy()
        cam = cv2.resize(cam, (224, 224))
        cam = cam - np.min(cam)
        cam = cam / np.max(cam)

        forward_handle.remove()
        backward_handle.remove()

        return cam

    def overlay_heatmap(self, img, heatmap):
        heatmap = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)
        img = np.array(img)
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        overlay = cv2.addWeighted(heatmap, 0.4, img, 0.6, 0)
        return cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB)

    def _image_to_base64(self, pil_image):
        buffered = io.BytesIO()
        pil_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return img_str

    def identify_image(self, image_path=Config.test_image0, dynamicEnhance=False):
        # Create config instance if needed
        config_instance = Config()
        
        # Use default test image if no path provided
        if image_path is None:
            image_path = config_instance.test_image1
        
        image = Image.open(image_path).convert("L")

        if dynamicEnhance:
            image = self.DCE(image)
            image = image.convert("L")

        input_tensor = config_instance.fixed_transform(image).unsqueeze(0)
        input_tensor.requires_grad_()

        output = self.model(input_tensor)
        probabilities = torch.nn.functional.softmax(output, dim=1)[0]
        _, predicted = torch.max(probabilities, 0)

        heatmap = self.generate_heatmap(self.model, input_tensor, predicted.item())
        overlay = self.overlay_heatmap(image.resize((224, 224)), heatmap)

        original_b64 = self._image_to_base64(image)
        heatmap_b64 = self._image_to_base64(Image.fromarray(overlay))

        prediction_label = self.class_names[predicted.item()]
        confidence = probabilities[predicted].item()

        return {
            "original_image": original_b64,
            "heatmap_image": heatmap_b64,
            "prediction": prediction_label,
            "confidence": confidence
        }
