import { describe, expect, it } from 'vitest';

import { PatternSecretScanner } from '../src';

describe('PatternSecretScanner', () => {
  it('flags a 12-word seed phrase without copying the secret into the label', async () => {
    const scanner = new PatternSecretScanner();
    const phrase = `abandon above absent absorb abstract absurd access accident account antenna answer antique`;
    const text = `Client pasted recovery phrase: ${phrase}`;

    const result = scanner.scan({ text });

    expect(result.findings).toEqual([
      {
        type: 'seed_phrase',
        severity: 'prohibited',
        start: text.indexOf(phrase),
        end: text.indexOf(phrase) + phrase.length,
        label: 'Possible seed phrase',
      },
    ]);
    expect(result.findings[0]?.label).not.toContain('abandon');
  });

  it('does not flag ordinary 12-word prose as a seed phrase', () => {
    const scanner = new PatternSecretScanner();
    const text = 'Client wants to learn about estate planning and custody controls before buying bitcoin.';

    const result = scanner.scan({ text });

    expect(result.findings).toEqual([]);
  });

  it('flags an xprv-style private key without copying it into the label', () => {
    const scanner = new PatternSecretScanner();
    const key = 'xprv9s21ZrQH143K3QTDL4LXw2FfakeKeyForScannerTestNay';
    const text = `Client pasted wallet export: ${key}`;

    const result = scanner.scan({ text });

    expect(result.findings).toEqual([
      {
        type: 'private_key',
        severity: 'prohibited',
        start: text.indexOf(key),
        end: text.indexOf(key) + key.length,
        label: 'Possible private key',
      },
    ]);
    expect(result.findings[0]?.label).not.toContain(key);
  });

  it('flags a 0x-prefixed 64-hex private key', () => {
    const scanner = new PatternSecretScanner();
    const key = `0x${'a'.repeat(64)}`;
    const text = `Private key value: ${key}`;

    const result = scanner.scan({ text });

    expect(result.findings).toEqual([
      {
        type: 'private_key',
        severity: 'prohibited',
        start: text.indexOf(key),
        end: text.indexOf(key) + key.length,
        label: 'Possible private key',
      },
    ]);
  });

  it('does not flag plain discussion about private keys', () => {
    const scanner = new PatternSecretScanner();

    const result = scanner.scan({ text: 'The client asked how private keys work.' });

    expect(result.findings).toEqual([]);
  });

  it('flags an API key assignment without copying it into the label', () => {
    const scanner = new PatternSecretScanner();
    const key = 'sk-test_1234567890abcdef';
    const text = `Exchange API key: ${key}`;

    const result = scanner.scan({ text });

    expect(result.findings).toEqual([
      {
        type: 'api_key',
        severity: 'prohibited',
        start: text.indexOf(key),
        end: text.indexOf(key) + key.length,
        label: 'Possible API key',
      },
    ]);
    expect(result.findings[0]?.label).not.toContain(key);
  });

  it('does not flag plain discussion about API keys', () => {
    const scanner = new PatternSecretScanner();

    const result = scanner.scan({ text: 'The client asked where API keys are managed.' });

    expect(result.findings).toEqual([]);
  });

  it('flags a recovery-code assignment without copying it into the label', () => {
    const scanner = new PatternSecretScanner();
    const code = '1234-5678-9012';
    const text = `Backup code: ${code}`;

    const result = scanner.scan({ text });

    expect(result.findings).toEqual([
      {
        type: 'recovery_code',
        severity: 'prohibited',
        start: text.indexOf(code),
        end: text.indexOf(code) + code.length,
        label: 'Possible recovery code',
      },
    ]);
    expect(result.findings[0]?.label).not.toContain(code);
  });

  it('does not flag plain discussion about recovery codes', () => {
    const scanner = new PatternSecretScanner();

    const result = scanner.scan({ text: 'Recovery codes should be stored offline.' });

    expect(result.findings).toEqual([]);
  });

  it('returns findings in text order', () => {
    const scanner = new PatternSecretScanner();
    const apiKey = 'sk-test_1234567890abcdef';
    const privateKey = `0x${'a'.repeat(64)}`;
    const text = `API key: ${apiKey}\nPrivate key value: ${privateKey}`;

    const result = scanner.scan({ text });

    expect(result.findings.map((finding) => finding.type)).toEqual(['api_key', 'private_key']);
  });

  it('keeps one finding when detectors overlap on the same secret', () => {
    const scanner = new PatternSecretScanner();
    const key = `0x${'a'.repeat(64)}`;
    const text = `API key: ${key}`;

    const result = scanner.scan({ text });

    expect(result.findings).toEqual([
      {
        type: 'private_key',
        severity: 'prohibited',
        start: text.indexOf(key),
        end: text.indexOf(key) + key.length,
        label: 'Possible private key',
      },
    ]);
  });

  it('caps findings at 20', () => {
    const scanner = new PatternSecretScanner();
    const code = '1234-5678-9012';
    const text = Array.from({ length: 25 }, (_, index) => `Backup code: ${code}-${index}`)
      .join('\n');

    const result = scanner.scan({ text });

    expect(result.findings).toHaveLength(20);
  });
});
