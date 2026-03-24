# SLYDE Area Builder Program

## Purpose
The SLYDE Area Builder Program is a structured referral and network-growth system that allows approved Slyders to help grow courier density in their area and earn temporary `0% SLYDE commission` reward windows.

This program is designed to:
- accelerate courier growth in target towns across all 14 parishes
- reward quality referrals instead of raw lead volume
- improve launch readiness in under-covered areas
- create a win-win model for Slyders, ops, and the platform without direct cash payouts

This is not a generic affiliate program. It is a `network growth incentive layer` tied to real operating outcomes.

## Program Summary
Approved Slyders can refer new courier applicants. If the referred person moves through approval and becomes operational, the referrer earns a temporary commission-free reward.

Recommended default reward:
- `0% SLYDE commission for 5 days or 10 completed deliveries, whichever comes first`

Recommended priority-town reward:
- `0% SLYDE commission for 7 days or 15 completed deliveries, whichever comes first`

Rewards should apply only to eligible completed deliveries during the reward window. This means:
- the customer still pays the normal delivery fee
- the referrer keeps the full courier payout for eligible deliveries
- SLYDE temporarily waives platform commission during the active reward window

## Business Policy

### Eligibility
Only a referrer who meets all of the following can participate:
- is an approved Slyder
- has an active account
- is not suspended or under review
- has accepted all required legal documents
- is not blocked from network rewards by ops

Only a referred applicant who meets all of the following can qualify a reward:
- is a genuinely new applicant to SLYDE
- is not linked to an existing Slyder account
- is not a self-referral
- is not a duplicate by phone, email, national ID/TRN, or other identity key
- completes the application through the official onboarding flow

### Reward Philosophy
SLYDE should reward `quality network growth`, not just signups.

Bad incentive:
- paying on lead submission alone

Good incentive:
- rewarding only after the referred courier becomes a real, usable part of the network

### Reward Trigger Policy
Recommended trigger:
- reward unlocks when the referred Slyder is:
  - approved
  - activated
  - setup-complete

Optional stronger trigger:
- reward unlocks only when the referred Slyder also reaches:
  - readiness-complete, or
  - first successful delivery

Recommended V1:
- unlock at `approved + activated + setup complete`
- optional secondary booster at `first 10 completed deliveries`

### Reward Window Rules
Each earned reward grant should contain:
- `startsAt`
- `endsAt`
- `maxCommissionFreeDeliveries`
- `usedCompletedDeliveries`
- `status`

Recommended default:
- duration: `5 days`
- delivery cap: `10 completed deliveries`
- end condition: reward closes when either threshold is reached first

Recommended priority-town variant:
- duration: `7 days`
- delivery cap: `15 completed deliveries`

### Stacking Rules
Stacking is allowed, but capped.

Recommended caps:
- max `30 commission-free deliveries` banked
- max `15 commission-free days` active/banked
- rewards may queue, not overlap unpredictably

Recommended rule:
- if a Slyder earns a new reward while another reward is active, the new reward is added as a future queued grant
- system consumes rewards in FIFO order

### Eligible Deliveries
Only these deliveries should consume a reward:
- completed successfully
- assigned to the referrer
- not manually voided
- not fraudulent
- not refunded for service failure
- not test jobs

These should not consume a reward:
- canceled deliveries
- expired jobs
- failed handoffs
- manual ops test deliveries
- fraud-flagged deliveries

### Area Multiplier Policy
Reward generosity should vary by parish/town need.

Three recommended area tiers:

1. Standard growth area
- reward: `5 days or 10 deliveries`

2. Priority growth area
- reward: `7 days or 15 deliveries`

3. Strategic launch area
- reward: `10 days or 20 deliveries`

Ops should assign these tiers to hotspot towns, not entire countries or blanket nationwide rules.

### Anti-Abuse Policy
The following must invalidate or suspend rewards:
- self-referrals
- duplicate applicants
- shared phone/email reuse
- identity document duplication
- referral rings
- fake accounts
- inactive referrer abuse patterns
- referred courier approved and immediately terminated for fraud

