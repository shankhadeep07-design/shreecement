import { Route, Routes } from 'react-router-dom'
import { Dashboard } from '../pages/dashboard/Dashboard'
import AdminLayouts from '../pages/layouts/AdminLayouts'
import { Login } from '../pages/login/Login'
import { DistrictMaster } from '../pages/master/district/DistrictMaster'
import ChangePassword from '../pages/password/ChangePassword'
import ForgetPassword from '../pages/password/ForgetPassword'
import { Role } from '../pages/role/Role'
import { UsersList } from '../pages/users/UsersList'
import GuestRouteMiddleware from './GuestRouteMiddleware'
import PrivateRouteMiddleware from './PrivateRouteMiddleware'
// import Master_List from '../pages/master_date_management/ActivityMasterList'
// import Sub_Schedule_Master_List, { FocusAreaMasterList } from '../pages/priority_alignment_master_management/focus_area/FocusAreaMasterList'
// import Budget_Management from '../pages/budget/budget_master/BudgetManagement'
// import MasterList from '../pages/master_date_management/ActivityMasterList'

import SDGScheduleMappingMaster from '../pages/priority_alignment_master_management/sdgs/SDGMappingMaster'

import SubScheduleMasterList from '../pages/priority_alignment_master_management/focus_area/FocusAreaMasterList'

import ScheduleVIIMasterList from '../pages/priority_alignment_master_management/schedule_seven/ScheduleVIIMasterList'
// import BudgetManagement from '../pages/budget/budget_master/BudgetManagement'
import BudgetManagement from '../pages/budget/budget_master/BudgetManagement'
import BudgetTransferMaster from '../pages/budget/budget_master/BudgetTransferMaster'
import BudgetingManagement from '../pages/budget/budgeting/BudgetingManagement'
import NgoMasterList from '../pages/ngo/NgoMasterList'
import VendorMasterList from '../pages/vendor/VendorMasterList'
import ProjectList from '../pages/project/ProjectList'
import ProposalList from '../pages/proposal/ProposalList'
import Test from '../pages/project/Test'

import { BlockMaster } from '../pages/master/BlockMaster'
import { GramPanchayatMaster } from '../pages/master/GramPanchayatMaster'
import { StateMaster } from '../pages/master/state/StateMaster'
import FactoryMasterList from '../pages/master_date_management/FactoryMasterList'
import ReportList from '../pages/report/ReportList'

import AddApprovalPage from '../pages/approval_path/AddApprovalPage'
import AddApprovalPageView from '../pages/approval_path/AddApprovalPageView'
import { ApprovalPath } from '../pages/approval_path/ApprovalPath'
import ApprovalPathView from '../pages/approval_path/ApprovalPathView'
import { BestPracticeMasterList } from '../pages/best_practice/BestPracticeMasterList'
import BudgetShuffling from '../pages/budget/budget_master/BudgetShuffling'
import BudgetingDetails from '../pages/budget/budgeting/BudgetingDetails'
import { MapComponent } from '../pages/map/MapComponent'
import MasterList from '../pages/master_date_management/master_list/MasterList'
import ActivityMasterList from '../pages/priority_alignment_master_management/activity_master/ActivityMasterList'
import FocusAreaMasterList from '../pages/priority_alignment_master_management/focus_area/FocusAreaMasterList'
import { SubActivityMasterList } from '../pages/priority_alignment_master_management/sub_activity_master/SubActivityMasterList'
import { ProjectClosure } from '../pages/project/closure/ProjectClosure'
import { ProjectImpactAssessment } from '../pages/project/impact_assessment/ProjectImpactAssessment'
import { ProjectImplementation } from '../pages/project/implementation/ProjectImplementation'
import ProjectPayments from '../pages/project/payment/ProjectPayments'
import { ProjectMonitoring } from '../pages/project/ProjectMonitoring'
import ViewProjectList from '../pages/project/ViewProjectList'
import { SubMasterList } from '../pages/master_date_management/master_list/SubMasterList'
import AllNotifications from '../pages/notifications/AllNotifications'
import ProposalView from '../pages/proposal/ProposalView'
import BudgetingKanban from '../pages/budget/budgeting/BudgetingKanban'
import NgoDetails from '../pages/ngo/NgoDetails'
import VendorDetails from '../pages/vendor/VendorDetails'

