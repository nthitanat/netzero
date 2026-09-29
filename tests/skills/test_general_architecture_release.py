"""Isolated distribution acceptance tests; never touch real Codex homes."""
import json
import runpy
from unittest.mock import patch
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

SOURCE = Path(__file__).resolve().parents[2] / 'skills/general-architecture'


class DistributionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name).resolve()
        self.package = self.root / 'standalone/general-architecture'
        shutil.copytree(SOURCE, self.package)
        self.homes = [self.root / 'home-a', self.root / 'home-b']
        self.old = json.loads((self.package / 'RELEASE.json').read_text())['revision']

    def tearDown(self):
        self.temp.cleanup()

    def run_release(self, action, *, package=None, homes=True, pinned=False, success=True):
        command = [sys.executable, str((package or self.package) / 'scripts/release.py'), action]
        if homes:
            command += ['--homes', *map(str, self.homes)]
        if pinned:
            command += ['--pinned']
        result = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(result.returncode == 0, success, result.stdout + result.stderr)
        return result

    def installed(self, home, revision=None):
        return home / 'skill-releases/general-architecture' / (revision or self.old)

    def test_portable_install_idempotent_and_full_contents(self):
        self.run_release('install')
        self.run_release('install')
        self.run_release('verify')
        for home in self.homes:
            self.assertEqual((home / 'skills/general-architecture').resolve(), self.installed(home))
            for path in self.package.rglob('*'):
                if path.is_file():
                    self.assertEqual(path.read_bytes(), (self.installed(home) / path.relative_to(self.package)).read_bytes())

    def test_update_advances_both_defaults_and_retains_project_pins(self):
        self.run_release('install')
        old_package = self.installed(self.homes[0])
        with (self.package / 'references/ADOPTION.md').open('a') as f:
            f.write('\nTest release clarification.\n')
        self.run_release('seal', homes=False)
        newer = json.loads((self.package / 'RELEASE.json').read_text())['revision']
        self.assertNotEqual(newer, self.old)
        self.run_release('install')
        self.run_release('verify')
        self.run_release('verify', package=old_package, pinned=True)
        for home in self.homes:
            self.assertEqual((home / 'skills/general-architecture').resolve(), self.installed(home, newer))
            self.assertTrue(self.installed(home, newer).exists())

    def test_partial_install_detected_then_repaired(self):
        self.homes[1].write_text('blocked destination')
        result = self.run_release('install', success=False)
        self.assertIn('INCOMPLETE', result.stderr)
        self.assertTrue(self.installed(self.homes[0]).exists())
        self.assertFalse((self.homes[0] / 'skills/general-architecture').is_symlink())
        self.homes[1].unlink()
        self.run_release('install')
        self.run_release('verify')

    def test_corrupt_release_refused_without_overwrite(self):
        self.run_release('install')
        path = self.installed(self.homes[1]) / 'SKILL.md'
        path.write_text('changed')
        self.run_release('verify', success=False)
        self.run_release('install', success=False)
        self.assertEqual(path.read_text(), 'changed')

    def test_missing_and_extra_files_detected(self):
        self.run_release('install')
        target = self.installed(self.homes[1])
        (target / 'extra.txt').write_text('unexpected')
        self.run_release('verify', success=False)
        (target / 'extra.txt').unlink()
        (target / 'references/ADOPTION.md').unlink()
        self.run_release('verify', success=False)

    def test_unavailable_revision_and_broken_alias(self):
        self.run_release('verify', success=False)
        self.run_release('install')
        alias = self.homes[1] / 'skills/general-architecture'
        alias.unlink()
        alias.symlink_to('unavailable')
        self.run_release('install')
        self.run_release('verify')
        self.assertEqual(alias.resolve(), self.installed(self.homes[1]))

    def test_real_directory_conflict_preserves_both_defaults(self):
        self.run_release('install')
        alias = self.homes[1] / 'skills/general-architecture'
        alias.unlink()
        alias.mkdir()
        (alias / 'keep.txt').write_text('preserve me')
        with (self.package / 'references/ADOPTION.md').open('a') as f:
            f.write('\nChanged release.\n')
        self.run_release('seal', homes=False)
        self.run_release('install', success=False)
        self.assertEqual((alias / 'keep.txt').read_text(), 'preserve me')
        self.assertEqual((self.homes[0] / 'skills/general-architecture').resolve(), self.installed(self.homes[0]))

    def test_activation_failure_restores_previously_switched_links(self):
        self.run_release('install')
        with (self.package / 'references/ADOPTION.md').open('a') as f:
            f.write('\nChanged release.\n')
        self.run_release('seal', homes=False)
        namespace = runpy.run_path(str(self.package / 'scripts/release.py'))
        selected = namespace['verify'](self.package)
        for home in self.homes:
            namespace['install'](home, selected)
        original = namespace['activate']
        def fail_second(home, release):
            if home == self.homes[1]:
                raise OSError('injected activation failure')
            original(home, release)
        with patch.dict(namespace['activate_all'].__globals__, activate=fail_second):
            with self.assertRaisesRegex(OSError, 'injected'):
                namespace['activate_all'](self.homes, selected)
        for home in self.homes:
            self.assertEqual((home / 'skills/general-architecture').resolve(), self.installed(home))

    def test_install_cannot_bypass_activation_with_pinned(self):
        self.run_release('install', pinned=True, success=False)
        for home in self.homes:
            self.assertFalse(home.exists())

    def test_measure_counts_changes_without_counting_metadata_or_history_as_instructions(self):
        self.run_release('install')
        baseline = self.installed(self.homes[0])
        (self.package / 'SKILL.md').write_text('---\nname: general-architecture\ndescription: test metadata\n---\none two three\n')
        (self.package / 'references/ADOPTION.md').unlink()
        (self.package / 'references/NEW.md').write_text('four five')
        (self.package / 'logs/CHANGES.md').write_text('historical words only')
        result = subprocess.run([sys.executable, str(self.package / 'scripts/release.py'),
                                 'measure', '--baseline', str(baseline)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report['files']['SKILL.md']['after'], 3)
        self.assertFalse(report['entry_within_target'])
        self.assertEqual(report['files']['references/ADOPTION.md']['after'], 0)
        self.assertEqual(report['files']['references/NEW.md']['delta'], 2)
        self.assertEqual(report['files']['logs/CHANGES.md']['after'], 3)
        self.assertEqual(report['instruction_words_after'], sum(v['after'] for name, v in report['files'].items()
                                                                if not name.startswith('logs/')))
        self.assertEqual((baseline / 'SKILL.md').read_bytes(), (SOURCE / 'SKILL.md').read_bytes())

    def test_measure_rejects_corrupt_baseline(self):
        self.run_release('install')
        baseline = self.installed(self.homes[0])
        (baseline / 'SKILL.md').write_text('corrupt')
        result = subprocess.run([sys.executable, str(self.package / 'scripts/release.py'),
                                 'measure', '--baseline', str(baseline)], capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Content/revision mismatch', result.stderr)

    def test_measure_reports_target_and_rejects_invalid_option_combinations(self):
        result = self.run_release('measure', homes=False)
        self.assertTrue(json.loads(result.stdout)['entry_within_target'])
        self.run_release('measure', homes=True, success=False)


    def test_source_symlink_rejected(self):
        (self.package / 'external').symlink_to(self.root / 'outside')
        self.run_release('seal', homes=False, success=False)


if __name__ == '__main__':
    unittest.main()
