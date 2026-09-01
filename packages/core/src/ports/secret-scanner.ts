export type SecretFindingType = 'seed_phrase' | 'private_key' | 'password' | 'api_key' | 'recovery_code';

export type SecretFinding = Readonly<{
  type: SecretFindingType;
  severity: 'prohibited' | 'warning';
  start: number;
  end: number;
  label: string;
}>;

export type SecretScanResult = Readonly<{
  findings: readonly SecretFinding[];
}>;

export interface SecretScanner {
  scan(input: { text: string }): Promise<SecretScanResult>;
}
