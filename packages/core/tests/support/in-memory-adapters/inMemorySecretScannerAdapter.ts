import type { SecretScanner, SecretScanResult } from '../../../src/ports/secret-scanner.js';

export class RecordingSecretScanner implements SecretScanner {
  calls = 0;

  constructor(
    private readonly result: SecretScanResult = { findings: [] },
    private readonly operations: string[] = []
  ) {}

  async scan(): Promise<SecretScanResult> {
    this.operations.push('scan');
    this.calls += 1;
    return this.result;
  }
}
