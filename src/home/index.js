const endpoints = ['taskpane.html', 'settings.html', 'commands.html', 'manifest.xml'];
const healthStatus = document.querySelector('#health-status');

async function checkEndpoint(endpoint) {
  try {
    const response = await fetch(new URL(endpoint, document.baseURI), {
      method: 'HEAD',
      cache: 'no-store'
    });
    return { endpoint, reachable: response.ok };
  } catch {
    return { endpoint, reachable: false };
  }
}

async function renderHealthStatus() {
  const results = await Promise.all(endpoints.map(checkEndpoint));
  healthStatus.innerHTML = results
    .map(({ endpoint, reachable }) => `<div class="status"><span>${endpoint}</span><span>${reachable ? '✅ Reachable' : '❌ Failed'}</span></div>`)
    .join('');
}

async function loadReadme() {
  const readme = document.querySelector('#readme-content');
  try {
    const response = await fetch(new URL('README.md', document.baseURI), { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`README request failed with ${response.status}`);
    }
    readme.textContent = await response.text();
  } catch {
    readme.textContent = 'README.md could not be loaded. Use the README link above.';
  }
}

document.querySelector('#deployment-time').textContent = document.lastModified || 'Unavailable';
renderHealthStatus();
loadReadme();
