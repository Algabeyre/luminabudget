# Security Specification: Lumina Budget

## Data Invariants
1. Users can only read and write their own data.
2. Transactions must have a valid `userId` matching the authenticated user.
3. Budgets must have a valid `userId` matching the authenticated user.
4. Transaction amounts must be positive numbers.
5. `type` must be exactly 'income' or 'expense'.
6. `date` must be a valid ISO string.

## The Dirty Dozen Payloads (Rejection Targets)

1. **Identity Spoofing (Transaction)**: Attempt to create a transaction with `userId: "attacker_id"`.
2. **Identity Spoofing (Budget)**: Attempt to create a budget with `userId: "attacker_id"`.
3. **Cross-User Leak**: Authenticated User A attempts to `get` User B's transaction.
4. **Invalid Type**: Create transaction with `type: "robbery"`.
5. **Shadow Field Injection**: Create transaction with `admin: true`.
6. **Value Poisoning**: Set transaction `amount` to -500.
7. **Resource Poisoning**: Use a 1KB string as a `budgetId`.
8. **Immortal Field Breach**: Attempt to update `userId` on an existing transaction.
9. **Blanket Query Attempt**: Client attempts to list ALL transactions without a `userId` filter.
10. **State Shortcut**: Client attempts to set `spent` on a budget without it being a valid number.
11. **Orphaned Write**: Create a transaction without a `date`.
12. **Malicious ID**: Use `../system/config` as a document ID.

## The Test Runner (Mock Logic)
The implementation will verify:
- `auth.uid == data.userId` for all writes.
- `affectedKeys().hasOnly(...)` for specific budget updates.
- `isValidId()` for all document references.