import { EventList } from '../pages/employee_volunteering/EventList'
import MyEvents from '../pages/employee_volunteering/MyEvents'
import EventDetails from '../pages/employee_volunteering/EventDetails'
import VolunteerRegister from '../pages/employee_volunteering/VolunteerRegister'
import EmployeeVolunteerList from '../pages/employee_volunteering/EmployeeVolunteerList'
import CommingSoonEvents from '../pages/employee_volunteering/CommingSoonEvents'
import NgoRegister from '../pages/ngo/NgoRegister'
import NgoProfileMasterList from '../pages/ngo_profile/NgoProfileMasterList'
import BudgetTransferKanban from '../pages/budget/budget_transfer/BudgetTransferKanban'
import ViewProjectClosure from '../pages/project/closure/ViewProjectClosure'
import ViewProjectImpactAssessment from '../pages/project/impact_assessment/ViewProjectImpactAssessment'
import ProjectPoUpload from '../pages/project/po_upload/ProjectPoUpload'
import ProjectMouUpload from '../pages/project/mou_upload/ProjectMouUpload'
import ViewProjectMonitoring from '../pages/project/ViewProjectMonitoring'
import TaskSubTaskDetails from '../pages/project/gantt/TaskSubTaskDetails'
import TaskSubTask from '../pages/project/gantt/TaskSubTask'
import { ProjectBeneficiary } from '../pages/project/beneficiary/ProjectBeneficiary'
import { EventNotCsrList } from '../pages/employee_volunteering/events_not_csr/EventNotCsrList'
import ProfitCenterMasterList from '../pages/master_date_management/profit_center/ProfitCenterMasterList'
import { ProjectTypeMaster } from '../pages/master/project_type/ProjectTypeMaster'
import { SubProjectTypeMaster } from '../pages/master/sub_project_type/SubProjectTypeMaster'
import NationalIndicatorMaster from '../pages/priority_alignment_master_management/national_indicator_framework/NationalIndicatorMaster'

import VendorRegister from '../pages/vendor/VendorRegister'
import EventSocialDevelopmentDetails from '../pages/employee_volunteering/EventSocialDevelopmentDetails'
import { ThemeMaster } from '../pages/master/theme/ThemeMaster'
import CaseStudyMasterList from '../pages/case_study/CaseStudyMasterList'
import Gallery from '../pages/gallery/Gallery'
import ProjectCreate from '../pages/project/ProjectCreate'
import { RevenueVillageMaster } from '../pages/master/revenue_village/RevenueVillageMaster'
import { VillageHamletMaster } from '../pages/master/village_hamlet/VillageHamletMaster'
import { DistanceMaster } from '../pages/master/distance/DistanceMaster'


import { UnitMaster } from '../pages/master/unit/UnitMaster'
import { KpiMaster } from '../pages/master/kpi/KpiMaster'

import { SubThemeMaster } from '../pages/master/sub-theme/SubThemeMaster'
import { TypeOfBeneficiary } from '../pages/master/type-of-beneficiary/TypeOfBeneficiary'
import { KpiOutcomeMaster } from '../pages/master/kpi-outcome-indicators/KpiOutcomeMaster'

import { KpiVariableMaster } from '../pages/master/kpi-variable/KpiVariableMaster'
import { CategoryMaster } from '../pages/master/category/CategoryMaster'


