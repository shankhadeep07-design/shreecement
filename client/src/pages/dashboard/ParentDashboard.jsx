import { Row, Col, Card, Select, DatePicker, Table, Tag, Space, Spin, Popover, Button, List, Typography, Divider, Breadcrumb } from "antd";
import { 
  ProjectOutlined, 
  FileTextOutlined, 
  BankOutlined, 
  UsergroupAddOutlined, 
  AuditOutlined,
  CalendarOutlined,
  DollarOutlined,
  SolutionOutlined,
  ArrowRightOutlined,
  FilterOutlined,
  TeamOutlined,
  ShopOutlined,
  InfoCircleOutlined,
  HomeOutlined,
  LayoutOutlined,
  PictureOutlined,
  ReadOutlined,
  SolutionOutlined as CaseStudyIcon
} from "@ant-design/icons";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { 
  dashBoardHistoricalData,
  dashBoardEventCategoryData,
  dashBoardGalleryChartData,
  dashBoardCaseStudyChartData
} from "../../services/Dashboard-service";
import { currentFinancialYear } from "../../services/Master-service";

const { Title, Text } = Typography;
const { Option } = Select;

const BRAND = "#074a33";
const GOLD = "#F8AC1A";

const DashboardCard = ({ title, value, icon, color, bg, breakdown = [], path }) => {
  const navigate = useNavigate();

  const content = (
    <div style={{ minWidth: 220 }}>
      {breakdown && breakdown.length > 0 ? (
        <List
          size="small"
          dataSource={
            // Check if items have a category field (like events)
            breakdown[0]?.category 
              ? [...new Set(breakdown.map(item => item.category))].map(cat => ({
                  isHeader: true,
                  label: cat
                })).reduce((acc, current) => {
                  const items = breakdown.filter(i => i.category === current.label);
                  return [...acc, current, ...items];
                }, [])
              : breakdown
          }
          renderItem={(item) => (
            item.isHeader ? (
              <Divider orientation="left" style={{ margin: "12px 0 8px", fontSize: 12, color: "#8c8c8c" }}>
                {item.label}
              </Divider>
            ) : (
              <List.Item style={{ padding: "8px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <Text style={{ fontSize: 13 }}>
                    {item.label}
                  </Text>
                  <Text strong style={{ fontSize: 13 }}>
                    {(title === "Total Budget" || title === "Amendments") && typeof item.value === 'string' ? item.value : 
                     (title === "Total Budget" || title === "Amendments") ? `₹${(item.value / 100000).toFixed(2)}L` : item.value}
                  </Text>
                </div>
              </List.Item>
            )
          )}
        />
      ) : (
        <div style={{ padding: "12px 0", textAlign: "center", color: "#8c8c8c" }}>No breakdown available</div>
      )}
      <Button 
        type="primary" 
        block 
        size="small" 
        icon={<ArrowRightOutlined />}
        style={{ marginTop: 12, backgroundColor: BRAND, borderRadius: "6px", height: "32px" }}
        onClick={() => navigate(path)}
      >
        View List
      </Button>
    </div>
  );

  return (
    <Card
      style={{ 
        borderRadius: 16, 
        border: "none", 
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        height: "100%",
        position: "relative"
      }}
      bodyStyle={{ padding: "20px 16px" }}
    >
      <div style={{ position: "absolute", top: 12, right: 12 }}>
        <Popover 
          content={content} 
          title={<Text strong style={{ fontSize: 14 }}>{title} Breakdown</Text>} 
          trigger="click" 
          placement="bottomRight"
          overlayStyle={{ paddingTop: 8 }}
        >
          <InfoCircleOutlined style={{ color: "#8c8c8c", cursor: "pointer", fontSize: 16 }} />
        </Popover>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            color: color,
          }}
        >
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#222", lineHeight: 1.2 }}>{value}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{title}</Text>
        </div>
      </div>
    </Card>
  );
};

