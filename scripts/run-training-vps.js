const { spawn } = require('child_process');
const path = require('path');
const { prepareTrainingEnvironment } = require('./training-env');

const command = process.argv[2];
if (command !== 'build' && command !== 'start') {
  throw new Error('Usa build o start.');
}
const root = prepareTrainingEnvironment({ vps: true });
const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const args = command === 'start' ? ['start', '--hostname', '127.0.0.1', '--port', process.env.TRAINING_PORT] : ['build'];
const child = spawn(process.execPath, [nextBin, ...args], {
  cwd: root,
  env: { ...process.env, NEXT_PUBLIC_TRAINING_BASE_PATH: process.env.TRAINING_BASE_PATH },
  stdio: 'inherit',
});
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