Ops should be able to:
- mark a referral `invalid`
- reverse a pending reward
- suspend a referrer from the program
- freeze active grants if fraud is discovered

## Exact Reward Logic

### Core Entities
The program should revolve around these concepts:
- `referral code`
- `referral lead`
- `referral conversion`
- `reward grant`
- `reward consumption`
- `growth territory`

### Referral Attribution Logic
Attribution should happen when:
- referred applicant enters a referral code during application
- or referred applicant uses a tracked invite link

Recommended attribution precedence:
1. explicit referral code at application time
2. signed invite link token
3. no attribution if neither exists

Attribution should lock when the application is first created.

### Reward State Machine

#### Referral lead states
- `submitted`
- `application_started`
- `application_completed`
- `approved`
- `activated`
- `setup_completed`
- `readiness_completed`
- `first_delivery_completed`
- `qualified`
- `invalid`
- `rejected`

#### Reward grant states
- `pending`
- `active`
- `consumed`
- `expired`
- `revoked`

#### State transition rules
1. `submitted`
- created when a referral code is attached to a new applicant

2. `application_started`
- applicant begins onboarding but has not submitted

3. `application_completed`
- application and required docs submitted

4. `approved`
- ops approves application

5. `activated`
- applicant activates account and sets password

6. `setup_completed`
- applicant completes required setup

7. `readiness_completed`
- readiness checklist passes

8. `first_delivery_completed`
- first successful delivery is recorded

9. `qualified`
- chosen reward milestone is reached
- reward grant record is created

10. `invalid`
- duplicate/fraud/disallowed record

11. `rejected`
- ops rejects applicant

### Recommended V1 Qualification Logic
V1 reward qualification condition:
- referral becomes `qualified` when:
  - application status = approved
  - activation completed = true
  - setup completed = true

Optional V1.1 booster:
- create a second reward grant when:
  - first 10 successful deliveries completed

### Reward Activation Logic
When a reward grant becomes active:
- `startsAt` = now
- `endsAt` = now + configured days
- `remainingEligibleDeliveries` = configured cap
- commission override is attached to referrer account

At delivery completion:
- if active grant exists and delivery is eligible:
  - waive SLYDE commission
  - increment used delivery count
  - if delivery count cap reached, mark grant `consumed`

Daily job or request-time check:
- if now > `endsAt`, mark grant `expired`

### Commission Resolution Order
When a delivery is completed for a referrer:
1. check if referrer has any `active` reward grant
2. pick earliest active grant
3. validate delivery eligibility
4. if eligible:
  - apply `commissionRateOverride = 0`
  - record reward consumption event
5. if ineligible:
  - normal commission applies

## Database Schema

Below is the recommended relational shape for Postgres/Prisma.

### `slyder_referral_codes`
- `id` UUID PK
- `referrerUserId` UUID FK -> `users.id`
- `referrerSlyderProfileId` UUID FK -> `slyder_profiles.id`
- `code` TEXT UNIQUE
- `status` ENUM(`active`, `inactive`, `suspended`)
- `createdAt` TIMESTAMP
- `updatedAt` TIMESTAMP

Purpose:
- stores each approved Slyder’s shareable code

### `slyder_referral_leads`
- `id` UUID PK
- `referralCodeId` UUID FK -> `slyder_referral_codes.id`
- `referrerUserId` UUID FK -> `users.id`
- `referrerSlyderProfileId` UUID FK -> `slyder_profiles.id`
- `referredApplicationId` UUID FK -> `applications.id` nullable
- `referredUserId` UUID FK -> `users.id` nullable
- `referredEmail` TEXT nullable
- `referredPhone` TEXT nullable
- `referredFullName` TEXT nullable
- `parish` TEXT
- `town` TEXT
- `courierType` TEXT nullable
- `state` ENUM(
  `submitted`,
  `application_started`,
  `application_completed`,
  `approved`,
  `activated`,
  `setup_completed`,
  `readiness_completed`,
  `first_delivery_completed`,
  `qualified`,
  `invalid`,
  `rejected`
  )
