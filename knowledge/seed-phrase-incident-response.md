# Seed Phrase Incident Response Playbook

Purpose: respond safely when a client may have exposed seed material or recovery words.

## Use When

- A client says recovery material may have been photographed, copied, typed, or shared.
- A client pasted secret material into an unsafe channel.
- A client is unsure whether a backup was handled by a third party.

## Immediate Actions

- Stop collecting transcript details that include the secret itself.
- Treat the affected wallet as potentially compromised.
- Identify whether funds remain at risk without asking for seed words.
- Escalate to a senior reviewer before proposing movement.

## Evidence To Collect

- What kind of exposure occurred.
- When it happened.
- Which wallet or storage process was affected.
- Whether any transaction activity occurred afterward.

## Recommendation Standard

Do not include the secret in notes, model context, embeddings, or audit metadata. Recommend containment and senior review before any operational transaction.
