# SLYDE Role Access Matrix

**Document Type:** Internal Access and Route Reference  
**Version:** 2026-03-24  
**Prepared For:** SLYDE Operations, Platform, HR, and Support Teams  
**Platform Scope:** SLYDE Website and Internal Portals  

---

## 1. Role Matrix

| Role | Audience | Entry Point | Protected Area | Approval Path |
|---|---|---|---|---|
| `platform_admin` | Platform leadership and full control-tower admins | Session-based admin access | `/admin` | Internal/admin-created access |
| `operations_admin` | Operations admins handling reviews, readiness, and control workflows | Session-based admin access | `/admin` | Internal/admin-created access |
| `slyder` | Approved Slyder couriers/operators | `/slyder/login` | `/slyder/onboarding/*` and Slyder protected flows | `/become-a-slyder/apply` -> admin review -> approval -> activation |
| `employee_staff` | General internal employees | `/employee/login` | `/employee/portal/*` | `/careers/apply` -> internal review/provisioning |
| `employee_logistics` | Logistics staff | `/employee/login` | `/employee/portal/*` | `/careers/apply` -> internal review/provisioning |
| `employee_supervisor` | Supervisors | `/employee/login` | `/employee/portal/*` | Internal review/provisioning |
| `employee_manager` | Managers | `/employee/login` | `/employee/portal/*` | Internal review/provisioning |
| `employee_hr` | HR team | `/employee/login` | `/employee/portal/*` | Internal review/provisioning |
| `employee_payroll` | Payroll team | `/employee/login` | `/employee/portal/*` | Internal review/provisioning |

---

## 2. Access Flowchart

```text
PUBLIC USER
|
+-- Wants to become a Slyder
|   |
|   +-- /become-a-slyder/apply
|   +-- Admin review
|   +-- Approved
|   +-- Activation issued
|   +-- /slyder/login
|   +-- /slyder/onboarding/*
|   +-- Active Slyder access
|
+-- Wants to become an employee
|   |
|   +-- /careers/apply
|   +-- Internal employee review / provisioning
|   +-- Employee account created
|   +-- /employee/login
|   +-- /employee/onboarding
|   +-- /employee/portal/*
|
+-- Is an admin
    |
    +-- internal/admin-created account
    +-- authenticated session
    +-- /admin
```

---

## 3. Role By Route Access

| Route Area | `platform_admin` | `operations_admin` | `slyder` | `employee_*` |
|---|---:|---:|---:|---:|
| `/admin` | Yes | Yes | No | No |
| `/become-a-slyder/apply` | Public | Public | Public | Public |
| `/slyder/login` | No | No | Yes | No |
| `/slyder/onboarding/*` | No | No | Yes | No |
| `/careers/apply` | Public | Public | Public | Public |
| `/employee/login` | No | No | No | Yes |
| `/employee/onboarding` | No | No | No | Yes |
| `/employee/portal/*` | No | No | No | Yes |
| Public marketing pages | Yes | Yes | Yes | Yes |

---

## 4. Notes

- `slyder` is a courier/operator role and should remain separate from employee roles.
- `employee_*` roles are internal staff roles and use the dedicated employee portal.
- `platform_admin` and `operations_admin` are admin/control-tower roles and use the admin area.
- This document is intended as a quick route and role reference for internal use.
