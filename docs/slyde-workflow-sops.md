# SLYDE Workflow SOPs

**Document Type:** Internal SOP Library  
**Version:** 2026-03-23  
**Prepared For:** Operations, Support, Platform, and Launch Teams  
**Status:** PDF-Ready Draft

---

**Confidential Internal Use Only**

This SOP library provides step-by-step operating instructions for the current SLYDE Website workflows.

---

<div style="page-break-after: always;"></div>

## Table of Contents

1. SOP 1: Review a New Slyder Application  
2. SOP 2: Approve a Slyder Application  
3. SOP 3: Reject a Slyder Application  
4. SOP 4: Request More Documents  
5. SOP 5: Approve or Reject Individual Documents  
6. SOP 6: Replace a Missing Document File  
7. SOP 7: Confirm Activation Email Was Sent  
8. SOP 8: Resend Activation Invite  
9. SOP 9: Support a Slyder Through Login and OTP  
10. SOP 10: Review Completion State in the Slyder Portal  
11. SOP 11: Process Merchant Interest / Business Inquiry  
12. SOP 12: Review Notification Health  
13. SOP 13: Review System Health  
14. SOP 14: Daily Backup Check  
15. SOP 15: Full End-to-End Readiness Validation  
16. SOP 16: Escalation Matrix  
17. PDF Conversion Guidance  
18. Revision Log

---

<div style="page-break-after: always;"></div>

## SOP 1: Review a New Slyder Application

### Objective

Assess a newly submitted application and decide whether to:

- approve
- reject
- request more documents

### Steps

1. Open Admin Control Tower.
2. Open `Slyder Applications`.
3. Open the applicant detail page.
4. Review:
   - personal information
   - courier type
   - zones and readiness answers
   - document uploads
   - referral attribution if present
5. Confirm the application is coherent and complete.
6. Choose the next action:
   - approve
   - reject
   - request documents
7. Confirm the result modal and check that the page refreshes with the new state.

### Success Criteria

- application status is updated
- audit history is recorded
- notification history reflects the action

---

## SOP 2: Approve a Slyder Application

### Objective

Approve a valid Slyder applicant and trigger activation.

### Steps

1. Open the application detail page.
2. Confirm required application data is present.
3. Confirm required documents are present.
4. Confirm no obvious fraud or duplication issues exist.
5. Click `Approve`.
6. Choose activation channel if needed.
7. Add review notes if required.
8. Confirm the action.
9. Wait for the admin result modal.
10. Verify:
   - application status is approved
   - linked user and Slyder profile are created
   - activation email is logged
   - sync status to SLYDE app is visible

### Expected Outcome

- approved applicant receives activation email
- account becomes activation pending

---

## SOP 3: Reject a Slyder Application

### Objective

Reject an application that should not proceed.

### Steps

1. Open the application detail page.
2. Click `Reject`.
3. Enter a clear rejection reason.
4. Confirm the action.
5. Wait for the result modal.
6. Verify:
   - application status is rejected
   - reason is visible in the record
   - rejection notification is logged
   - SLYDE app sync result is visible

### Expected Outcome

- applicant receives rejection communication
- internal history clearly explains why

---

## SOP 4: Request More Documents

### Objective

Pause review and request specific document rework.

### Steps

1. Open the application detail page.
2. Click `Request documents`.
3. Select required document types.
4. Enter clear notes describing what must be re-uploaded.
5. Submit the request.
6. Verify:
   - application status changes to documents pending
   - requested document types are stored
   - notification was sent

### Good Reviewer Guidance

- be specific
- state what is wrong with the file
- state what the applicant should upload instead

---

## SOP 5: Approve or Reject Individual Documents

### Objective

Update verification state of uploaded documents.

### Steps

1. Open the application detail page.
2. Go to the `Documents` section.
3. Review the file.
4. For each document:
   - approve if valid
   - reject if unreadable or invalid
5. If rejecting, provide a reason.
6. Confirm the result modal.

### Expected Outcome

- document verification state updates immediately
- readiness recalculates if the application is already linked to a Slyder profile

---

<div style="page-break-after: always;"></div>

## SOP 6: Replace a Missing Document File

### Objective

Repair a broken or missing file on an existing document record.

### Steps

1. Open the application detail page.
2. Find the affected document card.
3. Click `Replace file`.
4. Upload the correct replacement file.
5. Wait for the result modal and auto-refresh.
6. Verify:
   - preview becomes available
   - verification resets to pending
   - old rejection metadata is cleared

### Expected Outcome

- the document record now points to a real file
- the document can be reviewed again

---

## SOP 7: Confirm Activation Email Was Sent

### Objective

Verify that an approved Slyder received the activation workflow communication.

### Steps

