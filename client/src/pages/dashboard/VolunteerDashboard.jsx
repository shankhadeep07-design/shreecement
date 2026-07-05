import {
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DoubleRightOutlined,
  EnvironmentOutlined,
  FormOutlined,
  HistoryOutlined,
  HomeFilled,
  MenuOutlined,
  PlusOutlined,
  CarryOutOutlined,
  SearchOutlined,
  StarFilled,
  TeamOutlined,
  ThunderboltFilled,
} from "@ant-design/icons";
import { Avatar, Badge, Spin, Carousel, Row, Col } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userDetails, getCurrentUserDetails } from "../../auth/auth";
import { privateAxios } from "../../services/Helper";
import dayjs from "dayjs";
import "./VolunteerDashboard.css";
import volunteerHeroImg from "../../assets/images/volunteer_hero.png";
// import healthImg from "../../assets/images/default_events/healthcare.jpg";
// import educationImg from "../../assets/images/default_events/education.jpg";
// import environmentImg from "../../assets/images/default_events/environment.jpg";
// import communityDevImg from "../../assets/images/default_events/livelihood.jpg";

const domainCfg = {
  healthcare: { icon: "🏥", bg: "rgba(228, 244, 252, 0.8)", color: "#20a5de" },
  education: { icon: "📚", bg: "rgba(254, 249, 236, 0.8)", color: "#F8AC1A" },
  livelihood: { icon: "🌱", bg: "rgba(254, 243, 236, 0.8)", color: "#f37021" },
  environment: { icon: "🌍", bg: "rgba(240, 251, 234, 0.8)", color: "#6cc04a" },
  others: { icon: "⭐", bg: "rgba(243, 240, 253, 0.8)", color: "#8c7ae6" },
};

