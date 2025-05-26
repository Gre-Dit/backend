import tensorflow as tf
import numpy as np
from PIL import Image
import json
import os
import requests
from io import BytesIO
from urllib.parse import urlparse
import sys

# Constants
MODEL_FILE_NAME = "my_model.h5"
MODEL_DRIVE_ID = "1qSe2xxYluQlU5tuxLLocQaDVv6FyGja0"
MODEL_URL = f"https://drive.google.com/uc?id={MODEL_DRIVE_ID}"

# Label mapping
label_mapping = {
    'aloevera': 0, 'banana': 1, 'bilimbi': 2, 'cantaloupe': 3, 'cassava': 4, 'coconut': 5,
    'corn': 6, 'cucumber': 7, 'curcuma': 8, 'eggplant': 9, 'galangal': 10, 'ginger': 11,
    'guava': 12, 'kale': 13, 'longbeans': 14, 'mango': 15, 'melon': 16, 'orange': 17,
    'paddy': 18, 'papaya': 19, 'peper chili': 20, 'pineapple': 21, 'pomelo': 22, 'shallot': 23,
    'soybeans': 24, 'spinach': 25, 'sweet potatoes': 26, 'tobacco': 27, 'waterapple': 28, 'watermelon': 29
}

index_to_label = {v: k for k, v in label_mapping.items()}


def download_model_if_needed(model_path: str, url: str) -> None:
    """
    Downloads the model from the given URL if it's not already present.
    """
    if not os.path.exists(model_path):
        print("Downloading model from Google Drive...")
        response = requests.get(url)
        response.raise_for_status()
        with open(model_path, 'wb') as f:
            f.write(response.content)
        print(f"Model saved to {model_path}.")


# Ensure model is downloaded
download_model_if_needed(MODEL_FILE_NAME, MODEL_URL)

# Load the model
model = tf.keras.models.load_model(MODEL_FILE_NAME)


def process_image(image_path: str, output_path: str = "output.json") -> None:
    """
    Accepts a local file path or a URL to an image, predicts the plant class,
    and writes the result to output.json.

    :param image_path: Path to local image or URL
    :param output_path: Path to output JSON file
    """
    try:
        # Load from URL
        if urlparse(image_path).scheme in ("http", "https"):
            response = requests.get(image_path)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content)).convert("RGB")
        # Load from local file
        elif os.path.exists(image_path):
            image = Image.open(image_path).convert("RGB")
        else:
            print(f"Image not found: {image_path}")
            return

        # Preprocess image
        image = image.resize((128, 128))
        image_array = np.array(image).astype('float32') / 255.0
        image_array = np.expand_dims(image_array, axis=0)

        # Predict
        prediction = model.predict(image_array)
        predicted_label_idx = np.argmax(prediction, axis=1)[0]
        predicted_class_name = index_to_label[predicted_label_idx]

        # Prepare output
        output = {
            "tree_name": predicted_class_name,
            "stage_name": "Seedling"
        }

        # Save output
        with open(output_path, "w") as f:
            json.dump(output, f)

        print(f"Prediction written to '{output_path}': {output}")

    except Exception as e:
        print(f"Error processing image: {e}")


# Optional: test run
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Image URL not provided"}))
        sys.exit(1)

    image_url = sys.argv[1]
    # image_url = "https://res.cloudinary.com/duxrvfqs9/image/upload/v1748269141/a1_vzh1ie.jpg"
    process_image(image_url)
