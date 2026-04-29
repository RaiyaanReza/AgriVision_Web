import json
from graphify.detect import detect
from pathlib import Path
result = detect(Path('.'))
with open('graphify-out/.graphify_detect.json', 'w', encoding='utf-8') as f:
    json.dump(result, f)

summary = {
    "total_files": result.get("total_files", 0),
    "total_words": result.get("total_words", 0),
    "code": len(result["files"].get("code", [])),
    "docs": len(result["files"].get("document", [])),
    "papers": len(result["files"].get("paper", [])),
    "images": len(result["files"].get("image", [])),
    "video": len(result["files"].get("video", [])),
}
print(json.dumps(summary))
