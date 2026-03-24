# SLYDE Manual Appendices

**Document Type:** Manual Appendices and Visual Support Pack  
**Version:** 2026-03-23  
**Status:** PDF-Ready Draft

---

**Purpose**

This document is intended to sit behind the main employee manual and SOP library when exported to PDF. It contains screenshot placeholders, workflow chart layouts, and appendix content blocks for internal training packs.

---

<div style="page-break-after: always;"></div>

## Table of Contents

1. Appendix A: Screenshot Placeholder Plan  
2. Appendix B: Workflow Charts  
3. Appendix C: Notification Map  
4. Appendix D: Coverage and Launch Definitions  
5. Appendix E: Escalation and Contact Sheet  
6. Appendix F: Production Readiness Snapshot Template

---

<div style="page-break-after: always;"></div>

## Appendix A: Screenshot Placeholder Plan

Insert these screenshots into the final PDF export.

### A1. Public Slyder Application Flow

Placeholder:

- Screenshot: public application step 1
- Screenshot: courier-type selection
- Screenshot: document upload section
- Screenshot: review/submit page

Use caption format:

- `Figure A1.1 - Public Slyder application entry`
- `Figure A1.2 - Document upload and validation`

### A2. Admin Control Tower

Placeholder:

- Screenshot: admin dashboard
- Screenshot: Slyder applications list
- Screenshot: Slyder application detail page
- Screenshot: documents section with review actions
- Screenshot: notifications panel in application detail

### A3. Slyder Activation and Login

Placeholder:

- Screenshot: activation email example
- Screenshot: activation page
- Screenshot: set-password screen
- Screenshot: login page
- Screenshot: OTP step

### A4. Slyder Onboarding Portal

Placeholder:

- Screenshot: onboarding welcome page
- Screenshot: legal step
- Screenshot: setup step
- Screenshot: readiness step
- Screenshot: completion page showing waiting on review
- Screenshot: completion page showing eligible offline

### A5. Merchant / Business Intake

Placeholder:

- Screenshot: business inquiry form
- Screenshot: merchant interest view in admin

---

## Appendix B: Workflow Charts

### B1. Slyder End-to-End Workflow

```text
Public Apply
   |
   v
Document Upload
   |
   v
Admin Review
   |----------------------|
   |                      |
   v                      v
Approve                Reject
   |                      |
   v                      v
Activation Email       Rejection Notice
   |
   v
Set Password
   |
   v
Login + OTP
   |
   v
Legal Acceptance
   |
   v
Setup
   |
   v
Readiness
   |
   v
Documents Approved?
   |----------------------|
   |                      |
   v                      v
No                    Yes
   |                      |
   v                      v
Waiting on Review     Zone Live?
                          |-----------|
                          |           |
                          v           v
                        No         Yes
                          |           |
                          v           v
                  Eligible Offline  Eligible Online
```

### B2. Merchant Interest Workflow

```text
Business / Merchant Inquiry
          |
          v
Legal Acknowledgment Recorded
          |
          v
Merchant Interest Stored
          |
          v
Ops Review / Waitlist Handling
          |
          v
Zone and Launch Planning
          |
          v
Future Merchant Activation Path
```

### B3. Notification Workflow

```text
Workflow Event
    |
    v
Trigger Event Created
    |
    v
Template Selected
    |
    v
Provider Dispatch
    |
    |------ success ------> sent / delivered / confirmed
    |
    |------ failure ------> failed + failure alert path
```

---

<div style="page-break-after: always;"></div>

## Appendix C: Notification Map

### Slyder Notifications

- application submitted
- documents requested
- approved
- rejected
- activation ready
- activation completed
- OTP
- status update
- document review complete
- zone live

### Merchant Notifications

- merchant interest received
- waitlist confirmation
- zone live

### Admin Notifications

- notification failure alert
- zone near ready alert

---

## Appendix D: Coverage and Launch Definitions

Suggested glossary for final PDF:

- `Not Ready`: Zone has low network readiness and is not near launch.
- `Building`: Zone is forming but still below near-ready threshold.
- `Near Ready`: Zone is approaching launch requirements.
- `Ready`: Zone meets readiness criteria but may not be live yet.
- `Live`: Zone is open for operations.
- `Paused`: Zone is temporarily restricted from live operations.

Operational Slyder states:

- `Activation Pending`
- `Contract Pending`
- `Setup Incomplete`
- `Readiness Pending`
- `Eligible Offline`
- `Eligible Online`
- `Blocked`

---

## Appendix E: Escalation and Contact Sheet

Replace the placeholders below before final PDF export.

### Internal Escalation Contacts

- Platform Lead: `[insert name / email / phone]`
- Operations Lead: `[insert name / email / phone]`
- Support Lead: `[insert name / email / phone]`
- Engineering Escalation: `[insert name / email / phone]`

### Emergency System Escalations

- Persistence failure: `[insert contact]`
- Notification delivery failure: `[insert contact]`
- Sync failure with SLYDE app: `[insert contact]`
- Legal / compliance issue: `[insert contact]`

---

## Appendix F: Production Readiness Snapshot Template

Use this page as a reusable readiness signoff sheet.

### Environment

- `NODE_ENV=production`
- `PERSISTENCE_DRIVER=prisma`
- website base URL is public
- app sync URL is public

### Bot Protection

- Turnstile site key configured
- Turnstile secret configured
- mode set to `enforce`

### Notifications

- Resend configured
- sender verified
- WhatsApp configured if required
- OTP path validated

### Storage and Backup

- upload storage healthy
- recent backup exists
- restore test completed

### Operational Validation

- merchant inquiry tested
- Slyder application tested
- admin approve tested
- admin reject tested
- activation email tested
- login and OTP tested
- onboarding to `eligible_offline` or `eligible_online` tested

Signoff:

- Ops Lead: __________________
- Platform Lead: __________________
- Date: __________________
