import json
from graphify.build import build_merge
from graphify.cluster import cluster
from graphify.export import to_json
from pathlib import Path

# Load all fragments
fragments = []
for p in Path('graphify-out').glob('.graphify_chunk_*.json'):
    fragments.append(json.loads(p.read_text(encoding='utf-8')))

ast_path = Path('graphify-out/.graphify_ast.json')
if ast_path.exists():
    fragments.append(json.loads(ast_path.read_text(encoding='utf-8')))

# Merge them
full_graph = build_merge(fragments)
communities = cluster(full_graph)
to_json(full_graph, communities, 'graphify-out/.graphify_graph.json', force=True)
print(f"Merged: {len(full_graph['nodes'])} nodes, {len(full_graph['edges'])} edges")