1. Open the application detail page.
2. Open the notification history section.
3. Locate the `activation ready` email record.
4. Confirm:
   - provider is `resend`
   - recipient email is correct
   - body includes activation link
   - status is sent, delivered, or confirmed
5. If not found or failed, use resend actions.

### Expected Outcome

- the Slyder has a valid activation path

---

## SOP 8: Resend Activation Invite

### Objective

Re-issue or re-send activation instructions.

### Steps

1. Open the Slyder application or onboarding context.
2. Use the resend activation action.
3. Confirm the result modal.
4. Check notification history for the new record.
5. Confirm the latest email includes the activation link and next steps.

### Use Cases

- applicant says email was not received
- applicant lost the original invite
- original token expired

---

## SOP 9: Support a Slyder Through Login and OTP

### Objective

Help an approved Slyder who is blocked after activation.

### Steps

1. Confirm the application was approved.
2. Confirm password setup was completed.
3. Confirm the user is trying the correct email or phone.
4. Ask the user to attempt login again.
5. Confirm the OTP delivery channel.
6. Check notification history for OTP email.
7. If needed, instruct the user to use `Resend code`.

### Important Current Rule

In the current environment, OTP goes by email when live SMS is not configured.

---

## SOP 10: Review Completion State in the Slyder Portal

### Objective

Understand whether the user is blocked by self-service tasks or by ops review.

### Completion states include:

- Action required from Slyder
- Waiting on SLYDE review
- Fully onboarded and waiting for zone launch
- Ready to go online

### Support Rule

If the page says `Waiting on SLYDE review`, do not send the Slyder back through self-service steps unless a re-upload is actually required.

---

## SOP 11: Process Merchant Interest / Business Inquiry

### Objective

Capture, validate, and route merchant demand signals.

### Steps

1. Open merchant or inquiry records.
2. Review company and contact details.
3. Review coverage needs and delivery-volume signal.
4. Confirm legal acknowledgment was recorded.
5. Determine if the record should be:
   - waitlisted
   - followed up by ops
   - marked for launch-readiness planning

### Expected Outcome

- merchant demand is visible by area
- launch planning gets better data

---

<div style="page-break-after: always;"></div>

## SOP 12: Review Notification Health

### Objective

Catch communication failures before they become onboarding failures.

### Steps

1. Open `Admin > Notifications`.
2. Open `Notification Health`.
3. Review:
   - failed count
   - queued count
   - failure reasons
   - channel breakdown
4. Drill into failed notification logs when needed.
5. Retry or resend where appropriate.

### Escalate If

- activation emails are failing repeatedly
- OTP notifications are failing repeatedly
- provider configuration appears degraded

---

## SOP 13: Review System Health

### Objective

Confirm the platform is safe to operate.

### Steps

1. Open `Admin > System Health`.
2. Review:
   - overall status
   - hosting lock
   - persistence state
   - storage state
   - email provider state
   - bot protection state
3. Review warnings.

### Critical Warnings

- local URLs in production settings
- file persistence instead of Prisma
- bot protection disabled
- missing email provider

---

## SOP 14: Daily Backup Check

### Objective

Confirm backup workflow is functioning.

### Steps

1. Confirm the scheduled backup job exists.
2. Confirm a recent backup folder exists under `backups/`.
3. Confirm the latest snapshot timestamp is current.
4. Escalate immediately if no recent backup exists.

### Current Automation

- a Windows scheduled task can run the backup script daily

---

## SOP 15: Full End-to-End Readiness Validation

### Objective

Run a full production-like flow to verify the onboarding stack.

### Current automated scripts

- smoke checks: `npm run e2e:smoke`
- full onboarding flow: `npm run e2e:full-onboarding`

### Full flow verifies

- merchant inquiry
- document upload
- Slyder application
- admin approve path
- admin reject path
- activation email generation
- login and OTP
- onboarding progression to operational eligibility state

### Expected End State

If the zone is not live, the correct finished state is:

- `eligible_offline`

If the zone is live, the correct finished state is:

- `eligible_online`

---

## SOP 16: Escalation Matrix

### Escalate to Engineering

- Prisma / persistence issues
- document storage failures
- activation link failures
- OTP verification failures
- health endpoint degradation
- sync failures to the SLYDE app

### Escalate to Platform Leadership

- suspicious applicant fraud patterns
- repeated notification failures affecting live onboarding
- launch-zone state disputes
- legal or compliance concerns

---

## SOP 17: PDF Conversion Guidance

For final PDF export:

- place one SOP per page or section
- add screenshot callouts under each SOP
- add role labels in page headers
- add a revision log at the end
- keep action buttons and admin labels exactly as they appear in the product

---

## Revision Log

- 2026-03-23: Initial SOP library created from current SLYDE Website logic
