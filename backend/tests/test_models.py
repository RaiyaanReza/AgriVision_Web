import json
import mimetypes
import pathlib

import requests

BASE_URL = "http://localhost:8000/api"


def test_predict(image_path: str, label: str) -> None:
    image_file = pathlib.Path(image_path)
    if not image_file.exists():
        print(f"{label}: FILE NOT FOUND - {image_path}")
        return

    content_type = mimetypes.guess_type(str(image_file))[0] or "image/jpeg"

    try:
        with image_file.open("rb") as file_obj:
            response = requests.post(
                f"{BASE_URL}/predict",
                files={"image": (image_file.name, file_obj, content_type)},
                timeout=120,
            )
        data = response.json()
        first_disease = (data.get("disease_result") or [{}])[0]
        print(
            f"{label}: status={response.status_code} success={data.get('success')} "
            f"crop={data.get('crop_result', {}).get('crop')} "
            f"disease={first_disease.get('disease')}"
        )
    except Exception as exc:
        print(f"{label}: ERROR - {exc}")


def test_documents_and_rag() -> None:
    print("\n--- Testing Documents + RAG ---")
    try:
        with open("treatments.json", "r", encoding="utf-8") as handle:
            items = json.load(handle)

        import_response = requests.post(
            f"{BASE_URL}/documents/import", json=items, timeout=120
        )
        print(
            f"Import: status={import_response.status_code} body={import_response.json()}"
        )

        docs_response = requests.get(f"{BASE_URL}/documents", timeout=60)
        docs = docs_response.json()
        print(f"Documents: status={docs_response.status_code} count={len(docs)}")

        rag_response = requests.post(
            f"{BASE_URL}/rag/query",
            json={
                "question": "How to treat rice blast?",
                "cropType": "Rice",
                "llm": True,
            },
            timeout=180,
        )
        rag_data = rag_response.json()
        llm = rag_data.get("llm", {})
        print(
            "RAG LLM: "
            f"status={rag_response.status_code} enabled={llm.get('enabled')} "
            f"model={llm.get('model')} answer_length={len(llm.get('answer', ''))}"
        )
    except Exception as exc:
        print(f"Documents/RAG ERROR: {exc}")


print("--- Testing Predictions ---")
prediction_tests = [
    (
        r"E:\CSE499 Prototype\Models\Test Images\Cabbage__Alternaria_Spot\0001.jpg",
        "Brassica_Sample",
    ),
    (
        r"E:\CSE499 Prototype\Models\Test Images\Potato__Late_Blight\0001.jpg",
        "Potato_Sample",
    ),
    (
        r"E:\CSE499 Prototype\Models\Test Images\Rice__Leaf_Blast\0001.jpg",
        "Rice_Sample",
    ),
]

for test_path, test_label in prediction_tests:
    test_predict(test_path, test_label)

test_documents_and_rag()

print("\n--- Testing Health ---")
try:
    health_response = requests.get(f"{BASE_URL}/health", timeout=5)
    print(f"Health: status={health_response.status_code} body={health_response.json()}")
except Exception as exc:
    print(f"Health ERROR: {exc}")
