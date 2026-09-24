import React, { useState, useEffect } from "react";

import Header1 from "../../components/Header1";
import Footer1 from "../../components/Footer1";
import API from "../../api";
import {
  Calendar, BookOpen, TrendingUp, Wallet, Info, Inbox
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";

const TOOLTIP_STYLE = { borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(15,23,42,0.08)', fontSize: 13 };

export default function ParentDashboard() {
  const [childDetails, setChildDetails] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchParentData(parsedUser.student_id || parsedUser.user_id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchParentData = async (studentId) => {
    setLoading(true);
    try {
      // Fetch Child Academic Records & Fees
      if (studentId) {
        const detailsRes = await API.get(`/parent/student-details/${studentId}`);
        setChildDetails(detailsRes.data);
      }

      // Fetch Announcements
      const annRes = await API.get("/parent/announcements");
      setAnnouncements(annRes.data.announcements || []);
    } catch (err) {
      console.error("Error fetching parent dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const marksList = childDetails?.marks || [];
  
  // Calculate Averages
  const totalSubjects = marksList.length;
  const avgMarks = totalSubjects > 0 
    ? Math.round(marksList.reduce((acc, curr) => acc + (curr.marks_obtained || 0), 0) / totalSubjects)
    : 0;

  const chartData = marksList.map(item => ({
    subject: item.subject,
    StudentMarks: item.marks_obtained || 0,
    ClassAvg: item.class_avg || 60
  }));


  const feeStatus = childDetails?.fee_info?.term_fee_status || "Paid";
  const feePaid = feeStatus === 'Paid';
  const gradeBadge = (g) => (g === 'A' ? 'badge-success' : g === 'F' ? 'badge-danger' : g === 'B' ? 'badge-primary' : 'badge-warning');

  return (
    <div className="app-shell">
      <Header1 title="Parent Portal" />

      <main className="app-main">
        <div className="welcome-banner">
          <div>
            <h1>Welcome, {user?.name || "Parent"}</h1>
            <p>
              Viewing academic progress for <strong style={{ color: '#FFFFFF' }}>{childDetails?.student_name || "your child"}</strong>
              {childDetails?.student_id && <> · ID <span className="mono">{childDetails.student_id}</span></>}
            </p>
          </div>
        </div>

        <div className="stack">
          {/* Summary */}
          <div className="grid-3">
            <div className="card stat accent accent-primary">
              <div>
                <p className="stat-label">Overall average</p>
                <p className="stat-value">{loading ? "—" : `${avgMarks}%`}</p>
              </div>
              <div className="stat-icon primary"><TrendingUp size={20} /></div>
            </div>
            <div className="card stat accent accent-violet">
              <div>
                <p className="stat-label">Subjects</p>
                <p className="stat-value">{loading ? "—" : totalSubjects}</p>
              </div>
              <div className="stat-icon violet"><BookOpen size={20} /></div>
            </div>
            <div className={`card stat accent ${feePaid ? 'accent-success' : 'accent-rose'}`}>
              <div>
                <p className="stat-label">Term fee</p>
                <p className="stat-value" style={{ fontSize: 22, marginTop: 10 }}>
                  <span className={`badge ${feePaid ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 14, padding: '4px 12px' }}>{feeStatus}</span>
                </p>
              </div>
              <div className={`stat-icon ${feePaid ? 'success' : 'danger'}`}><Wallet size={20} /></div>
            </div>
          </div>

          <div className="grid-2">
            {/* Notices */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">School and class notices</h2>
                  <p className="card-subtitle">Updates posted by teachers</p>
                </div>
                <span className="badge">{announcements.length}</span>
              </div>
              {announcements.length > 0 ? (
                <div className="list scroll-area" style={{ maxHeight: 300 }}>
                  {announcements.map((item) => (
                    <div key={item._id} className="list-item" style={{ display: 'block' }}>
                      <div className="row-between" style={{ gap: 8 }}>
                        <span className="list-item-title">{item.title}</span>
                        <span className="badge badge-primary">{item.subject}</span>
                      </div>
                      <p className="list-item-text">{item.message}</p>
                      <div className="list-item-meta">
                        {item.event_date && (
                          <span className="badge badge-warning">
                            <Calendar size={12} /> {item.event_date}{item.event_time ? ` · ${item.event_time}` : ''}
                          </span>
                        )}
                        <span>By {item.posted_by || "Teacher"}</span>
                        <span>Posted {item.date_posted}</span>
                      </div>
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

            {/* Fees */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Term fee and payment</h2>
                  <p className="card-subtitle">Billing summary for the current term</p>
                </div>
              </div>
              <div className="card-body">
                <dl>
                  <div className="kv">
                    <dt>Payment status</dt>
                    <dd><span className={`badge ${feePaid ? 'badge-success' : 'badge-danger'}`}>{feeStatus}</span></dd>
                  </div>
                  <div className="kv">
                    <dt>Due date</dt>
                    <dd>{childDetails?.fee_info?.due_date || "N/A"}</dd>
                  </div>
                  <div className="kv">
                    <dt>Amount due</dt>
                    <dd>{childDetails?.fee_info?.amount_due || "LKR 0.00"}</dd>
                  </div>
                </dl>
                <div className="alert alert-info" style={{ marginTop: 16 }}>
                  <Info size={16} />
                  <span>For receipts or installment inquiries, please contact the school administration office.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          {marksList.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Academic comparison</h2>
                  <p className="card-subtitle">Your child's marks compared with the class average</p>
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
                    <Bar dataKey="StudentMarks" fill="#1D4ED8" name="Child's marks" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="ClassAvg" fill="#F59E0B" name="Class average" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Marks table */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Subject marks and teacher remarks</h2>
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
                  {marksList.length > 0 ? (
                    marksList.map((item, index) => (
                      <tr key={index}>
                        <td data-label="Subject" className="cell-strong">{item.subject}</td>
                        <td data-label="Exam type">{item.exam_type || "Mid-Term"}</td>
                        <td data-label="Marks" className="cell-strong">{item.marks_obtained}/{item.max_marks || 100}</td>
                        <td data-label="Grade"><span className={`badge ${gradeBadge(item.grade)}`}>{item.grade}</span></td>
                        <td data-label="Attendance">{item.attendance_rate}</td>
                        <td data-label="Remark" className={item.teacher_remark ? '' : 'muted'}>{item.teacher_remark || "No remark yet"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="cell-full">
                        <div className="empty">
                          <p className="empty-title">{loading ? "Loading records…" : "No academic records found for this student"}</p>
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
