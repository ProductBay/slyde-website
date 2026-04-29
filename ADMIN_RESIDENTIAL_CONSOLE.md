# Home-Slyde Residential Admin Console

**Deployed:** Commit `5cd9edc`  
**Status:** Production Ready ✅

## Overview

A professional-grade admin console for managing the Home-Slyde residential pickup and dispatch system. Admins can view resident signups, approve/reject applications, and manage the complete dispatch request lifecycle from submission through delivery.

## Architecture

### Core Components

1. **Admin Module** (`src/modules/admin/residential-management/`)
   - `residential-admin.repository.ts` - Database queries for residential data
   - `residential-admin.actions.ts` - Server actions for admin operations with audit logging

2. **Admin Pages** (`src/app/admin/residential/`)
   - Dashboard: `/admin/residential` - Overview with key metrics
   - Leads: `/admin/residential/leads` - List and manage resident signups
   - Lead Detail: `/admin/residential/leads/[id]` - Full lead view with approval/rejection
   - Requests: `/admin/residential/requests` - Monitor dispatch requests
   - Request Detail: `/admin/residential/requests/[id]` - Full request lifecycle management

3. **Main Admin Link** (`src/app/admin/page.tsx`)
   - Quick access card with links to residential dashboard, leads, and requests

## Key Features

### Resident Leads Management

**URL:** `/admin/residential/leads`

#### List View
- Paginated table of all resident signups
- Search by: name, phone, email, reference code
- Filter by status: submitted, approved, rejected
- Display dispatch request status for each lead
- Sign-up date tracking

#### Detail View
**URL:** `/admin/residential/leads/[id]`

- Full resident information (name, contact, parish, area)
- Current application status
- **Admin Actions:**
  - ✅ **Approve** - Accept lead and enable dispatch capability
  - ❌ **Reject** - Reject with detailed reason for audit trail
- View dispatch intent (pickup address, dropoff location, parcel category, payment method)
- Monitor handoff job status and any retry errors
- Access linked dispatch requests

### Dispatch Requests Management

**URL:** `/admin/residential/requests`

#### List View
- Paginated table of all dispatch requests
- Search by: reference code, address
- Filter by request status: pending, confirmed, in_transit, picked_up, delivered, cancelled, failed
- Filter by payment status: pending, authorized, captured, refunded, failed
- Display route summary (pickup → dropoff)
- Show parcel category and urgency level
- Date submitted tracking

#### Detail View
**URL:** `/admin/residential/requests/[id]`

- Full request information and route details
- **Status Management:**
  - **Pending:** Can confirm, cancel, or mark failed
  - **Confirmed/In Transit:** Can mark picked up
  - **Picked Up:** Can mark delivered
  - **Terminal States** (delivered, cancelled, failed): View-only
  
- **Admin Actions:**
  - ✅ **Confirm** - Move from pending to confirmed
  - 🚚 **Mark Picked Up** - Update to picked up status
  - ✅ **Mark Delivered** - Complete the request
  - ❌ **Cancel** - Cancel with detailed reason
  - ⚠️ **Mark Failed** - Mark failed with reason for tracking

- **Timeline View:**
  - Submitted, confirmed, rider assigned, picked up, delivered timestamps
  - Event log with all request state changes

- **Route Information:**
  - Pickup address with parish/area
  - Dropoff address with parish/area
  - Parcel notes and instructions
  - Distance and urgency level

- **Payment Tracking:**
  - Payment method (wallet, card, cash)
  - Payment status with authorization/capture/refund tracking
  - Payment reference

### Admin Dashboard

**URL:** `/admin/residential`

#### Key Metrics
- **Total Residents** - Cumulative signups
- **New (30 days)** - Recent signup activity
- **Total Requests** - All dispatch requests ever created
- **Pending Requests** - Waiting for confirmation
- **Completed** - Successfully delivered
- **Success Rate** - Delivery success percentage

