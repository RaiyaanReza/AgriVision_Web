import os
from pathlib import Path
import shutil

def prune_images(base_path, limit=10):
    base = Path(base_path)
    if not base.exists():
        print(f"Path not found: {base_path}")
        return
    
    print(f"Pruning images in: {base_path}")
    for class_dir in base.iterdir():
        if class_dir.is_dir():
            files = sorted([f for f in class_dir.iterdir() if f.is_file()])
            if len(files) > limit:
                print(f"  {class_dir.name}: Keeping {limit} of {len(files)} files")
                for f in files[limit:]:
                    try:
                        f.unlink()
                    except Exception as e:
                        print(f"    Error deleting {f}: {e}")

def delete_unnecessary_files():
    files_to_delete = [
        "backend_log.txt",
        "frontend_log.txt",
        "test_gemini_key.py",
        "graphify-out/run_detect.py",
        "graphify-out/summarize_detect.py",
        "graphify-out/top_subdirs.py"
    ]
    for f_str in files_to_delete:
        f = Path(f_str)
        if f.exists():
            print(f"Deleting unnecessary file: {f_str}")
            try:
                f.unlink()
            except Exception as e:
                print(f"  Error deleting {f_str}: {e}")

if __name__ == "__main__":
    # Prune images in both potential locations
    prune_images("models/Test Images")
    prune_images("backend/models/Models/Test Images")
    
    # Delete unnecessary files
    delete_unnecessary_files()
    
    print("Cleanup complete.")
