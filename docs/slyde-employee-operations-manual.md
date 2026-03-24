# SLYDE Employee Operations Manual

**Document Type:** Internal Employee Manual  
**Version:** 2026-03-23  
**Prepared For:** SLYDE Operations, Platform, Support, and Launch Teams  
**Platform Scope:** SLYDE Website  
**Status:** PDF-Ready Draft  

---

**Confidential Internal Use Only**

This manual describes the current operating workflows, employee responsibilities, escalation rules, and platform behavior for the SLYDE Website.

---

<div style="page-break-after: always;"></div>

## Table of Contents

1. Document Purpose  
2. Platform Overview  
3. Core Operating Principles  
4. Roles and Responsibilities  
5. Slyder Lifecycle Summary  
6. Public Slyder Application Workflow  
7. Admin Decision Workflow  
8. Document Review Workflow  
9. Activation Workflow  
10. Login and OTP Workflow  
11. Slyder Onboarding Portal Workflow  
12. Merchant and Business Inquiry Workflow  
13. Notifications and Communications  
14. Ops Control Tower Areas  
15. System Health and Production Readiness  
16. Backups and Recovery Basics  
17. Known Current-State Constraints  
18. Daily Operations Checklist  
19. Escalation Rules  
20. PDF Export Notes  
21. Recommended Appendices

---

<div style="page-break-after: always;"></div>

## 1. Document Purpose

This manual explains how the current SLYDE Website operates as an intake, review, activation, and onboarding platform for:

- Slyder applicants
- Approved Slyders completing onboarding
- Merchant interest and business inquiries
- Admin control tower operations
- Notification and operational health workflows

This document is based on the current implemented website logic and is intended to be exported to PDF as an internal employee handbook.

---

## 2. Platform Overview

The SLYDE Website currently serves five main functions:

1. Public Slyder application intake
2. Public merchant and business inquiry intake
3. Admin review and control tower operations
4. Slyder activation, login, and onboarding completion
5. Operational monitoring, notification review, and production readiness visibility

The website is not only a public brand surface. It is an operating system for onboarding and launch-readiness workflows.

---

## 3. Core Operating Principles

- No Slyder should receive usable platform access until an admin approves the application.
- Uploaded documents must be reviewed before a Slyder can become operationally eligible.
- Activation and onboarding are separate from initial application submission.
- Merchant interest is collected first, then reviewed and routed operationally.
- Notifications are operational workflow events, not only communications.
- Admin actions should always be auditable and visible in control tower history.

---

## 4. Roles and Responsibilities

### Platform Admin

- manages legal documents
- manages notification templates and health
- monitors system health
- reviews and overrides onboarding decisions when needed
- oversees launch readiness and production configuration

### Operations Admin

- reviews Slyder applications
- approves, rejects, or requests documents
- replaces missing document files when required
- tracks network readiness and coverage-zone status
- resends key onboarding notifications when necessary

### Onboarding Reviewer

- checks application data quality
- verifies uploaded documents
- confirms readiness state
- escalates suspicious or incomplete applications

### Support / Success Staff

- handles inbound contact requests
- assists with activation and login issues
- helps Slyders understand current onboarding status
- uses admin logs and notification history for follow-up

---

<div style="page-break-after: always;"></div>

## 5. Slyder Lifecycle Summary

The current Slyder lifecycle on the website is:

1. Public application submitted
2. Documents uploaded and stored
3. Admin review begins
4. Admin approves, rejects, or requests more documents
5. If approved, a Slyder user and Slyder profile are provisioned
6. Activation email is sent
7. Slyder activates account and sets password
8. Slyder logs in and completes OTP verification
9. Slyder accepts final activation legal terms
10. Slyder completes setup
11. Slyder completes readiness checklist
12. Admin-reviewed documents and readiness determine operational eligibility
13. If zone is not live, final state is eligible offline
14. If zone is live, final state becomes eligible online / live enabled

---

## 6. Public Slyder Application Workflow

### Intake Inputs

The application flow collects:

- personal information
- contact details
- parish / address / TRN
- courier type
- vehicle details if required
- uploaded documents
- preferences and service zones
- readiness answers
- legal agreement acceptance
- optional referral attribution

### Operational Notes

- document upload happens before application submission
- the intake route is rate-limited
- bot protection is supported via Turnstile
- the system stores uploaded file references and metadata
- application creation triggers submission notifications and legal acceptance recording

### Reviewer Expectations

Reviewers should confirm:

- applicant identity looks coherent
- required documents exist
- courier type matches required document set
- data is not obviously duplicated or fraudulent
- parish / zone selection makes operational sense

---

## 7. Admin Decision Workflow

Admin decisions for Slyder applications include:

- approve
- reject
- request documents
- update document verification
- replace missing document file

### Approve

When approved:

- the application status becomes approved
- a Slyder user is created or linked
- a Slyder profile is created or linked
- an activation token is issued
- approval and activation notifications are triggered
- the website attempts to sync the review decision to the SLYDE app

### Reject

When rejected:

- the application status becomes rejected
- rejection reason is recorded
- rejection notification is sent
- the website attempts to sync the rejection decision to the SLYDE app

### Request Documents

When document rework is needed:

- application status becomes documents pending
- requested document types are recorded
- notes are saved
- document request notification is sent

---

## 8. Document Review Workflow

Each application document can be:

- pending
- approved
- rejected
- replaced by admin

### Required Reviewer Actions

- confirm file matches the expected document type
- confirm image/readability quality
- reject with a clear reason when re-upload is needed
- approve only when the document is sufficient for operational review

