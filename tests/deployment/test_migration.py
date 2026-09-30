"""Run the real deployment scripts against disposable Git and web-root fixtures."""
import itertools
import os
from pathlib import Path
import shlex
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
STUB = r'''#!/usr/bin/env python3
import os,sys,pathlib,subprocess
name=pathlib.Path(sys.argv[0]).name
args=sys.argv[1:]
if name=='sudo':
 while args and args[0].startswith('-'):
  flag=args.pop(0)
  if flag=='-p': args.pop(0)
 os.execvp(args[0],args)
if name=='flock': sys.exit(int(os.environ.get('FAIL_LOCK','0')))
if name=='sleep': sys.exit(0)
with open(os.environ['TEST_LOG'],'a') as log: log.write(name+' '+str(pathlib.Path.cwd().name)+' '+' '.join(args)+'\n')
if name=='docker': sys.exit(int(os.environ.get('FAIL_BACKEND','0')))
if name=='npm' and args[0]=='run':
 target=pathlib.Path.cwd().name.removesuffix('-client')
 if os.environ.get('FAIL_BUILD')==target: sys.exit(31)
 assert os.environ['REACT_APP_API_BASE_URL']=='http://localhost:3001'
 assert not os.environ.get('REACT_APP_SECRET_LEAK')
 if target=='glocal': assert os.environ['PUBLIC_URL']=='/glocal'
 path=pathlib.Path(os.environ['BUILD_PATH']); path.mkdir(parents=True)
 (path/'index.html').write_text('new-'+target)
if name=='curl':
 url=next(a for a in args if a.startswith('http'))
 output=pathlib.Path(args[args.index('-o')+1])
 if '/health' in url: output.write_text('ok')
 else:
  target=url.split('/')[3]
  if os.environ.get('FAIL_URL')==target: sys.exit(22)
  text='wrong' if os.environ.get('WRONG_URL')==target else (pathlib.Path(os.environ['TEST_WEB'])/target/'index.html').read_text()
  output.write_text(text)
if name=='mv':
 if os.environ.get('FAIL_SWAP') and '.netzero-stage-' in args[-2] and args[-2].endswith('/'+os.environ['FAIL_SWAP']): sys.exit(39)
 os.execv('/bin/mv',['mv']+args)
'''

class DeploymentTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory(prefix='netzero-deploy-test-')
  self.addCleanup(self.temp.cleanup)
  self.base=Path(self.temp.name); self.source=self.base/'source'; self.source.mkdir()
  for target in ('netzero','glocal'):
   app=self.source/(target+'-client'); app.mkdir()
   for name in ('package.json','package-lock.json'): (app/name).write_text('{}')
  (self.source/'docker-compose.prod.yml').write_text('services: {}\n')
  self.git('init','-b','main',cwd=self.source); self.git('add','.',cwd=self.source)
  self.git('-c','user.name=Test','-c','user.email=test@example.com','commit','-qm','fixture',cwd=self.source)
  self.checkout=self.base/'checkout'; self.web=self.base/'web'; self.log=self.base/'commands.log'
  for target in ('netzero','glocal','other'):
   app=self.web/target; app.mkdir(parents=True); (app/'index.html').write_text('old-'+target)
  bindir=self.base/'bin'; bindir.mkdir()
  for name in ('sudo','flock','sleep','docker','npm','curl','mv'):
   file=bindir/name; file.write_text(STUB); file.chmod(0o755)
  self.env=dict(os.environ,PATH=str(bindir)+':'+os.environ['PATH'],TEST_LOG=str(self.log),TEST_WEB=str(self.web),REACT_APP_SECRET_LEAK='private')
  self.config=self.base/'upload.env'
  self.values={}
  for line in (ROOT/'.env.production.example').read_text().splitlines():
   if line and not line.startswith('#') and '=' in line:
    key,value=line.split('=',1); self.values[key]='fixture' if not value or value=='replace-me' else value
  self.values.update(DEPLOY_PATH=str(self.checkout),WEB_ROOT=str(self.web),PUBLIC_SITE_URL='http://fixture',REPO_URL=str(self.source),REACT_APP_API_BASE_URL='http://localhost:3001',REMOTE_PASSWORD='fixture')
  self.write_config()
 def git(self,*args,cwd=None): return subprocess.run(['git',*args],cwd=cwd,check=True,capture_output=True)
 def write_config(self): self.config.write_text(''.join(key+'='+shlex.quote(value)+'\n' for key,value in self.values.items()))
 def run_deploy(self,frontend='both',backend='skip',action='deploy',**env):
  return subprocess.run(['bash',str(ROOT/'scripts/deploy-on-host.sh'),action,frontend,backend,str(self.config)],env=dict(self.env,**env),capture_output=True,text=True)
 def assert_old(self):
  for target in ('netzero','glocal','other'): self.assertEqual((self.web/target/'index.html').read_text(),'old-'+target)
 def test_every_target_combination(self):
  for frontend,backend in itertools.product(('netzero','glocal','both','none'),('deploy','skip')):
   with self.subTest(frontend=frontend,backend=backend):
    for target in ('netzero','glocal'): (self.web/target/'index.html').write_text('old-'+target)
    self.log.write_text(''); result=self.run_deploy(frontend,backend)
    if (frontend,backend)==('none','skip'):
     self.assertNotEqual(result.returncode,0); self.assert_old(); continue
    self.assertEqual(result.returncode,0,result.stderr+result.stdout)
    selected={'netzero','glocal'} if frontend=='both' else {frontend}
    for target in ('netzero','glocal'): self.assertEqual((self.web/target/'index.html').read_text(),('new-' if target in selected else 'old-')+target)
    self.assertEqual((self.web/'other/index.html').read_text(),'old-other')
    commands=self.log.read_text(); self.assertEqual('docker ' in commands,backend=='deploy')
    for target in ('netzero','glocal'): self.assertEqual('npm '+target+'-client' in commands,target in selected)
    if backend=='deploy': self.assertIn('up -d --no-build --no-deps netzero-server netzero-chat-server',commands)
 def test_frontend_only_requires_no_backend_settings(self):
  self.values={k:v for k,v in self.values.items() if k in {'NODE_ENV','REPO_URL','DEPLOY_PATH','WEB_ROOT','PUBLIC_SITE_URL','REMOTE_PASSWORD','REACT_APP_API_BASE_URL'}}
  self.write_config(); result=self.run_deploy('glocal')
  self.assertEqual(result.returncode,0,result.stderr); self.assertNotIn('docker ',self.log.read_text())
 def test_missing_backend_config_fails_before_checkout(self):
  del self.values['CHAT_VECTOR_STORE_ID']; self.write_config(); result=self.run_deploy('both','deploy')
  self.assertNotEqual(result.returncode,0); self.assertFalse(self.checkout.exists()); self.assert_old()
 def test_second_build_failure_leaves_frontends_and_backend_untouched(self):
  result=self.run_deploy('both','deploy',FAIL_BUILD='glocal')
  self.assertNotEqual(result.returncode,0); self.assert_old(); self.assertNotIn(' up ',self.log.read_text())
 def test_backend_failure_does_not_publish_frontends(self):
  result=self.run_deploy('both','deploy',FAIL_BACKEND='1')
  self.assertNotEqual(result.returncode,0); self.assert_old()
 def test_failed_url_restores_both_previous_builds(self):
  result=self.run_deploy(FAIL_URL='glocal'); self.assertNotEqual(result.returncode,0); self.assert_old()
 def test_wrong_url_content_rolls_back(self):
  result=self.run_deploy(WRONG_URL='netzero'); self.assertNotEqual(result.returncode,0); self.assert_old()
 def test_second_swap_failure_restores_first_and_second(self):
  result=self.run_deploy(FAIL_SWAP='glocal'); self.assertNotEqual(result.returncode,0); self.assert_old()
 def test_previous_builds_retained_on_success(self):
  result=self.run_deploy(); self.assertEqual(result.returncode,0,result.stderr)
  for target in ('netzero','glocal'):
   copies=list((self.web/'.netzero-releases').glob('*/'+target+'/index.html'))
   self.assertEqual(len(copies),1); self.assertEqual(copies[0].read_text(),'old-'+target)
 def test_uploads_survive_repository_refresh(self):
  self.git('clone',str(self.source),str(self.checkout)); uploads=self.checkout/'netzero-server/files'; uploads.mkdir(parents=True)
  (uploads/'sentinel').write_text('keep'); result=self.run_deploy('glocal')
  self.assertEqual(result.returncode,0,result.stderr); self.assertEqual((uploads/'sentinel').read_text(),'keep')
 def test_lock_contention_fails_before_changes(self):
  result=self.run_deploy(FAIL_LOCK='1'); self.assertNotEqual(result.returncode,0)
  self.assertFalse(self.checkout.exists()); self.assert_old()
 def test_invalid_selection_fails_before_changes(self):
  result=self.run_deploy('invalid'); self.assertNotEqual(result.returncode,0)
  self.assertFalse(self.checkout.exists()); self.assert_old()
 def test_management_leaves_frontends_and_root_config_intact(self):
  self.git('clone',str(self.source),str(self.checkout)); root_env=self.checkout/'.env.production'; root_env.write_text('NODE_ENV=production\n')
  for action in ('start','stop','restart','logs','status'):
   result=self.run_deploy('none','skip',action=action); self.assertEqual(result.returncode,0,result.stderr)
   self.assertEqual(root_env.read_text(),'NODE_ENV=production\n'); self.assert_old()
 def test_local_entrypoint_menu_dry_run(self):
  result=subprocess.run(['bash',str(ROOT/'scripts/remote-deploy.sh'),'--dry-run'],input='1\n2\nn\n',capture_output=True,text=True)
  self.assertEqual(result.returncode,0,result.stderr); self.assertIn('frontend: glocal; backend: skip',result.stdout)

if __name__=='__main__': unittest.main()
