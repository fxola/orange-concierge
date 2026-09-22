import { spawn } from 'node:child_process';

let activeChild;

export function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: options.stdio ?? 'inherit',
    });

    activeChild = child;

    child.once('error', reject);

    child.once('exit', (code, signal) => {
      if (activeChild === child) {
        activeChild = undefined;
      }

      if (signal) {
        reject(new Error(`${command} ${args.join(' ')} exited from signal ${signal}`));

        return;
      }

      resolve(code ?? 1);
    });
  });
}

export async function runRequired(command, args, options) {
  const code = await runCommand(command, args, options);

  if (code !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${code}`);
  }
}

export function stopActiveProcess(signal = 'SIGTERM') {
  activeChild?.kill(signal);
}
