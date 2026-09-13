# Recommendation Review Policy

Purpose: define when AI-assisted recommendations can be shown as internal drafts and when a human reviewer must approve them.

## Draft Requirements

- The recommendation must be based on validated extracted facts.
- Each material claim must cite client evidence or state that evidence is missing.
- Each policy claim must cite an internal knowledge source.
- The draft must avoid promises about legal, tax, or guaranteed security outcomes.

## Human Review Requirements

- A reviewer checks whether the cited evidence actually supports the recommendation.
- A reviewer checks whether the proposed action is proportionate to the client's readiness.
- A reviewer edits or rejects unsupported claims.
- Approval records the reviewer identity and timestamp.

## Reject Conditions

Reject the recommendation if it asks for secrets, claims a policy without a source, contradicts the readiness score, or suggests operational movement while evidence is missing.
