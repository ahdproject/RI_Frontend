import DashboardByRole       from "../protected/Shared/DashboardByRole.jsx";
import SuperAdminProfile     from "../protected/Profile/SuperAdminProfile.jsx";
import AdminProfile          from "../protected/Profile/AdminProfile.jsx";
import AccountantProfile     from "../protected/Profile/AccountantProfile.jsx";
import ViewerProfile         from "../protected/Profile/ViewerProfile.jsx";
import TenantManagement      from "../protected/Tenants/TenantManagement.jsx";
import SuperAdminSubscriptions from "../protected/Subscriptions/SuperAdminSubscriptions.jsx";
import TenantSubscription    from "../protected/Subscriptions/TenantSubscription.jsx";
import UserManagement        from "../protected/Settings/UserManagement.jsx";
import Clients               from "../protected/Clients/Clients.jsx";
import ClientForm            from "../protected/Clients/ClientForm.jsx";
import ClientDetail          from "../protected/Clients/ClientDetail.jsx";
import TaxRateForm           from "../protected/Masters/TaxRates/TaxRateForm.jsx";
import TaxRateList           from "../protected/Masters/TaxRates/TaxRateList.jsx";
import ParticularForm        from "../protected/Masters/Particulars/ParticularForm.jsx";
import ParticularList        from "../protected/Masters/Particulars/ParticularList.jsx";
import PaymentModeList       from "../protected/Masters/PaymentModes/PaymentModeList.jsx";
import TenantsByRole         from "../protected/Tenants/TenantsByRole.jsx";
import InvoiceList           from "../protected/Inovices/utils/InvoiceList.jsx";
import CreateInvoice         from "../protected/Inovices/utils/CreateInvoice.jsx";
import InvoiceDetails        from "../protected/Inovices/utils/InvoiceDetails.jsx";
import EditInvoice           from "../protected/Inovices/utils/EditInvoice.jsx";
import PaymentList           from "../protected/Payments/utils/PaymentList.jsx";
import RecordPayment         from "../protected/Payments/utils/RecordPayment.jsx";
import PaymentDetails        from "../protected/Payments/utils/PaymentDetails.jsx";
import CreateSchedule        from "../protected/RecurringSchedules/utils/CreateSchedule.jsx";
import ScheduleDetails       from "../protected/RecurringSchedules/utils/ScheduleDetails.jsx";
import ScheduleList          from "../protected/RecurringSchedules/utils/ScheduleList.jsx";
import Reminders             from "../protected/Reminders/Reminders.jsx";
import Reports               from "../protected/Reports/Reports.jsx";
import Settings              from "../protected/Settings/Settings.jsx";
import AppDocs               from "../protected/Docs/AppDocs.jsx";
import MediaLibrary          from "../protected/Template/Media/MediaLibrary.jsx";
import TemplatesByRole       from "../protected/Template/Templates/TemplatesByRole.jsx";
import BillTemplateEditor    from "../protected/Template/Editor/BillTemplateEditor.jsx";

// ── Raut Industries — Bills (Reports) & BMS ─────────────────────────────────
import BillsList             from "../protected/Manager/Bills/BillsList.jsx";
import BillForm              from "../protected/Manager/Bills/BillForm.jsx";
import BillPreview           from "../protected/Manager/Bills/BillPreview.jsx";
import BmsInvoiceList        from "../protected/Manager/Bms/BmsInvoiceList.jsx";
import BmsCreateInvoice      from "../protected/Manager/Bms/BmsCreateInvoice.jsx";

import { ROLE_CODES } from "../../services/utils/rbac.js";

import {
  IconBuildingSkyscraper,
  IconHome,
  IconSettings,
  IconBuildingBank,
  IconBuilding,
  IconPackage,
  IconFileInvoice,
  IconCash,
  IconRepeat,
  IconBell,
  IconChartBar,
  IconCode,
  IconBook,
  IconTemplate,
  IconReceiptTax,  // ← used for BMS section
} from "@tabler/icons-react";

