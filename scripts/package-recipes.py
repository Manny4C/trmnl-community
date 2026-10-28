"""Rebuild deterministic downloadable Recipes from canonical trmnl source files."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import argparse
root = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('apps', nargs='*', help='App directory names; defaults to all apps')
args = parser.parse_args()
for app in sorted((root/'apps').iterdir()):
    if args.apps and app.name not in args.apps:
        continue
    source = app/'trmnl'
    if not source.is_dir():
        continue
    files = sorted(p for p in source.iterdir() if p.is_file())
    required = {'shared.liquid','full.liquid','half_horizontal.liquid','half_vertical.liquid','quadrant.liquid','form-fields.yml'}
    assert required <= {p.name for p in files}, f'{app.name}: incomplete package'
    prefix = 'one-more-room/' if app.name == 'one-more-room' else ''
    target = app/'public/plugin.zip'
    with ZipFile(target, 'w', compression=ZIP_DEFLATED) as archive:
        for file in files:
            entry = ZipInfo(prefix+file.name, date_time=(2026,10,27,0,0,0))
            entry.compress_type = ZIP_DEFLATED
            entry.external_attr = 0o644 << 16
            archive.writestr(entry,file.read_bytes())
    with ZipFile(target) as archive:
        for file in files:
            assert archive.read(prefix+file.name) == file.read_bytes()
    print(f'{app.name}: {len(files)} canonical files verified')
