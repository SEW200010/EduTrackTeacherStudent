import React, { useState, useEffect, useRef } from "react";

import Header1 from "../../components/Header1";
import Footer1 from "../../components/Footer1";
import API from "../../api";
import html2pdf from "html2pdf.js";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";
import {
  Search, RefreshCw, Download, Calendar, Inbox, BookOpen, TrendingUp, Award
} from "lucide-react";

const TOOLTIP_STYLE = { borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(15,23,42,0.08)', fontSize: 13 };

export default function Student() {
  const [marks, setMarks] = useState([]);
  const [filteredMarks, setFilteredMarks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("ALL");
  const [targetGPA, setTargetGPA] = useState("3.8");

  const reportRef = useRef();
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchStudentDashboardData(parsedUser.user_id);   
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStudentDashboardData = async (studentId) => {
    setLoading(true);
    try {
      const marksRes = await API.get(`/student/marks/${studentId}`);
      const fetchedMarks = marksRes.data.marks || [];
      setMarks(fetchedMarks);
      setFilteredMarks(fetchedMarks);

      const annRes = await API.get("/student/announcements");
      setAnnouncements(annRes.data.announcements || []);
    } catch (err) {
      console.error("Error fetching student dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = marks;
    if (searchTerm.trim() !== "") {
      result = result.filter(item => 
        item.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedGrade !== "ALL") {
      result = result.filter(item => item.grade === selectedGrade);
    }
    setFilteredMarks(result);
  }, [searchTerm, selectedGrade, marks]);

  const handleDownloadPDF = () => {
    if (!reportRef.current) return alert("Report element not found!");

    setDownloadingPdf(true);
    const element = reportRef.current;

    const opt = {
      margin:      0.3,
      filename:    `${user?.name || 'Student'}_Academic_Report.pdf`,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:       { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setDownloadingPdf(false);
    }).catch(err => {
      console.error("PDF Export Error:", err);
      setDownloadingPdf(false);
    });
  };

  const chartData = marks.map(item => ({
    subject: item.subject,
    MyMarks: item.marks_obtained || 0,
    ClassAvg: item.class_avg || 60
  }));

  const neededMarks = Math.max(0, Math.min(100, ((parseFloat(targetGPA) || 0) * 25))).toFixed(0);


  const avgMarks = marks.length > 0
    ? Math.round(marks.reduce((acc, m) => acc + (m.marks_obtained || 0), 0) / marks.length)
    : 0;
  const gradeBadge = (g) => (g === 'A' ? 'badge-success' : g === 'F' ? 'badge-danger' : g === 'B' ? 'badge-primary' : 'badge-warning');

  return (
    <div className="app-shell">
      <Header1 title="Student Portal" />

      <main className="app-main">
        <div className="welcome-banner">
          <div>
            <h1>Welcome back, {user?.name || "Student"}</h1>
            <p>Student ID: <span className="mono">{user?.user_id || "N/A"}</span> · Here is how your studies are going.</p>
          </div>
          <button onClick={handleDownloadPDF} disabled={downloadingPdf} className="btn btn-light">
            {downloadingPdf ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />}
            {downloadingPdf ? "Generating PDF…" : "Download report"}
          </button>
        </div>

        <div className="stack">
          {/* Summary */}
          <div className="grid-3">
            <div className="card stat accent accent-primary">
              <div>
                <p className="stat-label">Subjects</p>
                <p className="stat-value">{loading ? "—" : marks.length}</p>
              </div>
              <div className="stat-icon primary"><BookOpen size={20} /></div>
            </div>
            <div className="card stat accent accent-success">
              <div>
                <p className="stat-label">Average marks</p>
                <p className="stat-value">{loading ? "—" : `${avgMarks}%`}</p>
              </div>
              <div className="stat-icon success"><TrendingUp size={20} /></div>
            </div>
            <div className="card stat accent accent-amber">
              <div>
                <p className="stat-label">Announcements</p>
                <p className="stat-value">{announcements.length}</p>
              </div>
              <div className="stat-icon amber"><Calendar size={20} /></div>
            </div>
          </div>

          <div className="grid-2">
            {/* Announcements */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Class announcements</h2>
                  <p className="card-subtitle">Updates posted by your teachers</p>
                </div>
              </div>
              {announcements.length > 0 ? (
                <div className="list scroll-area" style={{ maxHeight: 280 }}>
                  {announcements.map((item) => (
                    <div key={item._id} className="list-item" style={{ display: 'block' }}>
                      <div className="row-between" style={{ gap: 8 }}>
                        <span className="list-item-title">{item.title}</span>
                        <span className="badge badge-primary">{item.subject}</span>
                      </div>
                      <p className="list-item-text">{item.message}</p>
                      {item.event_date && (
                        <div className="list-item-meta">
                          <span className="badge badge-warning">
                            <Calendar size={12} /> {item.event_date}{item.event_time ? ` · ${item.event_time}` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <Inbox size={24} />
                  <p className="empty-title">No announcements yet</p>
                </div>
              )}
            </div>

            {/* Target GPA */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Target GPA calculator</h2>
                  <p className="card-subtitle">Estimate the average score you need</p>
                </div>
              </div>
              <div className="card-body form-stack">
                <div className="field" style={{ maxWidth: 200 }}>
                  <label className="label" htmlFor="targetGPA">Target GPA (0.0 – 4.0)</label>
                  <input
                    id="targetGPA"
                    className="input"
                    type="number" step="0.1" max="4.0" min="0.0"
                    value={targetGPA}
                    onChange={(e) => setTargetGPA(e.target.value)}
                  />
                </div>
                <div className="alert" style={{ background: 'var(--violet-soft)', borderColor: '#DDD6FE', color: 'var(--violet)' }}>
                  <Award size={16} />
                  <span>To reach a <strong>{targetGPA || 0} GPA</strong>, aim for an average score of about <strong>{neededMarks}%</strong>.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          {marks.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Performance comparison</h2>
                  <p className="card-subtitle">Your marks compared with the class average</p>
                </div>
              </div>
              <div className="card-body" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={4}>
                    <CartesianGrid vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={TOOLTIP_STYLE} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#475569' }} />
                    <Bar dataKey="MyMarks" fill="#1D4ED8" name="My marks" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="ClassAvg" fill="#F59E0B" name="Class average" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Records (exported to PDF) */}
          <div ref={reportRef} className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Academic records</h2>
                <p className="card-subtitle">{user?.name || "N/A"} · ID {user?.user_id || "N/A"}</p>
              </div>
              <div className="toolbar">
                <div className="input-group">
                  <Search size={16} />
                  <input
                    type="text" placeholder="Search subject"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select className="select" value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
                  <option value="ALL">All grades</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                  <option value="F">Grade F</option>
                </select>
              </div>
            </div>

            <div className="table-wrap">
              <table className="table table-stack table-min-md">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Exam type</th>
                    <th>Marks</th>
                    <th>Grade</th>
                    <th>Attendance</th>
                    <th>Teacher remark</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarks.length > 0 ? (
                    filteredMarks.map((item, index) => (
                      <tr key={item._id || index}>
                        <td data-label="Subject" className="cell-strong">{item.subject}</td>
                        <td data-label="Exam type">{item.exam_type || "Mid-Term"}</td>
                        <td data-label="Marks" className="cell-strong">{item.marks_obtained}/{item.max_marks || 100}</td>
                        <td data-label="Grade"><span className={`badge ${gradeBadge(item.grade)}`}>{item.grade}</span></td>
                        <td data-label="Attendance">{item.attendance_rate}</td>
                        <td data-label="Remark" className={item.teacher_remark ? '' : 'muted'}>{item.teacher_remark || "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="cell-full">
                        <div className="empty">
                          <p className="empty-title">{loading ? "Loading records…" : "No records match the selected filters"}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer1 />
    </div>
  );
}