#### Quick Actions
- Fast links to leads list and requests list

#### Workflow Guide
Educational cards explaining the admin workflow:
1. New Lead Signup → Appears in "Leads" with status "submitted"
2. Review & Approve → Decide to approve or reject with reason
3. Submit Dispatch Request → Approved residents can submit requests
4. Manage Request Lifecycle → Update status as request progresses
5. Handle Issues → Cancel or mark failed with detailed audit trail

## Data Models

### ResidentialLead
```typescript
- id: string (UUID)
- userId: string
- referenceCode: string (unique)
- fullName: string
- phone: string
- email?: string
- parish: string
- area: string
- status: "submitted" | "approved" | "rejected"
- sourceCampaign?: string
- ipAddress?: string
- userAgent?: string
- createdAt: DateTime
- updatedAt: DateTime
- Relations:
  - user: User
  - dispatchIntent: ResidentialDispatchIntent
  - dispatchRequest: ResidentialDispatchRequest
  - handoffJob: ResidentialHandoffJob
```

### ResidentialDispatchRequest
```typescript
- id: string (UUID)
- leadId: string
- userId: string
- referenceCode: string (unique)
- status: "pending" | "confirmed" | "in_transit" | "picked_up" | "delivered" | "cancelled" | "failed"
- paymentMethod: "wallet" | "card" | "cash_on_delivery"
- pickupAddress: string
- pickupParish: string
- pickupArea: string
- dropoffAddress: string
- dropoffParish: string
- dropoffArea: string
- parcelCategory: string
- parcelNotes?: string
- urgency: string
- preferredWindow?: string
- paymentStatus: "pending" | "authorized" | "captured" | "refunded" | "failed"
- submittedAt: DateTime
- confirmedAt?: DateTime
- riderAssignedAt?: DateTime
- pickedUpAt?: DateTime
- deliveredAt?: DateTime
- cancelledAt?: DateTime
- failureReason?: string
- createdAt: DateTime
- updatedAt: DateTime
- Relations:
  - lead: ResidentialLead
  - user: User
  - events: ResidentialRequestEvent[]
```

## Server-Side Functions

### Repository (`residential-admin.repository.ts`)

#### Query Functions
- `getResidentialLeadsForAdmin(limit, offset, filters)` - Paginated leads with filtering
- `getResidentialLeadDetails(leadId)` - Full lead details with all relations
- `getResidentialDispatchRequestsForAdmin(limit, offset, filters)` - Paginated requests
- `getResidentialDispatchRequestDetails(requestId)` - Full request details
- `getResidentialStats()` - Dashboard metrics

#### Update Functions
- `updateResidentialLeadStatus(leadId, status)` - Change lead status
- `updateDispatchRequestStatus(requestId, status)` - Change request status with timestamp management

### Server Actions (`residential-admin.actions.ts`)

All actions require `requireAdminContext()` and create audit logs.

#### Lead Actions
- `adminApproveResidentialLead(leadId)` - Approve lead for dispatch
- `adminRejectResidentialLead(leadId, reason)` - Reject with reason

#### Request Status Actions
- `adminConfirmDispatchRequest(requestId)` - Confirm pending request
- `adminMarkPickedUp(requestId)` - Update to picked up
- `adminMarkDelivered(requestId)` - Mark as delivered (complete)
- `adminCancelDispatchRequest(requestId, failureReason)` - Cancel with reason
- `adminMarkFailed(requestId, reason)` - Mark failed with reason

All actions return `{ success: boolean; data?; error?: string }` for client handling.

## User Interface

### Design System
- **Colors:** Status badges (blue, green, red, yellow, purple, orange)
- **Components:** Data tables with hover states, search bars, filter dropdowns, pagination
- **Patterns:** Master-detail navigation (list → detail pages)
- **Forms:** Textarea for approval/rejection reasons with confirmation flow