// Role shorthand — Raut's MANAGER maps to ACCOUNTANT in BMS role system
const ALL   = [ROLE_CODES.SUPER_ADMIN, ROLE_CODES.ADMIN, ROLE_CODES.ACCOUNTANT, ROLE_CODES.VIEWER];
const STAFF = [ROLE_CODES.SUPER_ADMIN, ROLE_CODES.ADMIN, ROLE_CODES.ACCOUNTANT];
const ADMIN = [ROLE_CODES.SUPER_ADMIN, ROLE_CODES.ADMIN];

const features = [

  // ── Dashboard ─────────────────────────────────────────────────────────────
  {
    id: "dashboard",
    featureName: DashboardByRole,
    displayName: "Dashboard",
    logoUsed: IconHome,
    route: "/dashboard",
    allowedRoles: ALL,
    hasSubmenu: false,
    submenu: [],
  },

  // ── Clients ───────────────────────────────────────────────────────────────
  {
    id: "clients",
    featureName: null,
    displayName: "Clients",
    logoUsed: IconBuildingSkyscraper,
    route: null,
    allowedRoles: ALL,
    hasSubmenu: true,
    submenu: [
      { label: "Client List", route: "/clients",     featureName: Clients,    allowedRoles: ALL   },
      { label: "Add Client",  route: "/clients/new", featureName: ClientForm, allowedRoles: STAFF },
    ],
  },

  // ── BMS Invoices (existing BMS system) ────────────────────────────────────
  {
    id: "invoices",
    featureName: InvoiceList,
    displayName: "Invoices",
    logoUsed: IconFileInvoice,
    route: "/invoices",
    allowedRoles: ALL,
    hasSubmenu: false,
    submenu: [],
  },
  {
    id: "invoice-new-hidden",
    featureName: CreateInvoice,
    route: "/invoices/new",
    allowedRoles: STAFF,
    hasSubmenu: false,
    submenu: [],
    showInSidebar: false,
  },
  {
    id: "invoice-detail-hidden",
    featureName: InvoiceDetails,
    route: "/invoices/:invoice_id",
    allowedRoles: ALL,
    hasSubmenu: false,
    submenu: [],
    showInSidebar: false,
  },
  {
    id: "invoice-edit-hidden",
    featureName: EditInvoice,
    route: "/invoices/:invoice_id/edit",
    allowedRoles: STAFF,
    hasSubmenu: false,
    submenu: [],
    showInSidebar: false,
  },

  // ── Payments ──────────────────────────────────────────────────────────────
  {
    id: "payments",
    featureName: PaymentList,
    displayName: "Payments",
    logoUsed: IconCash,
    route: "/payments",
    allowedRoles: ALL,
    hasSubmenu: false,
    submenu: [],
  },
  {
    id: "payment-new-hidden",
    featureName: RecordPayment,
    route: "/payments/new",
    allowedRoles: STAFF,
    hasSubmenu: false,
    submenu: [],
    showInSidebar: false,
  },
  {
    id: "payment-detail-hidden",
    featureName: PaymentDetails,
    route: "/payments/:payment_id",
    allowedRoles: ALL,
    hasSubmenu: false,
    submenu: [],
    showInSidebar: false,
  },
  {
    id: "payment-edit-hidden",
    featureName: PaymentDetails,
    route: "/payments/:payment_id/edit",
    allowedRoles: STAFF,
    hasSubmenu: false,
    submenu: [],
    showInSidebar: false,
  },

  // ── Recurring ─────────────────────────────────────────────────────────────
  {
    id: "recurring-schedules",
    featureName: ScheduleList,
    displayName: "Recurring",
    logoUsed: IconRepeat,
    route: "/recurring-schedules",
    allowedRoles: ALL,
    hasSubmenu: false,
    submenu: [],
  },
  {
    id: "schedule-new-hidden",
    featureName: CreateSchedule,
    route: "/recurring-schedules/new",
    allowedRoles: STAFF,
    hasSubmenu: false,
    submenu: [],
    showInSidebar: false,
  },
  {
    id: "schedule-detail-hidden",
    featureName: ScheduleDetails,
    route: "/recurring-schedules/:schedule_id",
    allowedRoles: ALL,
    hasSubmenu: false,
    submenu: [],
    showInSidebar: false,
  },
  {
    id: "schedule-edit-hidden",
    featureName: CreateSchedule,
    route: "/recurring-schedules/:schedule_id/edit",
    allowedRoles: STAFF,
    hasSubmenu: false,
    submenu: [],
    showInSidebar: false,
  },

  // ── Reminders ─────────────────────────────────────────────────────────────
  {
    id: "reminders",
    featureName: Reminders,
    displayName: "Reminders",
    logoUsed: IconBell,
    route: "/reminders",
    allowedRoles: ALL,
    hasSubmenu: false,
    submenu: [],
  },

  // ── Reports (BMS built-in reports) ────────────────────────────────────────
  {
    id: "reports",
    featureName: Reports,
    displayName: "Reports",
    logoUsed: IconChartBar,
    route: "/reports",
    allowedRoles: ALL,
    hasSubmenu: false,
    submenu: [],
  },

  // ── Reports (Raut Industries Bills — renamed from "Bills") ────────────────
  // NOTE: routes stay as /bills/* — only the sidebar display name changed
  {
    id: "raut-bills",
    featureName: null,
    displayName: "Raut Reports",          // ← "Bills" renamed to "Raut Reports"
    logoUsed: IconChartBar,
    route: null,
    allowedRoles: STAFF,
    hasSubmenu: true,
    submenu: [
      {
        label: "Bill List",
        route: "/bills",
        featureName: BillsList,
        allowedRoles: STAFF,
      },
      {
        label: "New Bill",
        route: "/bills/new",
        featureName: BillForm,
        allowedRoles: STAFF,
      },
    ],
  },
  // Hidden bill routes
  {
    id: "bill-preview-hidden",
    featureName: BillPreview,
    route: "/bills/:id/preview",
    allowedRoles: STAFF,
    hasSubmenu: false,
    submenu: [],
    showInSidebar: false,
  },
  {
    id: "bill-edit-hidden",
    featureName: BillForm,
    route: "/bills/:id/edit",
    allowedRoles: STAFF,
    hasSubmenu: false,
    submenu: [],
    showInSidebar: false,
  },

  // ── BMS Integration (Create & Send invoices via BMS API) ──────────────────
  {
    id: "bms",
    featureName: null,
    displayName: "BMS",
    logoUsed: IconReceiptTax,
    route: null,
    allowedRoles: STAFF,
    hasSubmenu: true,
    submenu: [
      {
        label: "Invoice List",
        route: "/bms/invoices",
        featureName: BmsInvoiceList,
        allowedRoles: STAFF,
      },
      {
        label: "Create Invoice",
        route: "/bms/invoices/new",
        featureName: BmsCreateInvoice,
        allowedRoles: STAFF,
      },
    ],
  },
  // Hidden BMS invoice detail
  {
    id: "bms-invoice-detail-hidden",
    featureName: BmsInvoiceList,
    route: "/bms/invoices/:id",
    allowedRoles: STAFF,
    hasSubmenu: false,
    submenu: [],
    showInSidebar: false,
  },

  // ── Masters ───────────────────────────────────────────────────────────────
  {
    id: "masters",
    featureName: null,
    displayName: "Masters",
    logoUsed: IconPackage,
    route: null,
    allowedRoles: ALL,
    hasSubmenu: true,
    submenu: [
      { label: "Tax Rates",           route: "/masters/tax-rates",     featureName: TaxRateList,    allowedRoles: ALL },
      { label: "Billing Particulars", route: "/masters/particulars",   featureName: ParticularList, allowedRoles: ALL },
      { label: "Payment Modes",       route: "/masters/payment-modes", featureName: PaymentModeList,allowedRoles: ALL },
    ],
  },
  {
    id: "tax-rate-new-hidden",
    featureName: TaxRateForm,
    route: "/masters/tax-rates/new",
    allowedRoles: ADMIN,
    hasSubmenu: false, submenu: [], showInSidebar: false,
  },
  {
    id: "tax-rate-edit-hidden",
    featureName: TaxRateForm,
    route: "/masters/tax-rates/:tax_rate_id/edit",
    allowedRoles: ADMIN,
    hasSubmenu: false, submenu: [], showInSidebar: false,
  },
  {
    id: "particular-new-hidden",
    featureName: ParticularForm,
    route: "/masters/particulars/new",
    allowedRoles: ADMIN,
    hasSubmenu: false, submenu: [], showInSidebar: false,
  },
  {
    id: "particular-edit-hidden",
    featureName: ParticularForm,
    route: "/masters/particulars/:particular_id/edit",
    allowedRoles: ADMIN,
    hasSubmenu: false, submenu: [], showInSidebar: false,
  },

  // ── Templates ─────────────────────────────────────────────────────────────
  {
    id: "templates",
    featureName: null,
    displayName: "Templates",
    logoUsed: IconTemplate,
    route: null,
    allowedRoles: ALL,
    hasSubmenu: true,
    submenu: [
      { label: "Invoice Templates", route: "/templates", featureName: TemplatesByRole, allowedRoles: ALL },
      { label: "Media",             route: "/media",     featureName: MediaLibrary,    allowedRoles: ALL },
    ],
  },
  {
    id: "template-new",
    featureName: BillTemplateEditor,
    route: "/templates/new",
    allowedRoles: STAFF,
    showInSidebar: false, submenu: [],
  },
  {
    id: "template-edit",
    featureName: BillTemplateEditor,
    route: "/templates/edit/:template_id",
    allowedRoles: STAFF,
    showInSidebar: false, submenu: [],
  },

  // ── Tenant / Subscriptions ────────────────────────────────────────────────
  {
    id: "tenant",
    featureName: TenantsByRole,
    displayName: "Tenant",
    logoUsed: IconBuilding,
    route: "/tenant",
    allowedRoles: ALL,
    hasSubmenu: false, submenu: [],
  },
  {
    id: "subscriptions",
    featureName: SuperAdminSubscriptions,
    displayName: "Subscriptions",
    logoUsed: IconBuildingBank,
    route: "/subscriptions",
    allowedRoles: [ROLE_CODES.SUPER_ADMIN],
    hasSubmenu: false, submenu: [],
  },
  {
    id: "my-subscription",
    featureName: TenantSubscription,
    displayName: "My Subscription",
    logoUsed: IconBuildingBank,
    route: "/my-subscription",
    allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.ACCOUNTANT],
    hasSubmenu: false, submenu: [],
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  {
    id: "settings",
    featureName: null,
    displayName: "Settings",
    logoUsed: IconSettings,
    route: null,
    allowedRoles: ALL,
    hasSubmenu: true,
    submenu: [
      { label: "Account",         route: "/super-admin/profile",  featureName: SuperAdminProfile,  allowedRoles: [ROLE_CODES.SUPER_ADMIN] },
      { label: "Account",         route: "/admin/profile",        featureName: AdminProfile,        allowedRoles: [ROLE_CODES.ADMIN]       },
      { label: "Account",         route: "/accountant/profile",   featureName: AccountantProfile,   allowedRoles: [ROLE_CODES.ACCOUNTANT]  },
      { label: "Account",         route: "/viewer/profile",       featureName: ViewerProfile,       allowedRoles: [ROLE_CODES.VIEWER]      },
      { label: "User Management", route: "/settings/users",       featureName: UserManagement,      allowedRoles: ADMIN                    },
    ],
  },
  {
    id: "developer-settings",
    featureName: Settings,
    displayName: "Developer",
    logoUsed: IconCode,
    route: "/settings/developer",
    allowedRoles: ADMIN,
    hasSubmenu: false, submenu: [],
  },

  // ── Docs ──────────────────────────────────────────────────────────────────
  {
    id: "docs",
    featureName: AppDocs,
    displayName: "Help & Docs",
    logoUsed: IconBook,
    route: "/help",
    allowedRoles: ALL,
    hasSubmenu: false, submenu: [],
  },

  // ── Hidden client routes ──────────────────────────────────────────────────
  {
    id: "client-detail-hidden",
    featureName: ClientDetail,
    route: "/clients/:client_id",
    allowedRoles: ALL,
    hasSubmenu: false, submenu: [], showInSidebar: false,
  },
  {
    id: "client-edit-hidden",
    featureName: ClientForm,
    route: "/clients/:client_id/edit",
    allowedRoles: STAFF,
    hasSubmenu: false, submenu: [], showInSidebar: false,
  },

]

export { features }