export default function ParentDashboard() {
  const [filters, setFilters] = useState({
    financialYear: null,
    dateRange: null,
  });
  const [fyList, setFyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    budget: { total: 0, breakdown: [] },
    proposals: { total: 0, breakdown: [] },
    projects: { total: 0, breakdown: [] },
    ngos: { total: 0, breakdown: [] },
    volunteers: { total: 0, breakdown: [] },
    vendors: { total: 0, breakdown: [] },
    events: { total: 0, breakdown: [] },
    budget_amendments: { total: 0, breakdown: [] }
  });

  const [budgetData, setBudgetData] = useState([]);
  const [proposalData, setProposalData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [monthWiseData, setMonthWiseData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [eventCategoryData, setEventCategoryData] = useState([]);
  const [galleryChartData, setGalleryChartData] = useState([]);
  const [caseStudyChartData, setCaseStudyChartData] = useState([]);

  React.useEffect(() => {
    fetchInitialData();
  }, []);

  React.useEffect(() => {
    if (filters.financialYear) {
      fetchAllDashboardData(filters.financialYear);
    }
  }, [filters.financialYear]);

  const fetchInitialData = async () => {
    try {
      const fyRes = await currentFinancialYear();

      console.log("FY List Response:", fyRes);

      if (fyRes && fyRes.data && fyRes.data.length > 0) {
        setFyList(fyRes.data);
        // Set current or latest FY as default
        const currentFy = fyRes.data.find(fy => fy.tfy_current_year === 'Y') || fyRes.data[0];
        setFilters(prev => ({ ...prev, financialYear: currentFy.value }));
      }
    } catch (error) {
      console.error("Error fetching FY list", error);
    }
  };

  const fetchAllDashboardData = async (fy_id) => {
    setLoading(true);
    try {
      const [countsRes, budgetRes, proposalRes, recentRes, monthRes, historicalRes, eventRes, galleryRes, caseRes] = await Promise.all([
        dashBoardTotalCountPillar({ fy_id }),
        dashBoardBudgetChartData({ fy_id }),
        dashBoardProposalChartData({ fy_id }),
        dashBoardRecentProjects({ fy_id }),
        dashBoardMonthWiseData({ fy_id }),
        dashBoardHistoricalData(),
        dashBoardEventCategoryData({ fy_id }),
        dashBoardGalleryChartData(),
        dashBoardCaseStudyChartData()
      ]);

      if (countsRes.status) {
        // Map totals for the cards
        const formattedStats = {};
        Object.keys(countsRes.data).forEach(key => {
          const isFinancial = key === 'budget' || key === 'budget_amendments';
          formattedStats[key] = {
            total: isFinancial 
              ? `₹${(countsRes.data[key].total / 100000).toFixed(2)}L` 
              : countsRes.data[key].total,
            breakdown: countsRes.data[key].breakdown
          };
        });
        setStats(formattedStats);
      }
      if (budgetRes.status) setBudgetData(budgetRes.data);
      if (proposalRes.status) setProposalData(proposalRes.data);
      if (recentRes.status) setTableData(recentRes.data);
      if (monthRes.status) setMonthWiseData(monthRes.data);
      if (historicalRes.status) setHistoricalData(historicalRes.data);
      if (eventRes.status) setEventCategoryData(eventRes.data);
      if (galleryRes.status) setGalleryChartData(galleryRes.data);
      if (caseRes.status) setCaseStudyChartData(caseRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const monthChartOptions = {
    chart: { type: "column" },
    title: { text: "Month-wise Projects vs Proposals" },
    xAxis: { categories: monthWiseData.map(d => d.month_label) },
    yAxis: { title: { text: "Count" } },
    series: [
      { name: "Projects", data: monthWiseData.map(d => parseInt(d.project_count)), color: BRAND },
      { name: "Proposals", data: monthWiseData.map(d => parseInt(d.proposal_count)), color: GOLD },
    ],
    credits: { enabled: false },
    plotOptions: { column: { borderRadius: 4 } }
  };


  const historyChartOptions = {
    chart: { type: "areaspline" },
    title: { text: "Historical Project Growth" },
    xAxis: { categories: historicalData.map(d => d.year) },
    yAxis: { title: { text: "Count" } },
    series: [{ name: "Projects", data: historicalData.map(d => parseInt(d.project_count)), color: GOLD }],
    credits: { enabled: false },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.1,
        marker: { enabled: true, radius: 4 }
      }
    }
  };

  const historicalBudgetOptions = {
    chart: { type: "spline" },
    title: { text: "Historical Budget Alignment" },
    xAxis: { categories: historicalData.map(d => d.year) },
    yAxis: { title: { text: "Budget Amount" } },
    series: [{ name: "Total Budget", data: historicalData.map(d => parseFloat(d.total_budget)), color: BRAND }],
    credits: { enabled: false },
    plotOptions: {
      spline: {
        marker: { enabled: true, radius: 5 }
      }
    }
  };

  const eventAnalyticsOptions = {
    chart: { type: "column" },
    title: { text: "Events Analysis: CIL vs Social Development" },
    xAxis: { categories: eventCategoryData.map(d => d.month_label) },
    yAxis: { title: { text: "Event Count" } },
    series: [
      { name: "CIL Events", data: eventCategoryData.map(d => parseInt(d.cil_count)), color: BRAND },
      { name: "Social Development", data: eventCategoryData.map(d => parseInt(d.social_count)), color: "#6cc04a" },
    ],
    credits: { enabled: false },
    plotOptions: { column: { borderRadius: 4 } }
  };

  const budgetChartOptions = {
    chart: { type: "column" },
    title: { text: "Budget Allocation vs Expense" },
    xAxis: { categories: budgetData.map(d => d.category || "General") },
    yAxis: { title: { text: "Amount" } },
    series: [
      { name: "Budget", data: budgetData.map(d => parseFloat(d.budget)), color: BRAND },
      { name: "Expense", data: budgetData.map(d => parseFloat(d.expense)), color: GOLD },
    ],
    credits: { enabled: false },
    plotOptions: {
      column: {
        borderRadius: 4,
        borderWidth: 0,
      }
    }
  };

  const proposalChartOptions = {
    chart: { type: "pie" },
    title: { text: "Proposals Status Distribution" },
    series: [
      {
        name: "Proposals",
        colorByPoint: true,
        innerSize: '70%',
        data: proposalData.map(d => ({
          name: d.name,
          y: parseInt(d.y),
          color: d.name === 'approved' ? '#6cc04a' : d.name === 'pending' ? GOLD : '#f37021'
        })),
      },
    ],
    credits: { enabled: false },
    plotOptions: {
       pie: {
         allowPointSelect: true,
         cursor: 'pointer',
         dataLabels: {
           enabled: true,
           format: '<b>{point.name}</b>: {point.y}'
         }
       }
    }
  };

  const galleryChartOptions = {
    chart: { type: "column" },
    title: { text: "Gallery Status Overview" },
    xAxis: { categories: galleryChartData.map(d => d.name) },
    yAxis: { title: { text: "Items Count" } },
    series: [{
      name: "Gallery Items",
      data: galleryChartData.map(d => ({ y: parseInt(d.y), color: BRAND })),
      showInLegend: false
    }],
    credits: { enabled: false }
  };

  const caseStudyChartOptions = {
    chart: { type: "donut" },
    title: { text: "Case Studies Engagement" },
    series: [{
      type: 'pie',
      name: 'Studies',
      innerSize: '60%',
      data: caseStudyChartData.map(d => ({
        name: d.name,
        y: parseInt(d.y),
        color: d.name === 'Active' ? BRAND : GOLD
      }))
    }],
    credits: { enabled: false }
  };

  const tableColumns = [
    { 
      title: "Project Name", 
      dataIndex: "name", 
      key: "name", 
      render: (text) => {
        return <Text strong>{text}</Text>;
      } 
    },
    { title: "NGO Partner", dataIndex: "ngo", key: "ngo" },
    { 
      title: "Budget", 
      dataIndex: "budget", 
      key: "budget",
      render: (val) => `₹ ${val || 0} L`
    },
    { 
      title: "Status", 
      dataIndex: "status", 
      key: "status", 
      render: (status) => {
        const getStatusColor = (s) => (s === "Active" ? "#2E7D32" : s === "Completed" ? "#1976D2" : "#F57C00");
        const getStatusBg = (s) => (s === "Active" ? "#E8F5E9" : s === "Completed" ? "#E3F2FD" : "#FFF3E0");
        return (
          <span style={{ 
            padding: "4px 12px", 
            borderRadius: "20px",
            fontSize: 12,
            fontWeight: 600,
            background: getStatusBg(status),
            color: getStatusColor(status),
          }}>
            {status}
          </span>
        );
      } 
    },
  ];

  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh", padding: "0 24px 40px", fontFamily: "'Inter','Segoe UI',sans-serif", opacity: loading ? 0.7 : 1, transition: 'opacity 0.3s' }}>
      {/* Header & Filters - Sticky & Premium */}
      <div style={{ 
        position: "sticky", 
        top: 0, 
        zIndex: 100, 
        padding: "16px 0", 
        background: "rgba(247, 248, 250, 0.8)", 
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        marginBottom: 24,
        margin: "0 -24px 24px -24px",
        paddingLeft: 24,
        paddingRight: 24
      }}>
        <div style={{ marginBottom: 8 }}>
          <Breadcrumb items={[
            { title: <><HomeOutlined /> Home</> },
            { title: <><LayoutOutlined /> Management Dashboard</> }
          ]} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <Title level={3} style={{ margin: 0, color: BRAND, fontWeight: 700 }}>
              📈 Management Dashboard
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Overview of all CSR activities and financial metrics</Text>
          </div>
          <div style={{ 
            display: "flex", 
            gap: 12, 
            alignItems: "center", 
            background: "rgba(255, 255, 255, 0.7)", 
            padding: "8px 16px", 
            borderRadius: "12px", 
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid #fff"
          }}>
            <FilterOutlined style={{ color: BRAND }} />
            <Select
              value={filters.financialYear}
              onChange={(val) => setFilters({ ...filters, financialYear: val })}
              style={{ width: 150 }}
              bordered={false}
              placeholder="Select Year"
              dropdownStyle={{ borderRadius: 12 }}
            >
              {fyList.map(fy => (
                <Option key={fy.value} value={fy.value}>{fy.label}</Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: "Total Budget", value: stats.budget?.total || 0, icon: <DollarOutlined />, color: "#2E7D32", bg: "#E8F5E9", breakdown: stats.budget?.breakdown, path: "/admin/budget/budget-management" },
          { label: "Projects", value: stats.projects?.total || 0, icon: <ProjectOutlined />, color: "#F57C00", bg: "#FFF3E0", breakdown: stats.projects?.breakdown, path: "/admin/project/project-list" },
          { label: "NGO Partners", value: stats.ngos?.total || 0, icon: <BankOutlined />, color: "#8E24AA", bg: "#F3E5F5", breakdown: stats.ngos?.breakdown, path: "/admin/ngo/ngo-master-list" },
          { label: "Volunteers", value: stats.volunteers?.total || 0, icon: <TeamOutlined />, color: "#00838F", bg: "#E0F7FA", breakdown: stats.volunteers?.breakdown, path: "/admin/employee_volunteer_list" },
          { label: "Events", value: stats.events?.total || 0, icon: <CalendarOutlined />, color: "#D84315", bg: "#FBE9E7", breakdown: stats.events?.breakdown, path: "/admin/event" },
          { label: "Gallery", value: stats.gallery?.total || 0, icon: <PictureOutlined />, color: "#1976D2", bg: "#E3F2FD", breakdown: stats.gallery?.breakdown, path: "/admin/gallery/gallery-list" },
          { label: "Case Studies", value: stats.case_studies?.total || 0, icon: <ReadOutlined />, color: "#EF6C00", bg: "#FFF3E0", breakdown: stats.case_studies?.breakdown, path: "/admin/case-study/case-study-master-list" },
          { label: "Amendments", value: stats.budget_amendments?.total || 0, icon: <FileTextOutlined />, color: "#FB8C00", bg: "#FFF3E0", breakdown: stats.budget_amendments?.breakdown, path: "/admin/budget/amendment" },
        ].map((kpi, i) => (
          <Col key={i} xs={24} sm={12} md={8} lg={6} xl={3}>
            <DashboardCard 
              title={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              color={kpi.color}
              bg={kpi.bg}
              breakdown={kpi.breakdown}
              path={kpi.path}
            />
          </Col>
        ))}
      </Row>

      {/* Main Stats Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <HighchartsReact highcharts={Highcharts} options={monthChartOptions} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <HighchartsReact highcharts={Highcharts} options={budgetChartOptions} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", height: "100%" }}>
            <HighchartsReact highcharts={Highcharts} options={proposalChartOptions} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", height: "100%" }}>
            <HighchartsReact highcharts={Highcharts} options={galleryChartOptions} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", height: "100%" }}>
            <HighchartsReact highcharts={Highcharts} options={caseStudyChartOptions} />
          </Card>
        </Col>
        
      </Row>

      {/* Historical Stats & Event Analytics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <HighchartsReact highcharts={Highcharts} options={historyChartOptions} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <HighchartsReact highcharts={Highcharts} options={historicalBudgetOptions} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <HighchartsReact highcharts={Highcharts} options={eventAnalyticsOptions} />
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Table */}
      <Card
        style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        title={<span style={{ fontWeight: 700 }}><ProjectOutlined style={{ marginRight: 8, color: BRAND }} />Recent Projects</span>}
      >
        <Table
          dataSource={tableData}
          columns={tableColumns}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
