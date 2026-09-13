# Phishing And SIM Swap Response Playbook

Purpose: contain account takeover risk when a client reports phishing, phone-number compromise, or suspicious login prompts.

## Use When

- A client clicked a suspicious link.
- A client lost phone service unexpectedly.
- A client received login or withdrawal notifications they did not initiate.

## Immediate Actions

- Treat the phone number as untrusted until carrier control is restored.
- Move exchange accounts away from SMS-based authentication where possible.
- Review recent account activity and withdrawal settings.
- Rotate passwords through a trusted password manager after device checks.

## Evidence To Collect

- Approximate time of the suspicious event.
- Affected accounts and authentication methods.
- Whether any withdrawal address or allowlist changed.
- Whether the client entered credentials or approval codes.

## Recommendation Standard

Contain account access before recommending custody changes. If an exchange account may be compromised, prioritize account lock, withdrawal review, and support escalation.
