import { execSync } from 'child_process';
import { resolve } from 'path';

// Monorepo root is three levels up from this test file (apps/api/test/ -> apps/api/ -> apps/ -> root)
const ROOT = resolve(__dirname, '../../../');

const ADMIN_IMAGE = 'webastro/admin:inspection-test';
const WEB_IMAGE = 'webastro/web:inspection-test';

const ADMIN_PORT = 4321;
const WEB_PORT = 80;

function buildImage(dockerfile: string, tag: string): void {
  execSync(
    `docker build -f ${resolve(ROOT, dockerfile)} -t ${tag} ${ROOT}`,
    { stdio: 'pipe', timeout: 300000 }
  );
}

function imageHasCurl(image: string): { found: boolean; output: string } {
  try {
    const output = execSync(
      `docker run --rm ${image} which curl`,
      { encoding: 'utf8', timeout: 30000 }
    );
    return { found: true, output };
  } catch (error: any) {
    return { found: false, output: error.stdout?.toString() || error.stderr?.toString() || '' };
  }
}

function startContainer(image: string, name: string): string {
  const id = execSync(
    `docker run -d --name ${name} ${image}`,
    { encoding: 'utf8', timeout: 30000 }
  ).trim();
  return id;
}

function stopContainer(name: string): void {
  try {
    execSync(`docker stop ${name}`, { timeout: 10000, stdio: 'pipe' });
    execSync(`docker rm ${name}`, { timeout: 10000, stdio: 'pipe' });
  } catch {
    // best effort cleanup
  }
}

function curlInsideContainer(containerId: string, url: string): { success: boolean; output: string } {
  try {
    const output = execSync(
      `docker exec ${containerId} curl -fsS ${url}`,
      { encoding: 'utf8', timeout: 15000 }
    );
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: error.stdout?.toString() || error.stderr?.toString() || '' };
  }
}

describe('Docker runner inspection (pre-change red tests)', () => {

  describe('1.1 Admin runner image — curl presence', () => {
    it('should FAIL: curl is NOT present in admin runner image before the change', () => {
      buildImage('apps/admin/Dockerfile', ADMIN_IMAGE);
      const result = imageHasCurl(ADMIN_IMAGE);
      // Red phase: curl should NOT be found, so this assertion fails
      expect(result.found).toBe(true);
    });
  });

  describe('1.2 Web runner image — curl presence', () => {
    it('should FAIL: curl is NOT present in web runner image before the change', () => {
      buildImage('apps/web/Dockerfile', WEB_IMAGE);
      const result = imageHasCurl(WEB_IMAGE);
      // Red phase: curl should NOT be found, so this assertion fails
      expect(result.found).toBe(true);
    });
  });

  describe('1.3 Admin container — /login HTTP 200 from inside', () => {
    it('should FAIL: /login does NOT return HTTP 200 from inside admin container before the change', () => {
      buildImage('apps/admin/Dockerfile', ADMIN_IMAGE);
      const containerId = startContainer(ADMIN_IMAGE, 'admin-inspection-test');
      try {
        // Wait for the SSR server to start
        execSync(`sleep 3`, { timeout: 10000 });
        const result = curlInsideContainer(containerId, `http://localhost:${ADMIN_PORT}/login`);
        // Red phase: curl not available inside container, so this fails
        expect(result.success).toBe(true);
      } finally {
        stopContainer('admin-inspection-test');
      }
    });
  });

  describe('1.4 Web container — / HTTP 200 from inside', () => {
    it('should FAIL: / does NOT return HTTP 200 from inside web container before the change', () => {
      buildImage('apps/web/Dockerfile', WEB_IMAGE);
      const containerId = startContainer(WEB_IMAGE, 'web-inspection-test');
      try {
        // Wait for nginx to start
        execSync(`sleep 2`, { timeout: 10000 });
        const result = curlInsideContainer(containerId, `http://localhost:${WEB_PORT}/`);
        // Red phase: curl not available inside container, so this fails
        expect(result.success).toBe(true);
      } finally {
        stopContainer('web-inspection-test');
      }
    });
  });

});
