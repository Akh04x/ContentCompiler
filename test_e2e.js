const { spawn } = require('child_process');

const p = spawn('node', ['dist/src/index.js'], {
  env: { ...process.env, PROVIDER: 'mock' }
});

p.stdout.on('data', (data) => {
  process.stdout.write(data);
  const out = data.toString();
  if (out.includes('Approve? (y/n):')) {
    p.stdin.write('y\n');
  } else if (out.includes('Approve target? (y/n):')) {
    p.stdin.write('n\n');
  }
});

p.stderr.on('data', (data) => {
  process.stderr.write(data);
});

p.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});
