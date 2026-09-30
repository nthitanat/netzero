// Real Axios transport and migrated services; only browser storage is simulated.
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const Module = require('node:module');
const root = path.resolve(__dirname, '../..');
const clientRoot = path.join(root, 'glocal-client');
const babel = require(path.join(clientRoot, 'node_modules/@babel/core'));
const transformModules = require(path.join(clientRoot, 'node_modules/@babel/plugin-transform-modules-commonjs'));
function load(relative, mocks = {}) {
  const filename = path.join(clientRoot, relative);
  const { code } = babel.transformFileSync(filename, { babelrc: false, configFile: false, plugins: [transformModules] });
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = mod.require.bind(mod);
  mod.require = name => Object.hasOwn(mocks, name) ? mocks[name] : original(name);
  mod._compile(code, filename);
  return mod.exports;
}
async function main() {
  const requests = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      requests.push({ path: req.url, body: JSON.parse(body), token: req.headers.authorization });
      res.setHeader('Content-Type', 'application/json');
      if (req.url.includes('survey-checkins')) {
        res.end(JSON.stringify({ success: true, data: { completed: true } }));
      } else if (JSON.parse(body).email === 'expired@example.com') {
        res.writeHead(401);
        res.end(JSON.stringify({ message: 'Expired test token' }));
      } else {
        res.end(JSON.stringify({ success: true, data: { token: 'fixture-token', user: { id: 1 } } }));
      }
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    process.env.REACT_APP_API_BASE_URL = 'http://127.0.0.1:' + server.address().port;
    let token = null;
    const events = [];
    global.CustomEvent = class { constructor(type, args) { this.type = type; this.detail = args.detail; } };
    global.window = { dispatchEvent: event => events.push(event.type) };
    const storage = { storageService: {
      getAuthToken: () => token,
      saveAuthData: value => { token = value; },
      clearAuthData: () => { token = null; }
    }};
    const client = load('src/api/client.js', { '../utils/storage': storage });
    client.axiosInstance.defaults.proxy = false;
    const { authService } = load('src/api/auth.js', { './client': client, '../utils/storage': storage });
    const { verifyCheckin } = load('src/api/checkinService.js', { './client': client });
    const login = await authService.login({ email: 'local@example.com', password: 'fixture' });
    assert.equal(login.success, true);
    assert.equal(requests[0].path, '/api/v1/auth/login');
    const result = await verifyCheckin('local@example.com');
    assert.equal(result.data.data.completed, true);
    assert.equal(requests[1].path, '/api/v1/glocal/survey-checkins/verify');
    assert.equal(requests[1].token, 'Bearer fixture-token');
    await assert.rejects(authService.login({ email: 'expired@example.com', password: 'fixture' }), e => e.status === 401);
    assert.equal(token, null);
    assert.deepEqual(events, ['auth:unauthorized']);
    process.env.NODE_ENV = 'production';
    process.env.DB_PASSWORD = 'fixture';
    process.env.JWT_SECRET = 'fixture';
    const fs = require('node:fs');
    process.env.CORS_ORIGIN = fs.readFileSync(path.join(root, '.env.development.example'), 'utf8').match(/^CORS_ORIGIN=(.*)$/m)[1];
    const { corsOptions } = require(path.join(root, 'netzero-server/src/middleware'));
    corsOptions.origin('http://localhost:3002', (error, allowed) => { assert.equal(error, null); assert.equal(allowed, true); });
    corsOptions.origin('https://unlisted.example.com', error => { assert.equal(error.statusCode, 403); });
    console.log('Glocal login/check-in reached the configured local HTTP API; 401 behavior and Glocal CORS origin verified.');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

