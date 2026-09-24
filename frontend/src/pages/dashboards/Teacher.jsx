import React, { useState, useEffect } from "react";

import Header1 from "../../components/Header1";
import Footer1 from "../../components/Footer1";
import API from "../../api";
import {
  UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle,
  Search, Plus, Edit, Trash2, Download, AlertCircle, X,
  ArrowUpDown, ChevronLeft, ChevronRight, BookOpen,
  MessageSquare, Send, FileText, Inbox, RefreshCw,
  Calendar as CalendarIcon
} from "lucide-react";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";

export default function TeacherDashboard() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [academicRecords, setAcademicRecords] = useState([]);
  
  const [announcements, setAnnouncements] = useState([]);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMsg, setNoticeMsg] = useState("");
  const [noticeSubject, setNoticeSubject] = useState("General");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [editingNoticeId, setEditingNoticeId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const [sortColumn, setSortColumn] = useState("student_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    student_id: "", student_email: "", student_name: "", subject: "", marks_obtained: 0,
    max_marks: 100, exam_type: "Mid-Term", attendance_rate: "80%",
    grade: "B", assignment_score: 75, study_hours_per_week: 8, previous_gpa: 3.0
  });

  useEffect(() => {
    fetchAcademicRecords();
    fetchAnnouncements();
  }, []);

  const fetchAcademicRecords = async () => {
    try {
      const res = await API.get("/teacher/recent-marks");
      setAcademicRecords(res.data.recent_marks || []);
    } catch (err) {
      console.error("Failed to load records:", err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await API.get("/announcements");
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!noticeTitle || !noticeMsg) return alert("Please fill out Title and Message!");

    try {
      if (editingNoticeId) {
        await API.put(`/announcements/${editingNoticeId}`, {
          title: noticeTitle,
          message: noticeMsg,
          subject: noticeSubject,
          event_date: eventDate,
          event_time: eventTime
        });
        alert("Announcement Updated!");
      } else {
        await API.post("/announcements", {
          title: noticeTitle,
          message: noticeMsg,
          subject: noticeSubject,
          event_date: eventDate,
          event_time: eventTime
        });
        alert("Announcement Published!");
      }

      setNoticeTitle("");
      setNoticeMsg("");
      setNoticeSubject("General");
      setEventDate("");
      setEventTime("");
      setEditingNoticeId(null);
      fetchAnnouncements();

    } catch (err) {
      alert("Operation failed: " + (err.response?.data?.message || "Error"));
    }
  };

  const openEditNotice = (item) => {
    setEditingNoticeId(item._id);
    setNoticeTitle(item.title || "");
    setNoticeMsg(item.message || "");
    setNoticeSubject(item.subject || "General");
    setEventDate(item.event_date || "");
    setEventTime(item.event_time || "");
  };

  const cancelNoticeEdit = () => {
    setEditingNoticeId(null);
    setNoticeTitle("");
    setNoticeMsg("");
    setNoticeSubject("General");
    setEventDate("");
    setEventTime("");
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      await API.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to delete notice");
    }
  };

  const handleSaveRemark = async (recordId, currentRemark) => {
    const remark = prompt("Enter remark/feedback for student:", currentRemark || "");
    if (remark === null) return;

    try {
      await API.put(`/marks/${recordId}/remark`, { remark });
      alert("Remark saved successfully!");
      fetchAcademicRecords();
    } catch (err) {
      alert("Failed to save remark");
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select a CSV file first!");

    setLoading(true);
    setUploadStatus(null);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await API.post("/marks/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus("success");
      setStatusMessage(res.data.message);
      setFile(null);
      fetchAcademicRecords();
    } catch (err) {
      setUploadStatus("error");
      setStatusMessage(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await API.put(`/marks/${editItem._id}`, formData);
        alert("Record updated!");
      } else {
        await API.post("/marks/add", formData);
        alert("Record added!");
      }
      setIsModalOpen(false);
      fetchAcademicRecords();
    } catch (err) {
      alert("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await API.delete(`/marks/${id}`);
      fetchAcademicRecords();
    } catch (err) {
      alert("Failed to delete record");
    }
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditItem(null);
    setFormData({
      student_id: "", student_email: "", student_name: "", subject: "", marks_obtained: 0,
      max_marks: 100, exam_type: "Mid-Term", attendance_rate: "80%",
      grade: "B", assignment_score: 75, study_hours_per_week: 8, previous_gpa: 3.0
    });
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    if (academicRecords.length === 0) return alert("No data to export!");
    const headers = "Student ID,Student Name,Email,Subject,Marks,Grade,Attendance,At-Risk\n";
    const rows = academicRecords.map(r => 
      `"${r.student_id || 'STU-N/A'}","${r.student_name}","${r.student_email}","${r.subject}",${r.marks_obtained},"${r.grade}","${r.attendance_rate}",${r.is_at_risk ? 'YES' : 'NO'}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_academic_report.csv";
    a.click();
  };

  const subjectAverages = React.useMemo(() => {
    const map = {};
    academicRecords.forEach(r => {
      if (!map[r.subject]) map[r.subject] = { subject: r.subject, total: 0, count: 0 };
      map[r.subject].total += r.marks_obtained || 0;
      map[r.subject].count += 1;
    });
    return Object.values(map).map(s => ({ subject: s.subject, avgMarks: Math.round(s.total / s.count) }));
  }, [academicRecords]);

  const gradeDistribution = React.useMemo(() => {
    const counts = {};
    academicRecords.forEach(r => {
      const g = (r.grade || 'N/A').toUpperCase();
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.keys(counts).map(g => ({ name: `Grade ${g}`, value: counts[g] }));
  }, [academicRecords]);

  const PIE_COLORS = ['#059669', '#1D4ED8', '#7C3AED', '#D97706', '#E11D48', '#64748B'];
  const BAR_COLORS = ['#1D4ED8', '#7C3AED', '#0D9488', '#D97706', '#E11D48', '#0284C7'];
  const TOOLTIP_STYLE = { borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(15,23,42,0.08)', fontSize: 13 };

  const filteredRecords = academicRecords.filter((item) => {
    const matchesSearch = item.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === "ALL" || item.subject === subjectFilter;
    const isRisk = Boolean(item.is_at_risk);
    const matchesRisk = riskFilter === "ALL" || 
                        (riskFilter === "RISK" && isRisk) || 
                        (riskFilter === "SAFE" && !isRisk);

    return matchesSearch && matchesSubject && matchesRisk;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let valA = a[sortColumn];
    let valB = b[sortColumn];
    if (sortColumn === "attendance_rate") {
      valA = parseFloat(String(valA || '0').replace('%', '')) || 0;
      valB = parseFloat(String(valB || '0').replace('%', '')) || 0;
    }
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedRecords.length / recordsPerPage) || 1;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalStudents = academicRecords.length;
  const atRiskStudents = academicRecords.filter(r => r.is_at_risk).length;
  const uniqueSubjects = [...new Set(academicRecords.map(r => r.subject))];

  const SortIcon = () => <ArrowUpDown size={12} className="sort-icon" />;
  const marksClass = (m) => (m >= 75 ? 'badge-success' : m < 50 ? 'badge-danger' : 'badge-warning');

  return (
    <div className="app-shell">
      <Header1 title="Teacher Dashboard" />

      <main className="app-main">
        <div className="welcome-banner">
          <div>
            <h1>Class overview</h1>
            <p>Upload marks, monitor at-risk students and publish class notices.</p>
          </div>
          <div className="row banner-actions">
            <button onClick={handleExportCSV} className="btn btn-outline-light">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={openAddModal} className="btn btn-light">
              <Plus size={16} /> Add record
            </button>
          </div>
        </div>

        <div className="stack">
          {/* Metric Cards */}
          <div className="grid-3">
            <div className="card stat accent accent-primary">
              <div>
                <p className="stat-label">Total records</p>
                <p className="stat-value">{totalStudents}</p>
              </div>
              <div className="stat-icon primary"><FileSpreadsheet size={20} /></div>
            </div>
            <div className="card stat accent accent-rose">
              <div>
                <p className="stat-label">At-risk students</p>
                <p className="stat-value" style={{ color: atRiskStudents > 0 ? 'var(--danger)' : undefined }}>{atRiskStudents}</p>
              </div>
              <div className="stat-icon rose"><AlertTriangle size={20} /></div>
            </div>
            <div className="card stat accent accent-teal">
              <div>
                <p className="stat-label">Subjects covered</p>
                <p className="stat-value">{uniqueSubjects.length}</p>
              </div>
              <div className="stat-icon teal"><BookOpen size={20} /></div>
            </div>
          </div>

          {/* Upload & Post Notice */}
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Upload marks</h2>
                  <p className="card-subtitle">Import marks, attendance and exam results from a CSV file.</p>
                </div>
              </div>
              <div className="card-body">
                <form onSubmit={handleFileUpload} className="form-stack">
                  <label className={`dropzone ${file ? 'active' : ''}`}>
                    <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} />
                    {file ? (
                      <div className="row" style={{ justifyContent: 'center' }}>
                        <FileText size={22} color="var(--primary)" />
                        <div style={{ textAlign: 'left' }}>
                          <div className="cell-strong" style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{file.name}</div>
                          <div className="text-xs muted">{(file.size / 1024).toFixed(1)} KB · Click to change file</div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={24} color="var(--gray-400)" style={{ marginBottom: 8 }} />
                        <p style={{ fontWeight: 500, color: 'var(--gray-700)' }}>
                          <span style={{ color: 'var(--primary)' }}>Click to browse</span> for a CSV file
                        </p>
                        <p className="text-xs muted" style={{ marginTop: 4 }}>Accepted format: .csv</p>
                      </>
                    )}
                  </label>

                  <button type="submit" disabled={loading || !file} className="btn btn-primary btn-block">
                    {loading ? <RefreshCw className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                    {loading ? "Uploading…" : "Upload file"}
                  </button>
                </form>

                {uploadStatus && (
                  <div className={`alert ${uploadStatus === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginTop: 16 }}>
                    {uploadStatus === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{statusMessage}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">{editingNoticeId ? "Edit announcement" : "New announcement"}</h2>
                  <p className="card-subtitle">Publish notices and quiz dates to student and parent dashboards.</p>
                </div>
              </div>
              <div className="card-body">
                <form onSubmit={handlePostAnnouncement} className="form-stack">
                  <div className="form-grid">
                    <div className="field" style={{ gridColumn: 'span 1' }}>
                      <label className="label" htmlFor="noticeTitle">Title</label>
                      <input id="noticeTitle" className="input" type="text" placeholder="e.g. Mid-term quiz 01" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="noticeSubject">Subject</label>
                      <select id="noticeSubject" className="select" value={noticeSubject} onChange={(e) => setNoticeSubject(e.target.value)}>
                        <option value="General">General</option>
                        {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label className="label" htmlFor="eventDate">Event date <span className="muted">(optional)</span></label>
                      <input id="eventDate" className="input" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="eventTime">Event time <span className="muted">(optional)</span></label>
                      <input id="eventTime" className="input" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label" htmlFor="noticeMsg">Message</label>
                    <textarea id="noticeMsg" className="textarea" placeholder="Write the notice details or quiz instructions…" rows={3} value={noticeMsg} onChange={(e) => setNoticeMsg(e.target.value)} />
                  </div>

                  <div className="row" style={{ justifyContent: 'flex-end' }}>
                    {editingNoticeId && (
                      <button type="button" onClick={cancelNoticeEdit} className="btn btn-secondary">Cancel</button>
                    )}
                    <button type="submit" className="btn btn-primary">
                      <Send size={16} /> {editingNoticeId ? "Save changes" : "Publish"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Active Announcements */}
          {announcements.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Active announcements</h2>
                <span className="badge">{announcements.length}</span>
              </div>
              <div className="list scroll-area">
                {announcements.map((item) => (
                  <div key={item._id} className="list-item">
                    <div style={{ minWidth: 0 }}>
                      <div className="row" style={{ gap: 8 }}>
                        <span className="list-item-title">{item.title}</span>
                        <span className="badge badge-primary">{item.subject}</span>
                      </div>
                      <p className="list-item-text">{item.message}</p>
                      <div className="list-item-meta">
                        {item.event_date && (
                          <span className="badge badge-warning">
                            <CalendarIcon size={12} /> {item.event_date}{item.event_time ? ` · ${item.event_time}` : ''}
                          </span>
                        )}
                        <span>Posted {item.date_posted}</span>
                      </div>
                    </div>
                    <div className="row" style={{ gap: 4, alignSelf: 'flex-start' }}>
                      <button onClick={() => openEditNotice(item)} className="btn btn-ghost btn-icon" title="Edit notice" aria-label="Edit notice">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteAnnouncement(item._id)} className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }} title="Delete notice" aria-label="Delete notice">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          {academicRecords.length > 0 && (
            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Average marks by subject</h2>
                </div>
                <div className="card-body" style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectAverages} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="avgMarks" name="Average marks" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {subjectAverages.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Grade distribution</h2>
                </div>
                <div className="card-body" style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={gradeDistribution} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value" stroke="#FFFFFF">
                        {gradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#475569' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Records Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Student records</h2>
                <p className="card-subtitle">{sortedRecords.length} of {academicRecords.length} records</p>
              </div>
              <div className="toolbar toolbar-end">
                <div className="input-group">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by ID, name or subject"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  />
                </div>
                <select className="select" value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="ALL">All subjects</option>
                  {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="select" value={riskFilter} onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="ALL">All statuses</option>
                  <option value="RISK">At risk</option>
                  <option value="SAFE">On track</option>
                </select>
              </div>
            </div>

            <div className="table-wrap">
              <table className="table table-stack table-min-lg">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('student_id')}>Student ID <SortIcon /></th>
                    <th className="sortable" onClick={() => handleSort('student_name')}>Student <SortIcon /></th>
                    <th className="sortable" onClick={() => handleSort('subject')}>Subject <SortIcon /></th>
                    <th className="sortable" onClick={() => handleSort('marks_obtained')}>Marks <SortIcon /></th>
                    <th>Grade</th>
                    <th className="sortable" onClick={() => handleSort('attendance_rate')}>Attendance <SortIcon /></th>
                    <th className="sortable" onClick={() => handleSort('is_at_risk')}>Status <SortIcon /></th>
                    <th>Remark</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length > 0 ? (
                    currentRecords.map((item) => (
                      <tr key={item._id} className={item.is_at_risk ? 'row-flagged' : ''}>
                        <td data-label="Student ID" className="mono text-sm">{item.student_id || "—"}</td>
                        <td data-label="Student">
                          <div>
                            <div className="cell-strong">{item.student_name}</div>
                            <div className="text-xs muted">{item.student_email}</div>
                          </div>
                        </td>
                        <td data-label="Subject">{item.subject}</td>
                        <td data-label="Marks"><span className={`badge ${marksClass(item.marks_obtained)}`}>{item.marks_obtained}/{item.max_marks || 100}</span></td>
                        <td data-label="Grade" className="cell-strong">{item.grade}</td>
                        <td data-label="Attendance">{item.attendance_rate}</td>
                        <td data-label="Status">
                          <span className={`badge ${item.is_at_risk ? 'badge-danger' : 'badge-success'}`}>
                            {item.is_at_risk ? "At risk" : "On track"}
                          </span>
                        </td>
                        <td data-label="Remark" className="cell-remark">
                          <button
                            onClick={() => handleSaveRemark(item._id, item.teacher_remark)}
                            className="btn btn-ghost btn-sm"
                            style={{ maxWidth: '100%', justifyContent: 'flex-start', paddingLeft: 8, color: item.teacher_remark ? 'var(--gray-700)' : 'var(--primary)' }}
                            title={item.teacher_remark || "Add remark"}
                          >
                            <MessageSquare size={14} style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.teacher_remark || "Add remark"}</span>
                          </button>
                        </td>
                        <td data-label="Actions">
                          <div className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
                            <button onClick={() => openEditModal(item)} className="btn btn-ghost btn-icon" title="Edit record" aria-label="Edit record"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(item._id)} className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }} title="Delete record" aria-label="Delete record"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="cell-full">
                        <div className="empty">
                          <Inbox size={28} />
                          <p className="empty-title">No student records found</p>
                          <p className="text-sm">Upload a CSV file or add a record to get started.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="card-footer">
              <div className="row text-sm muted" style={{ gap: 8 }}>
                <span>Rows per page</span>
                <select className="select" style={{ width: 72, height: 32 }} value={recordsPerPage} onChange={(e) => { setRecordsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <div className="row text-sm muted">
                <span>
                  {sortedRecords.length > 0 ? indexOfFirstRecord + 1 : 0}–{Math.min(indexOfLastRecord, sortedRecords.length)} of {sortedRecords.length}
                </span>
                <div className="row" style={{ gap: 4 }}>
                  <button className="btn btn-secondary btn-icon" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
                  <button className="btn btn-secondary btn-icon" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Record Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <form className="card modal" onSubmit={handleModalSubmit} onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h2 className="card-title">{editItem ? "Edit student record" : "Add student record"}</h2>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setIsModalOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>

            <div className="card-body form-stack">
              <div className="form-grid">
                <div className="field">
                  <label className="label">Student ID</label>
                  <input className="input" type="text" required placeholder="e.g. STU1001" value={formData.student_id || ""} onChange={e => setFormData({...formData, student_id: e.target.value.toUpperCase()})} />
                </div>
                <div className="field">
                  <label className="label">Student name</label>
                  <input className="input" type="text" required placeholder="Full name" value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} />
                </div>
              </div>

              <div className="field">
                <label className="label">Student email</label>
                <input className="input" type="email" required placeholder="name@example.com" value={formData.student_email} onChange={e => setFormData({...formData, student_email: e.target.value})} />
              </div>

              <div className="form-grid">
                <div className="field">
                  <label className="label">Subject</label>
                  <input className="input" type="text" required placeholder="Mathematics" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                </div>
                <div className="field">
                  <label className="label">Marks (0–100)</label>
                  <input className="input" type="number" required value={formData.marks_obtained} onChange={e => setFormData({...formData, marks_obtained: e.target.value})} />
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label className="label">Grade</label>
                  <input className="input" type="text" placeholder="A" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} />
                </div>
                <div className="field">
                  <label className="label">Attendance (%)</label>
                  <input className="input" type="text" placeholder="85%" value={formData.attendance_rate} onChange={e => setFormData({...formData, attendance_rate: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="card-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editItem ? "Save changes" : "Add record"}</button>
            </div>
          </form>
        </div>
      )}

      <Footer1 />
    </div>
  );
}
