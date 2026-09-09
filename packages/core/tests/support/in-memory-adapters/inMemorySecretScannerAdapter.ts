import type { SecretScannerAPI, SecretScanResult } from '../../../src/ports/secret-scanner.js';

export class RecordingSecretScanner implements SecretScannerAPI {
  calls = 0;

  constructor(
    private readonly result: SecretScanResult = { findings: [] },
    private readonly operations: string[] = []
  ) {}

  scan(): SecretScanResult {
    this.operations.push('scan');
    this.calls += 1;
    return this.result;
  }
}
