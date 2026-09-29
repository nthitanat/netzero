#!/usr/bin/env python3
"""Content-addressed portable skill releases; no dependencies or repository access."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile

NAME = 'general-architecture'
ROOT = Path(__file__).resolve().parents[1]


def inventory(root):
    files = {}
    for path in sorted(root.rglob('*')):
        if path.is_symlink():
            raise ValueError(f'Symlink inside package: {path}')
        if path.is_file() and path.relative_to(root).as_posix() != 'RELEASE.json':
            files[path.relative_to(root).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
    if 'SKILL.md' not in files or 'scripts/release.py' not in files:
        raise ValueError('Incomplete skill package')
    return files


def manifest(root):
    files = inventory(root)
    revision = hashlib.sha256(json.dumps(files, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    return {'name': NAME, 'revision': revision, 'files': files}


def verify(root, expected=None):
    actual = manifest(root)
    recorded = json.loads((root / 'RELEASE.json').read_text())
    if recorded != actual or (expected is not None and actual != expected):
        raise ValueError(f'Content/revision mismatch: {root}')
    return actual


def destination(home, revision):
    return home / 'skill-releases' / NAME / revision


def install(home, selected):
    target = destination(home, selected['revision'])
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists() or target.is_symlink():
        if target.is_symlink():
            raise ValueError(f'Release path must not be a symlink: {target}')
        verify(target, selected)
    else:
        stage = Path(tempfile.mkdtemp(prefix='.stage-', dir=target.parent))
        try:
            shutil.copytree(ROOT, stage, dirs_exist_ok=True)
            verify(stage, selected)
            stage.rename(target)
        finally:
            if stage.exists():
                shutil.rmtree(stage)


def activate(home, selected):
    alias = home / 'skills' / NAME
    alias.parent.mkdir(parents=True, exist_ok=True)
    if alias.exists() and not alias.is_symlink():
        raise ValueError(f'Discovery path is not a symlink; preserve and relocate it before retrying: {alias}')
    # Same-directory replacement is atomic for each individual link.
    with tempfile.TemporaryDirectory(prefix='.activate-', dir=alias.parent) as stage:
        link = Path(stage) / NAME
        link.symlink_to(os.path.relpath(destination(home, selected['revision']), alias.parent),
                        target_is_directory=True)
        os.replace(link, alias)


def activate_all(homes, selected):
    previous = {}
    for home in homes:
        alias = home / 'skills' / NAME
        if alias.exists() and not alias.is_symlink():
            raise ValueError(f'Discovery path is not a symlink: {alias}')
        previous[home] = os.readlink(alias) if alias.is_symlink() else None
    changed = []
    try:
        for home in homes:
            activate(home, selected)
            changed.append(home)
            check_home(home, selected, False)
    except (OSError, ValueError):
        for home in reversed(changed):
            alias = home / 'skills' / NAME
            try:
                if previous[home] is None:
                    alias.unlink()
                else:
                    with tempfile.TemporaryDirectory(prefix='.restore-', dir=alias.parent) as stage:
                        link = Path(stage) / NAME
                        link.symlink_to(previous[home], target_is_directory=True)
                        os.replace(link, alias)
            except OSError as error:
                print(f'ROLLBACK FAILED {home}: {error}; repair discovery before completion', file=sys.stderr)
        raise


def check_home(home, selected, pinned):
    target = destination(home, selected['revision'])
    if target.is_symlink():
        raise ValueError(f'Release path must not be a symlink: {target}')
    verify(target, selected)
    alias = home / 'skills' / NAME
    try:
        if not alias.is_symlink() or alias.resolve() != target.resolve():
            raise ValueError(f'Discovery does not point to selected release: {alias}')
        verify(alias, selected)
    except (OSError, ValueError) as error:
        if not pinned:
            raise ValueError(f'Discovery differs or is unavailable in {home}; resolve the adopted pinned copy explicitly (--pinned): {error}') from error
        print(f'PINNED {home}: discovery unchanged; use {target}')
    print(f'VERIFIED {home}: {selected["revision"]}')


def word_counts(root):
    """Whitespace words; entry excludes YAML, references and history stay separate."""
    entry = (root / 'SKILL.md').read_text()
    parts = entry.split('---', 2)
    if len(parts) != 3 or parts[0].strip():
        raise ValueError('SKILL.md must start with YAML frontmatter')
    counts = {'SKILL.md': len(parts[2].split())}
    for directory in ('references', 'logs'):
        for path in sorted((root / directory).rglob('*.md')):
            counts[path.relative_to(root).as_posix()] = len(path.read_text().split())
    return counts


def measure(root, baseline=None):
    before = {}
    if baseline is not None:
        verify(baseline)
        before = word_counts(baseline)
    after = word_counts(root)
    files = {}
    for name in sorted(before.keys() | after.keys()):
        files[name] = {'after': after.get(name, 0)}
        if baseline is not None:
            files[name].update(before=before.get(name, 0),
                               delta=after.get(name, 0) - before.get(name, 0))
    return {'files': files, 'entry_target_words': [300, 500],
            'entry_within_target': 300 <= after['SKILL.md'] <= 500,
            'instruction_words_after': sum(count for name, count in after.items()
                                           if not name.startswith('logs/')),
            'note': 'Measurements only; review loading, consistency, and exceptions separately.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['seal', 'verify', 'install', 'measure'])
    parser.add_argument('--homes', nargs='+', type=Path)
    parser.add_argument('--pinned', action='store_true', help='With verify only: check retained project pins without requiring discovery to match')
    parser.add_argument('--baseline', type=Path, help='Verified previous package for word-count comparison')
    args = parser.parse_args()
    if args.action == 'measure':
        if args.homes or args.pinned:
            parser.error('measure operates only on source and baseline packages')
        print(json.dumps(measure(ROOT, args.baseline.expanduser() if args.baseline else None), indent=2))
        return 0
    if args.baseline:
        parser.error('--baseline is only valid with measure')
    if args.action == 'seal':
        if args.homes or args.pinned:
            parser.error('seal operates only on the source package')
        selected = manifest(ROOT)
        (ROOT / 'RELEASE.json').write_text(json.dumps(selected, indent=2, sort_keys=True) + '\n')
        print(selected['revision'])
        return 0
    if args.action == 'install' and args.pinned:
        parser.error('--pinned is verification-only; installs must update both defaults')
    selected = verify(ROOT)
    homes = args.homes
    if args.action == 'install' and not homes:
        homes = [Path.home() / '.codex', Path.home() / '.codex-office']
    if not homes:
        print(f'VERIFIED package: {selected["revision"]}')
        return 0
    homes = list(dict.fromkeys(home.expanduser().resolve() for home in homes))
    failures = []
    for home in homes:
        try:
            if args.action == 'install':
                install(home, selected)
            else:
                check_home(home, selected, args.pinned)
        except (OSError, ValueError) as error:
            failures.append(str(home))
            print(f'FAILED {home}: {error}', file=sys.stderr)
    if failures:
        print('INCOMPLETE; repair and rerun the selected revision: ' + ', '.join(failures), file=sys.stderr)
        return 1
    if args.action == 'install':
        try:
            activate_all(homes, selected)
        except (OSError, ValueError) as error:
            print(f'INCOMPLETE activation: {error}; repair and rerun this release', file=sys.stderr)
            return 1
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (OSError, ValueError) as error:
        print(f'FAILED: {error}', file=sys.stderr)
        sys.exit(1)