// const AREAS = [
//   { id: "education", title: "Education", desc: "Empowering minds. Building brighter futures.", img: educationImg },
//   { id: "environment", title: "Environment", desc: "Protecting today. Guaranteeing tomorrows.", img: environmentImg },
//   { id: "healthcare", title: "Health", desc: "Supporting well-being. Strengthening communities.", img: healthImg },
//   { id: "livelihood", title: "Community Development", desc: "Enabling growth. Creating lasting change.", img: communityDevImg },
// ];

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const user = userDetails();
  const [stats, setStats] = useState({ hours: 48, activities: 7, lives: 150 });
  const [upcoming, setUpcoming] = useState([]);
  const [present, setPresent] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const payload = {
          draw: 1, start: 0, length: 100,
          order: [{ column: 1, dir: "desc", name: "tevent_start_date" }],
          search: { value: "", regex: false },
          columns: [{ data: "id", name: "", searchable: "false", orderable: "false" }, { data: "tevent_start_date", name: "tevent_start_date", searchable: "true", orderable: "true" }],
          filterParams: {},
        };

        const comingRes = await privateAxios.post("admin/events/comming_soon_events/datatable", payload).then(r => r.data);
        const comingData = comingRes?.data || [];

        const myRes = await privateAxios.post("admin/events/my-event/datatable", payload).then(r => r.data);
        const myEvents = myRes?.data || [];

        // Deduplicate and combine
        const allEventsMap = new Map();
        [...comingData, ...myEvents].forEach(e => {
          if (!allEventsMap.has(e.tevent_id)) {
            allEventsMap.set(e.tevent_id, e);
          }
        });
        const uniqueEvents = Array.from(allEventsMap.values());

        const today = dayjs().startOf('day');
        const up = [];
        const pres = [];
        const pst = [];

        uniqueEvents.forEach(e => {
          const startDate = dayjs(e.tevent_start_date).startOf('day');
          const endDate = e.tevent_end_date ? dayjs(e.tevent_end_date).endOf('day') : startDate.endOf('day');

          if (today.isBefore(startDate)) {
            up.push(e);
          } else if (today.isAfter(endDate)) {
            pst.push(e);
          } else {
            pres.push(e);
          }
        });

        // Dynamic hours calculation
        let totalHours = 0;
        const userId = getCurrentUserDetails();
        
        if (myEvents.length > 0) {
          try {
            const formPromises = myEvents.map(e => 
              privateAxios.post("admin/events/event_review_form_list", { event_id: e.tevent_id })
                .then(r => r.data)
            );
            
            const allFormsResults = await Promise.all(formPromises);
            
            allFormsResults.forEach(res => {
              const forms = res?.data || [];
              const userForm = forms.find(f => f.terf_created_by == userId);
              if (userForm) {
                const start = dayjs(`${userForm.terf_event_join_date} ${userForm.terf_event_join_time}`);
                const end = dayjs(`${userForm.terf_event_end_date} ${userForm.terf_event_end_time}`);
                if (start.isValid() && end.isValid()) {
                  const duration = end.diff(start, 'hour', true);
                  if (duration > 0) totalHours += duration;
                }
              }
            });
          } catch (err) {
            console.error("Error calculating actual hours:", err);
            totalHours = myEvents.length * 4; // Fallback
          }
        }

        // Fallback for demo if empty
        if (uniqueEvents.length === 0) {
          setUpcoming([{
            tevent_id: "default-1",
            tevent_activity_title: "CSR Excellence Program",
            tevent_start_date: dayjs().add(2, 'day').format("YYYY-MM-DD"),
            tevent_start_time: "09:00 AM",
            isDefault: true
          }]);
          setPast([{
            tevent_id: "past-default",
            tevent_activity_title: "Sustainability Workshop",
            tevent_start_date: dayjs().subtract(10, 'day').format("YYYY-MM-DD"),
            tevent_start_time: "10:00 AM",
            isDefault: true
          }]);
        } else {
          setUpcoming(up);
          setPresent(pres);
          setPast(pst);
        }

        if (myEvents.length > 0) {
          setStats({
            hours: Math.round(totalHours * 10) / 10,
            activities: myRes?.recordsTotal || myEvents.length,
            lives: (myRes?.recordsTotal || myEvents.length) * 10
          });
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const eventRoute = (e) => e.tevent_type === "social_development" ? `/admin/event-social-development/${e.tevent_id}` : `/admin/event-cil/${e.tevent_id}`;
  const thumb = (e) => e.documents?.find(d => d.doc_purpose === "tevent_thumbnail" && d.full_url);

  if (loading) return <div className="shimmer-loading"><Spin size="large" /></div>;

  return (
    <div className="volunteer-dashboard-container">
      <main className="main-content">
        {/* 1. HERO BANNER */}
        <div className="hero-section">
          <img src={volunteerHeroImg} alt="Hero" className="hero-image" />
          <div className="hero-content">
            <h1 className="hero-title">Driven by Purpose.<br/>Powered by People.</h1>
            <p className="hero-subtitle">Every Action Counts. Every Effort Matters.</p>
          </div>
        </div>

        {/* 2. STATS: Your contribution in action */}
        <div className="section-label">Your contribution in action</div>
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          {[
            { label: "Hours Contributed", value: stats.hours, icon: <ClockCircleOutlined />, color: "#e48b25" },
            { label: "Activities Joined", value: stats.activities, icon: <CheckCircleOutlined />, color: "#e48b25" },

          ].map((s, i) => (
            <Col key={i} lg={12} xs={24}>
              <div className="ref-stat-card">
                <div className="ref-stat-icon" style={{ backgroundColor: s.color }}>{s.icon}</div>
                <div>
                  <div className="ref-stat-value">{s.value}</div>
                  <div className="ref-stat-label">{s.label}</div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* 3. QUICK ACTIONS BAR */}
        <div className="ref-quick-actions-bar">
          <div className="quick-actions-info">
             <ThunderboltFilled style={{ color: "#E48B25" }} />
             <span>Take a step towards meaningful impact.</span>
          </div>
          <div className="quick-actions-btns">
            <button className="btn-join-ref" onClick={() => navigate("/admin/comming_soon_events")}>
              <PlusOutlined /> Join an Activity
            </button>
            <button className="btn-log-ref" onClick={() => navigate("/admin/my_events")}>
              <FormOutlined /> Log Your Contribution <DoubleRightOutlined style={{ fontSize: 12, marginLeft: 8 }} />
            </button>
          </div>
        </div>

        {/* 4. EVENTS: Upcoming, Present, and Past */}
        <div className="section-label">Your Activities</div>
        <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
          {/* Upcoming Activities */}
          <Col lg={8} md={12} xs={24}>
            <div className="event-column-wrapper">
              <div className="event-column-header">
                <span className="event-column-title"><Badge status="processing" color="#20a5de" /> Upcoming</span>
                <span className="view-all" onClick={() => navigate("/admin/comming_soon_events")}>View All</span>
              </div>
              <div className="event-row-container">
                {upcoming.length > 0 ? upcoming.map(e => (
                  <div key={e.tevent_id} className="ref-event-row upcoming" onClick={() => navigate(eventRoute(e))}>
                    <Avatar 
                      src={thumb(e)?.full_url} 
                      icon={!thumb(e)?.full_url && <CalendarOutlined />} 
                      size={44} 
                      className="event-avatar"
                    />
                    <div className="ref-event-info">
                      <div className="ref-event-title">{e.tevent_activity_title}</div>
                      <div className="ref-event-meta">{e.tevent_start_date}</div>
                    </div>
                    <button className="btn-action-small upcoming">Join</button>
                  </div>
                )) : <div className="no-events">No upcoming activities</div>}
              </div>
            </div>
          </Col>

          {/* Present Activities */}
          <Col lg={8} md={12} xs={24}>
            <div className="event-column-wrapper">
              <div className="event-column-header">
                <span className="event-column-title"><Badge status="processing" color="#52c41a" /> Happening Now</span>
                <span className="view-all" onClick={() => navigate("/admin/my-event")}>View All</span>
              </div>
              <div className="event-row-container">
                {present.length > 0 ? present.map(e => (
                  <div key={e.tevent_id} className="ref-event-row present" onClick={() => navigate(eventRoute(e))}>
                    <Avatar 
                      src={thumb(e)?.full_url} 
                      icon={!thumb(e)?.full_url && <ThunderboltFilled />} 
                      size={44} 
                      className="event-avatar"
                    />
                    <div className="ref-event-info">
                      <div className="ref-event-title">{e.tevent_activity_title}</div>
                      <div className="ref-event-meta">Ongoing</div>
                    </div>
                    <button className="btn-action-small present">Active</button>
                  </div>
                )) : <div className="no-events">No active activities today</div>}
              </div>
            </div>
          </Col>

          {/* Past Activities */}
          <Col lg={8} md={12} xs={24}>
            <div className="event-column-wrapper">
              <div className="event-column-header">
                <span className="event-column-title"><Badge status="default" /> Past Contribution</span>
                <span className="view-all" onClick={() => navigate("/admin/my-event")}>View All</span>
              </div>
              <div className="event-row-container">
                {past.length > 0 ? past.map(e => (
                  <div key={e.tevent_id} className="ref-event-row past" onClick={() => navigate(eventRoute(e))}>
                    <Avatar 
                      src={thumb(e)?.full_url} 
                      icon={!thumb(e)?.full_url && <CheckCircleOutlined />} 
                      size={44} 
                      className="event-avatar"
                    />
                    <div className="ref-event-info">
                      <div className="ref-event-title">{e.tevent_activity_title}</div>
                      <div className="ref-event-meta">{e.tevent_start_date}</div>
                    </div>
                    <button className="btn-action-small past">Completed</button>
                  </div>
                )) : <div className="no-events">No past activities found</div>}
              </div>
            </div>
          </Col>
        </Row>

        {/* ROW 4: IMPACT AREAS (Owl-Style Carousel) */}
        <div className="section-label animate-fade-in" style={{ animationDelay: "0.5s", marginBottom: 16 }}>Our Areas of Impact</div>
        {/* <div className="ref-impact-banner">
          <img src="https://images.unsplash.com/photo-1593113630400-ea4288922497?w=1200" alt="Banner" />
          <div className="ref-impact-overlay">
            <div className="ref-impact-sub">Corporate of impact</div>
            <div className="ref-impact-main">Your CSR Campaigns</div>
          </div>
        </div> */}

        <div className="impact-owl-container animate-fade-in" style={{ animationDelay: "0.6s", marginTop: 24, marginBottom: 40 }}>
          {/* <Carousel 
            autoplay 
            dots 
            slidesToShow={4} 
            slidesToScroll={1}
            responsive={[
              { breakpoint: 1200, settings: { slidesToShow: 3 } },
              { breakpoint: 992, settings: { slidesToShow: 2 } },
              { breakpoint: 768, settings: { slidesToShow: 1 } }
            ]}
          >
            {AREAS.map((a, i) => (
              <div key={i} className="impact-slide-wrapper">
                <div className="ref-impact-card">
                  <img src={a.img} alt={a.title} className="ref-impact-img" />
                  <div className="ref-impact-content">
                    <div className="ref-impact-title">{a.title}</div>
                    <div className="ref-impact-desc">{a.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
          */}
        </div>
      </main>
    </div>
  );
}
