import sys, json
from graphify.extract import collect_files, extract
from pathlib import Path

detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8'))
code_files = [Path(f) for f in detect.get('files', {}).get('code', [])]

if code_files:
    # Use the current directory as the base for relative paths in the graph
    result = extract(code_files, cache_root=Path('.'))
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(f"AST: {len(result['nodes'])} nodes, {len(result['edges'])} edges")
else:
    empty = {'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps(empty, indent=2), encoding='utf-8')
    print("No code files found.")
