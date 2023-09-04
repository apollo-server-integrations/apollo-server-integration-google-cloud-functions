import fs from 'fs';
import { exec } from 'child_process';

const pkgJsonPaths = ['cli/package.json'];

try {
  exec('git rev-parse --short HEAD', (err, stdout) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    const commitHash = stdout.trim();

    for (const pkgJsonPath of pkgJsonPaths) {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
      const oldVersion = pkg.version;
      const [major, minor, patch] = oldVersion.split('.').map(Number);
      const newVersion = `${major}.${minor}.${patch + 1}-canary.${commitHash}`;
      pkg.version = newVersion;
      const content = JSON.stringify(pkg, null, '\t') + '\n';

      fs.writeFileSync(pkgJsonPath, content);
    }
  });
} catch (error) {
  console.error(error);
  process.exit(1);
}