- `invalidReason` TEXT nullable
- `reviewNotes` TEXT nullable
- `source` ENUM(`code`, `invite_link`, `manual_ops`)
- `createdAt` TIMESTAMP
- `updatedAt` TIMESTAMP

Purpose:
- canonical referral conversion record

### `slyder_growth_territories`
- `id` UUID PK
- `parish` TEXT
- `town` TEXT
- `statusLabel` TEXT
- `tier` ENUM(`standard`, `priority`, `strategic`)
- `rewardDays` INTEGER
- `rewardDeliveryCap` INTEGER
- `targetApprovedSlyders` INTEGER nullable
- `targetReadySlyders` INTEGER nullable
- `notes` TEXT nullable
- `isActive` BOOLEAN
- `createdAt` TIMESTAMP
- `updatedAt` TIMESTAMP

Purpose:
- ops-configured multiplier table for area-specific rewards

### `slyder_reward_grants`
- `id` UUID PK
- `referrerUserId` UUID FK -> `users.id`
- `referrerSlyderProfileId` UUID FK -> `slyder_profiles.id`
- `referralLeadId` UUID FK -> `slyder_referral_leads.id`
- `growthTerritoryId` UUID FK -> `slyder_growth_territories.id` nullable
- `grantType` ENUM(`activation_reward`, `operational_booster`, `manual_bonus`)
- `commissionRateOverride` DECIMAL(5,4) default `0`
- `rewardDays` INTEGER
- `deliveryCap` INTEGER
- `usedCompletedDeliveries` INTEGER default `0`
- `status` ENUM(`pending`, `active`, `consumed`, `expired`, `revoked`)
- `startsAt` TIMESTAMP nullable
- `endsAt` TIMESTAMP nullable
- `activatedAt` TIMESTAMP nullable
- `closedAt` TIMESTAMP nullable
- `revokedReason` TEXT nullable
- `createdAt` TIMESTAMP
- `updatedAt` TIMESTAMP

Purpose:
- stores the commission-free benefit itself

### `slyder_reward_consumptions`
- `id` UUID PK
- `rewardGrantId` UUID FK -> `slyder_reward_grants.id`
- `deliveryId` UUID FK -> `deliveries.id`
- `referrerUserId` UUID FK -> `users.id`
- `commissionNormallyCharged` DECIMAL(12,2)
- `commissionWaived` DECIMAL(12,2)
- `createdAt` TIMESTAMP

Purpose:
- audit trail for waived commission on each delivery

### `slyder_referral_events`
- `id` UUID PK
- `referralLeadId` UUID FK -> `slyder_referral_leads.id`
- `eventType` TEXT
- `payload` JSONB
- `createdAt` TIMESTAMP

Purpose:
- immutable event trail for investigation, analytics, and debugging

### Recommended indexes
- `slyder_referral_codes(code)` unique
- `slyder_referral_leads(referrerUserId, createdAt desc)`
- `slyder_referral_leads(referredEmail)`
- `slyder_referral_leads(referredPhone)`
- `slyder_reward_grants(referrerUserId, status, startsAt, endsAt)`
- `slyder_growth_territories(parish, town, isActive)`

## Admin Workflow Design

### Ops Control Tower Views
Add a dedicated `Area Builder Rewards` section in admin.

Recommended tabs:
- `Overview`
- `Referrers`
- `Referral Leads`
- `Reward Grants`
- `Territories`
- `Fraud Review`

### Admin Overview
Show:
- total referral leads
- application completion rate
- approval conversion rate
- reward grants created
- active commission-free grants
- top parishes by referral momentum
- top towns by qualified referrals

### Referrers View
For each referrer show:
- slyder name
- parish/town
- referral code
- total referred leads
- approved referrals
- qualified referrals
- active reward grants
- total waived commission value
- account standing