### Important Logic

- a Slyder cannot become fully operationally ready until required documents are approved
- when the last required document is approved, the system recalculates readiness and sends a document-review-complete status notification

---

<div style="page-break-after: always;"></div>

## 9. Activation Workflow

The activation sequence is:

1. Slyder receives activation email
2. Slyder opens the activation link
3. Slyder confirms the activation token
4. Slyder sets password
5. System marks account active
6. Activation completion email is sent

### Important Employee Note

Application submission does not create a usable login password.  
Usable credentials begin only after approval and activation.

---

## 10. Login and OTP Workflow

After activation:

1. Slyder logs in with email or phone and password
2. System issues OTP challenge
3. OTP is currently delivered by email when SMS is not configured
4. Slyder verifies OTP
5. Session cookie is created
6. Slyder enters the onboarding portal

### Support Guidance

If the user cannot complete login:

- confirm approval happened
- confirm activation was completed
- confirm the correct email was used
- confirm OTP email was sent
- use resend OTP or activation resend flows where appropriate

---

## 11. Slyder Onboarding Portal Workflow

The portal currently includes these stages:

1. Activate
2. Legal
3. Setup
4. Readiness
5. Complete

### Legal

The Slyder must accept the active Slyder activation legal documents before proceeding.

### Setup

Setup confirms operational account prerequisites like:

- profile completion
- payout setup state
- permission state
- required agreement state

### Readiness

Readiness confirms:

- location permissions
- notification permissions
- equipment confirmation
- training acknowledgment
- emergency-contact confirmation

### Complete

The completion page acts as a status board:

- Action required from Slyder
- Waiting on SLYDE review
- Fully onboarded and waiting for zone launch
- Ready for live operations

---

## 12. Merchant and Business Inquiry Workflow

The website currently captures:

- merchant interest
- business inquiries
- API access requests
- contact requests

### Merchant Interest

Merchant intake records:

- company and contact details
- business type
- delivery volume
- coverage needs
- goals
- merchant legal acknowledgments

### Operational Meaning

Merchant intake is a demand and waitlist signal.  
It is not immediate merchant activation.

### Notifications

Merchant workflows can trigger:

- merchant interest confirmation
- waitlist style notifications
- future zone-live notices

---

## 13. Notifications and Communications

Current notification categories include:

- application submitted
- documents requested
- approved
- rejected
- activation ready
- activation completed
- OTP
- document review complete
- status update
- zone live
- merchant interest intake
- admin failure alerts

### Channel Logic

- email is currently live through Resend
- WhatsApp depends on Twilio configuration
- SMS is currently not live in this environment
- OTP falls back to email when SMS is unavailable

### Employee Rule

Always review notification history before manually resending a message.  
Do not assume a user failed to receive a message until logs confirm status or failure.

---

<div style="page-break-after: always;"></div>

## 14. Ops Control Tower Areas

Key admin areas include:

- Dashboard
- Slyder Applications
- Approved Slyders
- Coverage Zones
- Network Readiness
- Notifications
- Launch Control
- Legal Documents
- Legal Acceptances
- System Health

### What Ops Should Watch Daily

- new applications
- pending document reviews
- rejected / blocked applications
- notification failures
- zone readiness progress
- production health warnings

---

## 15. System Health and Production Readiness

The website now exposes a health model for:

- hosting lock
- persistence health
- upload storage health
- email/WhatsApp/SMS readiness
- bot protection status
- critical env checks

### Current Production Rules

The system should not be considered fully production locked if:

- persistence is still file-based
- website base URL is local
- SLYDE app sync URL is local
- Turnstile is not configured
- email provider is missing

---

## 16. Backups and Recovery Basics

Current backup baseline:

- local `.data` snapshot script exists
- backups are written to `backups/`
- a scheduled Windows task can run the backup script daily

### Minimum Recovery Rule

Never rely on the live `.data` directory alone as the only recoverable copy.

---

## 17. Known Current-State Constraints

Employees should understand the following current constraints:

- the system still uses mixed persistence in the present environment
- full production cutover to Prisma/Postgres is not yet complete
- Turnstile support is wired, but enforcement depends on real keys
- WhatsApp and SMS are not fully live in the current local environment
- final live readiness also depends on zone launch status

---

## 18. Daily Operations Checklist

At the start of each day:

- review system health
- review notification failures
- review new Slyder applications
- review document-pending items
- review merchant interest volume
- review coverage-zone and network-readiness state

At the end of each day:

- ensure critical applications were reviewed
- ensure outstanding re-upload requests are clear
- ensure activation and onboarding blockers were followed up
- confirm backup status

---

## 19. Escalation Rules

Escalate to platform leadership or engineering if:

- activation emails are not being sent
- OTP verification is failing repeatedly
- document previews are missing due to storage problems
- application approvals are not syncing to the SLYDE app
- health status becomes unhealthy
- persistence, storage, or notifications are degraded without explanation

---

## 20. PDF Export Notes

For a PDF-ready export:

- keep this manual as the master employee handbook
- pair it with the SOP document for task-by-task operations
- add screenshots from the admin control tower and Slyder portal in the final PDF version
- use the appendices file for workflow charts and screen references

---

## 21. Recommended Appendices

Appendix A:
- admin UI screenshots

Appendix B:
- notification template map

Appendix C:
- coverage-zone launch definitions

Appendix D:
- employee escalation contacts

Appendix E:
- environment and production-readiness checklist
