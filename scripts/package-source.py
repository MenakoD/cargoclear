"""Package readable source, excluding private data, credentials and local state."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
import os
root = Path(__file__).resolve().parent.parent
excluded = {'docs', '.git', 'node_modules', '.wrangler', '.sites-runtime', 'dist', '.next', '.vinext', 'outputs', '.agents', '.codex', '__pycache__'}
preview = root / 'public' / 'source'
preview.mkdir(exist_ok=True)
for source, name in [('lib/checks.ts', 'comparison-rules.txt'), ('LEARNING_GUIDE.md', 'learning-guide.txt'), ('learning/missing_mrn.py', 'missing-mrn.txt')]:
    (preview / name).write_text((root / source).read_text(encoding='utf-8'), encoding='utf-8')
target = root / 'public' / 'cargoclear-source.zip'
with ZipFile(target, 'w', ZIP_DEFLATED, strict_timestamps=False) as archive:
    for directory, directories, files in os.walk(root):
        directories[:] = [name for name in directories if name not in excluded]
        for name in files:
            path = Path(directory) / name
            relative = path.relative_to(root)
            if path == target or name.startswith(('.env', '.dev.vars')) or path.suffix in {'.pem', '.tsbuildinfo', '.log'}:
                continue
            if relative.as_posix() == '.openai/hosting.json':
                archive.writestr(str(relative), json.dumps({'d1':'DB', 'r2':'BUCKET'}, indent=2))
            else:
                archive.write(path, relative)
print(f'Readable source package: {target.name}')