import LoginLogoutReport from '../pages/audit_report/LoginLogoutReport'
import MasterReport from '../pages/audit_report/MasterReport'
import ProposalAuditReport from '../pages/audit_report/ProposalAuditReport'
import ProjectAuditReport from '../pages/audit_report/ProjectAuditReport'
import BudgetAuditReport from '../pages/audit_report/BudgetAuditReport'
import DocumentAuditReport from '../pages/audit_report/DocumentAuditReport'
import EventAuditReport from '../pages/audit_report/EventAuditReport'
export default function AppRoutes() {
  return (
    <Routes>
      {/* Guest routes */}
      <Route element={<GuestRouteMiddleware />}>
        <Route path="/" element={<Login />} />

        <Route
          path="/volunteer-registration"
          element={<VolunteerRegister />}
        />
        <Route
          path="/ngo-registration"
          element={<NgoRegister />}
        />
        <Route
          path="forget-password"
          element={<ForgetPassword />}
        />
        {/* <Route
          path="/change-password"
          element={<ChangePassword />}
        /> */}

        {/* <Route path="/auth/callback" element={<AuthCallback />} /> */}

        <Route
          path="/vendor-registration"
          element={<VendorRegister />}
        />

      </Route>



      {/* Protected routes */}
      <Route element={<PrivateRouteMiddleware />}>
        <Route path="/admin" element={<AdminLayouts />}>
          <Route path="dashboard" element={<Dashboard />} />
          {/* <Route index element={<Navigate to="dashboard" replace />} /> Redirects /admin to /admin/dashboard */}
          <Route path="change-password" element={<ChangePassword />} />
          {/* <Route path="approval" element={<ApprovalPath />} /> */}
          <Route path="approval_path" element={<ApprovalPath />} />


          <Route path="approval/add_approval" element={<AddApprovalPage />} />
          <Route path="approval/add_approval/:id" element={<AddApprovalPage />} />
          <Route path="approval/add_approval_view/:id" element={<AddApprovalPageView />} />
          <Route path="admin/approval/approval-view" element={<ApprovalPathView />} />


          <Route path="map" element={<MapComponent />} />
          <Route path="users" element={<UsersList />} />
          <Route path="role" element={<Role />} />

          {/* ---------------------------------Route Start Master Date Management ---------------------------------- */}
          <Route path="factory-master-list" element={<FactoryMasterList />} />
          <Route path="profit-center-master-list" element={<ProfitCenterMasterList />} />
          <Route path="master-list" element={<MasterList />} />
          <Route path="sub_master_list/:id" element={<SubMasterList />} />


          <Route path="project-type-master-list" element={<ProjectTypeMaster />} />
          <Route path="sub-project-type" element={<SubProjectTypeMaster />} />


          <Route path="theme" element={<ThemeMaster />} />

          <Route path="sub-theme" element={<SubThemeMaster />} />
          <Route path="type-of-beneficiary" element={<TypeOfBeneficiary />} />

          <Route path="category" element={<CategoryMaster />} />







          {/* ---------------------------------Route End Master Date Management ---------------------------------- */}


          {/* ---------------------------------Route Priority Alignment Master Management ---------------------------------- */}

          <Route path="schedule-seven-master-list" element={<ScheduleVIIMasterList />} />
          <Route path="sub-schedule" element={<SubScheduleMasterList />} />
          <Route path="focus-area-master-list" element={<FocusAreaMasterList />} />
          <Route path="activity-master-list" element={<ActivityMasterList />} />
          <Route path="sub-activity-master-list" element={<SubActivityMasterList />} />

          <Route path="sdg-master-list" element={<SDGScheduleMappingMaster />} />
          <Route path="national-indicator-framework" element={<NationalIndicatorMaster />} />



          {/* ---------------------------------Route End Priority Alignment Master Management ---------------------------------- */}


          {/* ---------------------------------Route Budget Master Management ---------------------------------- */}
          <Route path="budget/budget-management" element={<BudgetManagement />} />
          <Route path="budgeting/budget-transfer-master" element={<BudgetTransferKanban />} />
          {/* <Route path="budgeting/budgeting-management" element={<BudgetingManagement />} /> */}
          <Route path="budgeting/budgeting-management" element={<BudgetingKanban />} />
          <Route path="budgeting/budgeting_details/:budgeting_id" element={<BudgetingDetails />} />


          <Route path="budget/budget-transfer-add" element={<BudgetShuffling />} />
          {/* ---------------------------------Route End Budget Master Management ---------------------------------- */}


          {/* ---------------------------------Route Proposal ---------------------------------- */}
          <Route path="proposal/proposal-list" element={<ProposalList />} />
          <Route path="proposal/proposal_details/:proposal_id" element={<ProposalView />} />
          {/* ---------------------------------Route End Proposal ---------------------------------- */}

          {/* ---------------------------------Route Project ---------------------------------- */}
          <Route path="project/create/:budget_id" element={<ProjectCreate />} />
          {/* <Route path="project/update/:project_id" element={<ProjectUpdate />} /> */}
          <Route path="project/project-list" element={<ProjectList />} />
                    <Route path="project/project-list2" element={<Test />} />

          <Route path="project/monitoring/:tproj_id" element={<ProjectMonitoring />} />
          <Route path="project/monitoring/view-list/:tpmon_id" element={<ViewProjectMonitoring />} />
          <Route path="project/implementation/:tproj_id" element={<ProjectImplementation />} />
          <Route path="project/closure/:tproj_id" element={<ProjectClosure />} />
          <Route path="project/closure/view-list/:tpclsr_id" element={<ViewProjectClosure />} />
          <Route path="project/impact_assessment/:tproj_id" element={<ProjectImpactAssessment />} />
          <Route path="project/impact_assessment/view-list/:tpia_id" element={<ViewProjectImpactAssessment />} />
          <Route path="project/view-list/:tproj_id" element={<ViewProjectList />} />
          <Route path="project/payment/:tproj_id" element={<ProjectPayments />} />
          <Route path="project/po-upload/:tproj_id" element={<ProjectPoUpload />} />
          <Route path="project/mou-upload/:tproj_id" element={<ProjectMouUpload />} />
          <Route path="project/gantt_task/:tproj_id" element={<TaskSubTask />} />
          <Route path="project/gantt_details/:tproj_id" element={<TaskSubTaskDetails />} />

          <Route path="project/beneficiary/:tproj_id" element={<ProjectBeneficiary />} />
          {/* ---------------------------------Route End Project ---------------------------------- */}

          {/* ---------------------------------Route Ngo Master ---------------------------------- */}
          <Route path="ngo/ngo-master-list" element={<NgoMasterList />} />
          <Route path="ngo/view/:ngo_id" element={<NgoDetails />} />
          {/* ---------------------------------Route End Ngo Master ---------------------------------- */}

          {/* ---------------------------------Route Ngo Profile Master ---------------------------------- */}
          <Route path="ngo/ngo-profile-master-list" element={<NgoProfileMasterList />} />
          {/* <Route path="ngo-profile/view/:ngo_id" element={<NgoDetails />} /> */}
          {/* ---------------------------------Route End Ngo Profile Master ---------------------------------- */}

          {/* ---------------------------------Route Vendor Master ---------------------------------- */}
          <Route path="vendor/vendor-master-list" element={<VendorMasterList />} />
          <Route path="vendor/view/:tvendor_id" element={<VendorDetails />} />

          {/* ---------------------------------Route End Ngo Master ---------------------------------- */}

          {/* ---------------------------------Route Best Practice ---------------------------------- */}
          <Route path="best-practice/best-practice-master-list" element={<BestPracticeMasterList />} />
          {/* ---------------------------------Route End Best Practice ---------------------------------- */}

          {/* ---------------------------------Route Case Study ---------------------------------- */}
          <Route path="case-study/case-study-master-list" element={<CaseStudyMasterList />} />
          {/* ---------------------------------Route End Case Study ---------------------------------- */}

          {/* ---------------------------------Route Report ---------------------------------- */}
          <Route path="report/report-list" element={<ReportList />} />
          {/* ---------------------------------Route End Report ---------------------------------- */}






            {/* ---------------------------------Route Audit Report ---------------------------------- */}
           <Route path="audit-report/login-logout" element={<LoginLogoutReport />} />
          <Route path="audit-report/master" element={<MasterReport />} />

           {/* <Route path="audit-report/proposal" element={<ProposalAuditReport />} /> */}
          <Route path="audit-report/project" element={<ProjectAuditReport />} />
          <Route path="audit-report/budget" element={<BudgetAuditReport />} />
          <Route path="audit-report/document" element={<DocumentAuditReport />} />
          <Route path="audit-report/event" element={<EventAuditReport />} />


          {/* ---------------------------------Route End Audit Report ---------------------------------- */}

          {/* <Route path="budget" element={<BudgetMaster />} />
              <Route path="budget/amendment" element={<BudgetAmendmentMaster />} />
              <Route path="report" element={<ProjectStageReport />} />
              <Route path="baseline_survey" element={<BaseLineSurveyMaster />} />


              <Route path="map" element={<MapComponent />} />

              <Route path="state" element={<StateMaster />} /> */}
          <Route path="state" element={<StateMaster />} />
          <Route path="district" element={<DistrictMaster />} />
          <Route path="block" element={<BlockMaster />} />


          <Route path="revenue-village" element={<RevenueVillageMaster />} />

          <Route path="village" element={<VillageHamletMaster />} />

          <Route path="unit-master" element={<UnitMaster />} />
          <Route path="kpi-master" element={<KpiMaster />} />
          <Route path="kpi-outcome-indicators" element={<KpiOutcomeMaster />} />

          <Route path="kpi-variable" element={<KpiVariableMaster />} />


          <Route path="gram-panchayat" element={<GramPanchayatMaster />} />
          <Route path="distance-from-plant" element={<DistanceMaster />} />


          <Route
            path="all-notifications"
            element={<AllNotifications />}
          />

          {/* ---------------------------------Route EmployeeVolunteering ---------------------------------- */}
          {/* <Route path="employee_volunteering" element={<EmployeeVolunteeringList />} /> */}
          <Route path="employee_volunteer_list" element={<EmployeeVolunteerList />} />
          <Route path="my_events" element={<MyEvents />} />
          <Route path="comming_soon_events" element={<CommingSoonEvents />} />
          <Route path="event" element={<EventList />} />
          <Route path="event-cil/:event_id" element={<EventDetails />} />
          <Route path="event-social-development/:event_id" element={<EventSocialDevelopmentDetails />} />

          <Route path="event_not_csr" element={<EventNotCsrList />} />
          {/* ---------------------------------Route End EmployeeVolunteering ---------------------------------- */}



          <Route path="gallery/gallery-list" element={<Gallery />} />

        </Route>
      </Route>

    </Routes>

  )
}
