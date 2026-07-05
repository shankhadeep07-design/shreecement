import {
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  GlobalOutlined,
  PlusOutlined,
  RiseOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Progress,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { privateAxios } from "../../services/Helper";

const { Title, Text } = Typography;

const BRAND = "#074a33";
const GOLD  = "#F8AC1A";
const ORANGE= "#f37021";

const domainConfig = {
  healthcare: { color: "#20a5de", bg: "#e8f6fd", icon: "🏥", label: "Healthcare" },
  education:  { color: "#F8AC1A", bg: "#fef9ec", icon: "📚", label: "Education" },
  livelihood: { color: "#f37021", bg: "#fef3ec", icon: "🌱", label: "Livelihood" },
  environment:{ color: "#6cc04a", bg: "#f0fbea", icon: "🌍", label: "Environment" },
  others:     { color: "#8c7ae6", bg: "#f3f0fd", icon: "⭐", label: "Others" },
};

function getDomainCfg(domain = "") {
  const key = domain.toLowerCase();
  return Object.entries(domainConfig).find(([k]) => key.includes(k))?.[1] || domainConfig.others;
}

export default function AdminEventDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [events, setEvents]     = useState([]);
  const [stats, setStats]       = useState({ total: 0, published: 0, upcoming: 0, volunteers: 0, domainCounts: {} });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const payload = {
          draw: 1, start: 0, length: 200,
          order: [{ column: 1, dir: "desc", name: "tevent_id" }],
          search: { value: "", regex: false },
          columns: [
            { data: "id", name: "", searchable: "false", orderable: "false", search: { value: "", regex: false } },
            { data: "tevent_id", name: "tevent_id", searchable: "true", orderable: "true", search: { value: "", regex: false } },
          ],
          filterParams: {},
        };
        const res = await privateAxios
          .post("admin/events/event-list/datatable", payload)
          .then((r) => r.data);

        const all = res?.data || [];
        const now = new Date();

        const domainCounts = all.reduce((acc, e) => {
          const key = (e.tevent_domain || "others").toLowerCase();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        setEvents(all.slice(0, 10));
        setStats({
          total:       res?.recordsTotal || all.length,
          published:   all.filter((e) => e.tevent_status === "published").length,
          upcoming:    all.filter((e) => new Date(e.tevent_start_date) > now).length,
          volunteers:  all.reduce((s, e) => s + (parseInt(e.tevent_volunteers_needed) || 0), 0),
          domainCounts,
        });
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── table columns ────────────────────────────────────────────────────────────
  const columns = [
    { title: "Title", dataIndex: "tevent_activity_title", ellipsis: true,
      render: (v) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: "Domain", dataIndex: "tevent_domain", width: 130,
      render: (v) => {
        const cfg = getDomainCfg(v);
        return <Tag style={{ background: cfg.bg, color: cfg.color, border: "none", borderRadius: 20, fontWeight: 600 }}>{cfg.icon} {cfg.label}</Tag>;
      }},
    { title: "Mode", dataIndex: "tevent_mode", width: 100,
      render: (v) => <Tag color={v === "virtual" ? "blue" : v === "hybrid" ? "purple" : "green"} style={{ borderRadius: 20 }}>{v}</Tag> },
    { title: "Start Date", dataIndex: "tevent_start_date", width: 110,
      render: (v) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
    { title: "Status", dataIndex: "tevent_status", width: 110,
      render: (v) => {
        const map = { published: "success", draft: "default", send_for_approval: "processing", approved: "success", rejected: "error" };
        return <Tag color={map[v] || "default"} style={{ borderRadius: 20 }}>{v?.replace(/_/g, " ")}</Tag>;
      }},
    { title: "Action", width: 80,
      render: (_, r) => (
        <Button size="small" type="link" style={{ color: BRAND }}
          onClick={() => navigate(`/admin/event-cil/${r.tevent_id}`)}>
          View
        </Button>
      )},
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Spin size="large" tip="Loading admin dashboard…" />
      </div>
    );
  }

  // ── domain distribution data ─────────────────────────────────────────────────
  const domainList = Object.entries(domainConfig).map(([key, cfg]) => ({
    ...cfg, key, count: stats.domainCounts[key] || 0,
  })).filter((d) => d.count > 0);
  const totalDomain = domainList.reduce((s, d) => s + d.count, 0) || 1;

  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif", padding: "0 0 40px" }}>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div style={{ padding: "28px 0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={3} style={{ margin: 0, color: BRAND }}>📊 Event Operations Dashboard</Title>
          <Text type="secondary">Manage and track all volunteering events across India</Text>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button icon={<PlusOutlined />} type="primary" style={{ background: BRAND, border: "none", borderRadius: 10, fontWeight: 600 }}
            onClick={() => navigate("/admin/event")}>
            New CSR Event
          </Button>
          <Button icon={<UnorderedListOutlined />} style={{ borderRadius: 10, borderColor: BRAND, color: BRAND }}
            onClick={() => navigate("/admin/event_not_csr")}>
            Social Dev Event
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: "Total Events",     value: stats.total,     icon: <CalendarOutlined />, color: BRAND,   suffix: "events" },
          { label: "Published",        value: stats.published, icon: <CheckCircleOutlined />, color: "#6cc04a", suffix: "live" },
          { label: "Upcoming",         value: stats.upcoming,  icon: <ClockCircleOutlined />, color: GOLD, suffix: "events" },
          { label: "Volunteers Needed",value: stats.volunteers,icon: <TeamOutlined />,      color: ORANGE,  suffix: "slots" },
        ].map((k, i) => (
          <Col key={i} xs={12} md={6}>
            <Card
              style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: `${k.color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, color: k.color,
                }}>
                  {k.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{k.label}</Text>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#222", lineHeight: 1.2 }}>{k.value}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{k.suffix}</Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Domain Distribution + Quick Links ────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Domain breakdown */}
        <Col xs={24} md={16}>
          <Card
            style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", height: "100%" }}
            bodyStyle={{ padding: 24 }}
            title={<span style={{ fontWeight: 700 }}><BarChartOutlined style={{ marginRight: 6, color: BRAND }} />Events by Domain</span>}
          >
            {domainList.length === 0 ? (
              <Text type="secondary">No events found</Text>
            ) : domainList.map((d) => (
              <div key={d.key} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ fontWeight: 600, fontSize: 13 }}>{d.icon} {d.label}</Text>
                  <Text style={{ color: d.color, fontWeight: 700 }}>{d.count} events</Text>
                </div>
                <Progress
                  percent={Math.round((d.count / totalDomain) * 100)}
                  strokeColor={d.color}
                  trailColor="#f0f0f0"
                  showInfo={false}
                  strokeWidth={10}
                  strokeLinecap="round"
                />
              </div>
            ))}
          </Card>
        </Col>

        {/* Quick links panel */}
        <Col xs={24} md={8}>
          <Card
            style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", height: "100%" }}
            bodyStyle={{ padding: 24 }}
            title={<span style={{ fontWeight: 700 }}><ThunderboltOutlined style={{ marginRight: 6, color: GOLD }} />Quick Navigation</span>}
          >
            {[
              { label: "CIL CSR Events",           icon: "🎯", path: "/admin/event",            color: BRAND },
              { label: "Social Dev Events",         icon: "🌱", path: "/admin/event_not_csr",    color: "#6cc04a" },
              { label: "Coming Soon Events",        icon: "⏳", path: "/admin/comming_soon_events", color: GOLD },
              { label: "My Events",                 icon: "📋", path: "/admin/my_events",         color: ORANGE },
              { label: "Employee Volunteer List",   icon: "👥", path: "/admin/employee_volunteer_list", color: "#8c7ae6" },
            ].map((item) => (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                  marginBottom: 8, background: "#f8f9fa", transition: "background 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f0f7f4"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#f8f9fa"}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <Text style={{ fontWeight: 600, fontSize: 13, flex: 1, color: "#333" }}>{item.label}</Text>
                <span style={{ color: item.color, fontWeight: 700 }}>›</span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* ── Recent Events Table ───────────────────────────────────────────── */}
      <Card
        style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
        bodyStyle={{ padding: 0 }}
        title={
          <span style={{ fontWeight: 700, fontSize: 15 }}>
            <UnorderedListOutlined style={{ marginRight: 6, color: BRAND }} />Recent Events
          </span>
        }
        extra={
          <Button type="link" style={{ color: BRAND, fontWeight: 600 }} onClick={() => navigate("/admin/event")}>
            View All Events →
          </Button>
        }
      >
        <Table
          dataSource={events}
          columns={columns}
          rowKey="tevent_id"
          pagination={false}
          size="small"
          scroll={{ x: 700 }}
          style={{ borderTop: "1px solid #f0f0f0" }}
          locale={{ emptyText: "No events found" }}
        />
      </Card>

    </div>
  );
}