### Search & Filter
- Real-time search on leads list
- Status filters with multi-select capability
- Payment status filters for requests
- Parish filters for location-based queries
- Clear pagination with prev/next controls

### Responsive Design
- Mobile-friendly table scrolling
- Grid layouts that adapt to screen size
- Touch-friendly buttons and form controls
- Proper spacing and typography hierarchy

## Security & Audit

- **Access Control:** All routes require `requireAdminContext()` authentication
- **Audit Logging:** Every admin action creates detailed audit log entry with:
  - Admin ID
  - Action type
  - Resource ID and type
  - Previous and new values
  - Custom metadata (name, phone, reason, etc.)
- **Data Validation:** Server-side validation on all update operations
- **Error Handling:** Graceful error messages returned to admin

## Workflow Example

### Scenario: New Resident Signs Up and Submits Request

1. **Day 1 - New Signup**
   - Resident signs up at `/dispatch-from-home/start`
   - Lead appears in `/admin/residential/leads` with status "submitted"
   - Admin reviews lead details

2. **Day 1 - Admin Approves**
   - Admin clicks "Approve" button
   - Lead status changes to "approved"
   - Audit log created with approval timestamp
   - Resident can now submit dispatch requests

3. **Day 2 - Resident Submits Request**
   - Resident fills out dispatch form at `/dispatch-from-home/start`
   - Request appears in `/admin/residential/requests` with status "pending"
   - Admin receives notification (optional future feature)

4. **Day 2 - Admin Confirms**
   - Admin reviews request in `/admin/residential/requests/[id]`
   - Clicks "Confirm" button
   - Status changes to "confirmed"
   - Timestamp recorded

5. **Day 3 - Request Progresses**
   - Admin marks "Picked Up" → status: `picked_up`
   - Admin marks "Delivered" → status: `delivered`
   - Request shows as complete in dashboard

6. **Audit Trail**
   - All actions logged with admin ID, timestamp, previous/new values
   - Visible in request timeline for full traceability

## Next Steps / Future Enhancements

1. **Real-time Updates**
   - WebSocket updates when new leads/requests arrive
   - Live notification system for admin

2. **Batch Operations**
   - Bulk approve/reject leads
   - Bulk status updates for requests

3. **Advanced Reporting**
   - Export leads/requests to CSV
   - Custom date range reports
   - Parish-level analytics

4. **Automation Rules**
   - Auto-approve leads based on criteria
   - Auto-assign riders (integration with rider system)
   - Payment processing automation

5. **Mobile App**
   - Admin mobile app for on-the-go management
   - Push notifications for pending actions

6. **Integration**
   - SMS/WhatsApp notifications to residents
   - Payment gateway webhook handling
   - Rider assignment system

## Testing Checklist

- [ ] Leads list loads with pagination
- [ ] Search works (name, phone, email, reference)
- [ ] Status filter works
- [ ] Lead detail page loads all data
- [ ] Approve button works (status changes)
- [ ] Reject button works with reason
- [ ] Requests list loads with pagination
- [ ] Request status filters work
- [ ] Request detail page loads all data
- [ ] Confirm button works (pending → confirmed)
- [ ] Picked up button works (confirmed → picked_up)
- [ ] Delivered button works (picked_up → delivered)
- [ ] Cancel button shows form and saves reason
- [ ] Failed button shows form and saves reason
- [ ] Timeline updates with new timestamps
- [ ] Audit logs created for all actions
- [ ] Dashboard metrics load and update
- [ ] Mobile responsive on tablets/phones

## Support

For issues or feature requests related to the residential admin console, refer to:
- Main admin: `/admin`
- Residential dashboard: `/admin/residential`
- Lead docs: `src/app/admin/residential/leads/`
- Request docs: `src/app/admin/residential/requests/`

---

**Built:** 2026-04-29  
**Deployed:** Commit 5cd9edc  
**Version:** 1.0.0 (Initial Release)
