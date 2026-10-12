# Task plan

## Objective

Ship authentication MVP

## Scope

### In scope

- Login flow
- Session tokens

### Out of scope

- Dashboard redesign

## Tasks

### T-001 Login API
status: done
priority: high

#### Acceptance criteria
- POST /login returns token

#### Verification
- Unit tests pass

### T-002 Session refresh
status: in-progress
priority: medium
depends: T-001

#### Acceptance criteria
- Refresh extends session

#### Verification
- Integration test green

## History

- Started 2026-01-01
