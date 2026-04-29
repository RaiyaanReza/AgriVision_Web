import os
import requests
import time
import glob

API_URL = "http://127.0.0.1:8000/api/predict"


def test_models():
    base_dir = "models/Test Images"
    if not os.path.exists(base_dir):
        print(f"Directory {base_dir} not found.")
        return

    # Select one folder for some major crops: Brassica(Cabbage/Cauliflower), Corn, Potato, Rice
    test_folders = [
        "Cabbage__Alternaria_Spot",
        "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
        "Potato___Early_blight",
        "Rice__BrownSpot",  # just guessing folder names
    ]

    # Try to find one image per model if possible
    # We will just pick 1 random image from the first 5 folders to test the pipeline
    folders = os.listdir(base_dir)
    selected_folders = []

    # Let's dynamically pick one Cabbage, one Corn, one Potato, one Rice folder
    for f in folders:
        f_lower = f.lower()
        if "cabbage" in f_lower and not any(
            "cabbage" in sf.lower() for sf in selected_folders
        ):
            selected_folders.append(f)
        elif "corn" in f_lower and not any(
            "corn" in sf.lower() for sf in selected_folders
        ):
            selected_folders.append(f)
        elif "potato" in f_lower and not any(
            "potato" in sf.lower() for sf in selected_folders
        ):
            selected_folders.append(f)
        elif "rice" in f_lower and not any(
            "rice" in sf.lower() for sf in selected_folders
        ):
            selected_folders.append(f)

    if not selected_folders:
        selected_folders = folders[:4]  # fallback

    for folder in selected_folders:
        folder_path = os.path.join(base_dir, folder)
        if not os.path.isdir(folder_path):
            continue

        images = (
            glob.glob(os.path.join(folder_path, "*.jpg"))
            + glob.glob(os.path.join(folder_path, "*.JPG"))
            + glob.glob(os.path.join(folder_path, "*.png"))
        )
        if not images:
            print(f"No images found in {folder}")
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
                    data = response.json()
                    print(f"SUCCESS ({end_time - start_time:.2f}s)")
                    print(f"Prediction: {data.get('data', {}).get('class')}")
                    print(f"Is Disease: {data.get('data', {}).get('is_disease')}")
                    treatment = data.get("data", {}).get("treatment", "")
                    print(f"Treatment Preview: {treatment[:100]}...")
                else:
                    print(f"FAILED with status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Error testing {test_image}: {e}")


if __name__ == "__main__":
    print("Testing models through API...")
    test_models()
    print("\nTesting complete.")