Admin actions:
- suspend from program
- reactivate
- view referred applicants
- issue manual bonus

### Referral Leads View
For each referral lead show:
- referred applicant name
- parish/town
- state
- referrer
- created date
- duplicate risk indicators
- qualification status

Admin actions:
- mark invalid
- attach review note
- reassign territory
- manually qualify
- manually reject reward

### Reward Grants View
For each grant show:
- referrer
- linked referral
- type
- days
- delivery cap
- used deliveries
- start/end
- status
- waived commission total

Admin actions:
- activate pending grant
- revoke active grant
- extend reward
- convert to manual bonus

### Territories View
For each parish/town:
- parish
- town
- territory tier
- launch/watch signal
- target courier count
- current approved count
- current ready count
- current referred pipeline
- configured reward profile

Admin actions:
- change tier
- change days
- change delivery cap
- mark active/inactive

## Slyder App Workflow Design

### Entry Point
In the Slyder app, add a menu item:
- `Grow Your Area`

### Referrer Dashboard
The Slyder should see:
- referral code
- share invite button
- current active reward
- queued rewards
- deliveries remaining in commission-free window
- total referrals by state:
  - submitted
  - approved
  - activated
  - qualified

### Suggested Panels
1. `Your Area Builder Code`
- copy code
- share link

2. `Active reward`
- `0% commission until 4 days left or 7 deliveries remaining`

3. `Queued rewards`
- number of rewards waiting after the current one ends

4. `Your area impact`
- how many referred Slyders are helping build the parish

5. `Priority towns`
- show towns where referral rewards are stronger

### Referral UX
Recommended flow:
1. Slyder taps `Grow Your Area`
2. sees reward rules
3. copies code or shares invite link
4. referred applicant applies with code
5. referrer sees progress updates in app
6. when reward qualifies, app shows:
   - reward unlocked
   - start time
   - days remaining
   - deliveries remaining

### Slyder Notifications
Recommended notifications:
- referral received
- referral completed application
- referral approved
- reward unlocked
- reward now active
- reward expiring soon
- reward fully used

Preferred channels:
- in-app first
- email optional
- WhatsApp optional for major events

## Ops and Delivery Engine Integration

To support this program correctly, the delivery engine must be able to:
- identify active reward grants for a referrer
- apply `0% commission` on eligible completed deliveries
- decrement the reward usage counter
- record waived commission value
- close the reward when thresholds are reached

If the SLYDE app already computes commission at payout/delivery completion time, the new reward logic should plug into that existing commission resolution path.

## Recommended V1 Rollout

### Phase 1
- only approved Slyders can participate
- only designated hotspot towns are eligible
- manual ops review remains available
- one default reward profile

### Phase 2
- all 14 parishes enabled
- territory tiers active
- automated grant issuance
- basic fraud heuristics active

### Phase 3
- area leaderboards
- builder tiers
- parish captain status
- ops forecasting using referral density

## Recommended V1 Policy Decision
If SLYDE wants the cleanest first launch, use this:

- program name: `SLYDE Area Builder Rewards`
- only approved Slyders may refer
- reward unlocks when referred Slyder is:
  - approved
  - activated
  - setup-complete
- default reward:
  - `0% commission for 5 days or 10 completed deliveries`
- priority towns:
  - `0% commission for 7 days or 15 completed deliveries`
- stacking cap:
  - `30 completed deliveries max banked`
- ops may revoke rewards for fraud or duplicate abuse

This gives SLYDE a practical, retention-friendly, cash-light growth engine.

## Next Implementation Step
Recommended first technical step:
- add schema/models for:
  - `slyder_referral_codes`
  - `slyder_referral_leads`
  - `slyder_growth_territories`
  - `slyder_reward_grants`
  - `slyder_reward_consumptions`

Then build:
1. admin territory configuration
2. referral attribution on application submit
3. automatic grant issuance on qualification
4. commission override at delivery completion
