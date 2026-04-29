import os
import requests
import time
import glob

API_URL = "http://127.0.0.1:8000/api/predict"


def test_models():
    base_dir = "models/Test Images"

    selected_folders = [
        "Eggplant__Leaf_Spot_Disease",
        "Guava__Algal_Leaf_Spot",
        "Tomato__Bacterial_Spot",
    ]

    for folder in selected_folders:
        folder_path = os.path.join(base_dir, folder)
        if not os.path.isdir(folder_path):
            continue

        images = glob.glob(os.path.join(folder_path, "*.jpg")) + glob.glob(
            os.path.join(folder_path, "*.JPG")
        )
        if not images:
            continue
        test_image = images[0]
        print(f"\n--- Testing model pipeline with image: {test_image} ---")
        try:
            with open(test_image, "rb") as img_file:
                files = {"file": (os.path.basename(test_image), img_file, "image/jpeg")}
                start_time = time.time()
                response = requests.post(API_URL, files=files)
                end_time = time.time()

                if response.status_code == 200:
                    data = response.json().get("data", {})
                    print(f"SUCCESS ({end_time - start_time:.2f}s)")
                    print(f"Prediction: {data.get('class')}")
                    treatment = data.get("treatment", "")
                    print(f"Treatment Preview: {treatment[:400]}...")
                else:
                    print("FAILED")
        except Exception as e:
            print(e)


test_models()
