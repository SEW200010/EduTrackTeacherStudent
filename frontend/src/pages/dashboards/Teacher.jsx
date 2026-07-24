import React, { useState, useEffect } from "react";

import Header1 from "../../components/Header1";
import Footer1 from "../../components/Footer1";
import API from "../../api";
import { 
  UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle, 
  Search, Plus, Edit, Trash2, Download, AlertCircle, X,
  ArrowUpDown, ChevronLeft, ChevronRight, BarChart2, PieChart as PieIcon, 
  Megaphone, MessageSquare, Send, FileText, Sparkles, Inbox, RefreshCw,
  Calendar as CalendarIcon, Clock
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

  const PIE_COLORS = ['#10B981', '#2563EB', '#F59E0B', '#EF4444', '#8B5CF6'];

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F1F5F9', fontFamily: "'Inter', sans-serif" }}>
      <Header1 title="Teacher Performance Analytics" subtitle="Class Insights, Bulk Marks Upload & Notice Center" />

      {/* Main Container */}
      <div style={{ maxWidth: '1320px', margin: '0 auto', width: '100%', padding: '85px 24px 60px 24px', flex: 1 }}>
        
        {/* Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          
          <div style={{
            background: '#FFFFFF',
            borderLeft: '5px solid #2563EB',
            padding: '22px 26px',
            borderRadius: '20px',
            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.08)',
            border: '1px solid #E2E8F0',
            borderLeftWidth: '5px',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <p style={{ color: '#64748B', fontSize: '12px', fontWeight: '800', margin: 0, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Total Records</p>
                <Sparkles size={14} color="#2563EB" />
              </div>
              <h2 style={{ color: '#0F172A', fontSize: '32px', fontWeight: '800', marginTop: '6px', margin: 0, lineHeight: 1 }}>{totalStudents}</h2>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', padding: '14px', borderRadius: '16px' }}>
              <FileSpreadsheet size={30} color="#2563EB" />
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            borderLeft: '5px solid #EF4444',
            padding: '22px 26px',
            borderRadius: '20px',
            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.08)',
            border: '1px solid #E2E8F0',
            borderLeftWidth: '5px',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <p style={{ color: '#EF4444', fontSize: '12px', fontWeight: '800', margin: 0, letterSpacing: '0.8px', textTransform: 'uppercase' }}>At-Risk Students</p>
                <AlertTriangle size={14} color="#EF4444" />
              </div>
              <h2 style={{ color: '#EF4444', fontSize: '32px', fontWeight: '800', marginTop: '6px', margin: 0, lineHeight: 1 }}>{atRiskStudents}</h2>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)', padding: '14px', borderRadius: '16px' }}>
              <AlertCircle size={30} color="#EF4444" />
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            borderLeft: '5px solid #10B981',
            padding: '22px 26px',
            borderRadius: '20px',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.08)',
            border: '1px solid #E2E8F0',
            borderLeftWidth: '5px',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ color: '#64748B', fontSize: '12px', fontWeight: '800', margin: 0, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Subjects Covered</p>
              <h2 style={{ color: '#0F172A', fontSize: '32px', fontWeight: '800', marginTop: '6px', margin: 0, lineHeight: 1 }}>{uniqueSubjects.length}</h2>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', padding: '14px', borderRadius: '16px' }}>
              <CheckCircle size={30} color="#10B981" />
            </div>
          </div>

        </div>

        {/* Upload & Post Notice Block */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          
          {/* CSV File Upload */}
          <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '800' }}>
              <UploadCloud color="#2563EB" size={24} /> Upload CSV Academic Marks
            </h3>
            <p style={{ color: '#64748B', fontSize: '13px', margin: '0 0 20px 0', lineHeight: 1.5 }}>Upload bulk student marks, attendance and exam results using structured CSV files.</p>
            
            <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{
                border: file ? '2px solid #2563EB' : '2px dashed #CBD5E1',
                borderRadius: '18px',
                padding: '28px 20px',
                textAlign: 'center',
                background: file ? '#EFF6FF' : '#F8FAFC',
                cursor: 'pointer',
                display: 'block'
              }}>
                <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} />
                {file ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#2563EB', padding: '10px', borderRadius: '50%', color: '#FFF' }}><FileText size={28} /></div>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{file.name}</span>
                    <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: '600', background: '#DBEAFE', padding: '2px 10px', borderRadius: '12px' }}>
                      {(file.size / 1024).toFixed(1)} KB • CSV File Selected
                    </span>
                  </div>
                ) : (
                  <div>
                    <div style={{ width: '56px', height: '56px', background: '#FFFFFF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                      <UploadCloud size={28} color="#2563EB" />
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', margin: '0 0 4px 0' }}>Click to Browse or Drag CSV Here</p>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Supports .csv format with student details</p>
                  </div>
                )}
              </label>

              <button 
                type="submit" 
                disabled={loading || !file}
                style={{
                  background: !file ? '#94A3B8' : loading ? '#93C5FD' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '14px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: (!file || loading) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                {loading ? "Uploading Records..." : "Upload CSV Data"}
              </button>
            </form>

            {uploadStatus && (
              <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '12px', background: uploadStatus === 'success' ? '#ECFDF5' : '#FEF2F2', border: uploadStatus === 'success' ? '1px solid #A7F3D0' : '1px solid #FECACA', color: uploadStatus === 'success' ? '#065F46' : '#991B1B', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {uploadStatus === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Post/Edit Class Notice Form */}
          <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '800' }}>
                <Megaphone color="#2563EB" size={24} /> {editingNoticeId ? "Edit Announcement" : "Post Class Notice / Quiz"}
              </h3>
              <p style={{ color: '#64748B', fontSize: '13px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                Publish notices and schedule quiz dates directly to student & parent dashboards.
              </p>

              <form onSubmit={handlePostAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Notice Title (e.g. Mid-Term Quiz 01)"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    style={{ padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E2E8F0', outline: 'none', fontSize: '13.5px', background: '#F8FAFC' }}
                  />
                  <select
                    value={noticeSubject}
                    onChange={(e) => setNoticeSubject(e.target.value)}
                    style={{ padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E2E8F0', outline: 'none', fontSize: '13.5px', background: '#F8FAFC', color: '#1E293B', fontWeight: '600' }}
                  >
                    <option value="General">General</option>
                    {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Calendar Date & Time Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      <CalendarIcon size={14} color="#2563EB" /> Quiz / Event Date
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      style={{ width: '100%', padding: '11px 2px', borderRadius: '12px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '13px', background: '#F8FAFC', fontWeight: '600' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      <Clock size={14} color="#2563EB" /> Quiz / Event Time
                    </label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      style={{ width: '100%', padding: '11px 2px', borderRadius: '12px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '13px', background: '#F8FAFC', fontWeight: '600' }}
                    />
                  </div>
                </div>

                <textarea
                  placeholder="Write message details or quiz instructions here..."
                  rows={3}
                  value={noticeMsg}
                  onChange={(e) => setNoticeMsg(e.target.value)}
                  style={{ padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E2E8F0', outline: 'none', resize: 'none', fontSize: '13.5px', background: '#F8FAFC' }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="submit" 
                    style={{
                      flex: 1,
                      background: editingNoticeId ? '#2563EB' : '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '13px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Send size={16} /> {editingNoticeId ? "Update Announcement" : "Publish Announcement"}
                  </button>

                  {editingNoticeId && (
                    <button 
                      type="button" 
                      onClick={cancelNoticeEdit} 
                      style={{ background: '#E2E8F0', color: '#334155', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Active Class Announcements */}
        {announcements.length > 0 && (
          <div style={{ background: '#FFFFFF', padding: '22px 28px', borderRadius: '24px', border: '1px solid #E2E8F0', marginBottom: '32px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone size={18} color="#2563EB" /> Active Class Announcements ({announcements.length})
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', maxHeight: '280px', overflowY: 'auto' }}>
              {announcements.map((item) => (
                <div key={item._id} style={{ background: '#F8FAFC', padding: '14px 18px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ color: '#0F172A', fontSize: '14px' }}>{item.title}</strong>
                      <span style={{ fontSize: '11px', background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '8px', fontWeight: '800' }}>
                        {item.subject}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '13px', lineHeight: 1.4 }}>{item.message}</p>
                    
                    {item.event_date && (
                      <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', padding: '4px 10px', borderRadius: '8px', marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#92400E', fontWeight: '800' }}>
                        <Clock size={13} color="#D97706" />
                        <span>Quiz Schedule: <strong>{item.event_date}</strong> {item.event_time ? `@ ${item.event_time}` : ''}</span>
                      </div>
                    )}

                    <div style={{ display: 'block' }}>
                      <span style={{ fontSize: '11px', color: '#0284C7', fontWeight: '700' }}>Posted: {item.date_posted}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => openEditNotice(item)} style={{ background: '#EFF6FF', border: 'none', color: '#2563EB', cursor: 'pointer', padding: '6px', borderRadius: '8px' }} title="Edit Notice">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteAnnouncement(item._id)} style={{ background: '#FEF2F2', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '6px', borderRadius: '8px' }} title="Delete Notice">
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ color: '#0F172A', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '800' }}>
                <BarChart2 size={20} color="#2563EB" /> Subject Average Performance
              </h4>
              <div style={{ width: '100%', height: 230 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectAverages}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="avgMarks" fill="#2563EB" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ color: '#0F172A', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '800' }}>
                <PieIcon size={20} color="#10B981" /> Class Grade Distribution
              </h4>
              <div style={{ width: '100%', height: 230 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gradeDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div style={{
          display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '18px', background: '#FFFFFF', padding: '18px 24px', borderRadius: '20px', border: '1px solid #E2E8F0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', padding: '10px 16px', borderRadius: '12px', flex: 1, minWidth: '240px' }}>
            <Search size={18} color="#64748B" />
            <input
              type="text"
              placeholder="Search by ID, Name or Subject..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: '#0F172A' }}
            />
          </div>

          <select value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', background: '#FFFFFF', fontSize: '13.5px', outline: 'none', fontWeight: '600' }}>
            <option value="ALL">All Subjects</option>
            {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={riskFilter} onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', background: '#FFFFFF', fontSize: '13.5px', outline: 'none', fontWeight: '600' }}>
            <option value="ALL">All Risk Status</option>
            <option value="RISK">⚠️ At-Risk Only</option>
            <option value="SAFE">✅ Safe Only</option>
          </select>
        
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={openAddModal} style={{ background: '#2563EB', color: '#FFF', border: 'none', padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13.5px', cursor: 'pointer' }}>
              <Plus size={18} /> Add Record
            </button>
            <button onClick={handleExportCSV} style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13.5px', cursor: 'pointer' }}>
              <Download size={18} /> Export CSV
            </button>
          </div>
        </div>

        {/* Student Marks Table */}
        <div style={{ overflowX: 'auto', borderRadius: '20px', border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
          <table style={{ minWidth: '1000px', width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#475569', fontWeight: '800', textTransform: 'uppercase', fontSize: '11.5px' }}>
                <th style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => handleSort('is_at_risk')}>Risk Status <ArrowUpDown size={13} /></th>
                <th style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => handleSort('student_id')}>Student ID <ArrowUpDown size={13} /></th>
                <th style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => handleSort('student_name')}>Student Info <ArrowUpDown size={13} /></th>
                <th style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => handleSort('subject')}>Subject <ArrowUpDown size={13} /></th>
                <th style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => handleSort('marks_obtained')}>Marks <ArrowUpDown size={13} /></th>
                <th style={{ padding: '16px 20px' }}>Grade</th>
                <th style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => handleSort('attendance_rate')}>Attendance <ArrowUpDown size={13} /></th>
                <th style={{ padding: '16px 20px' }}>Teacher Remark</th>
                <th style={{ padding: '16px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? (
                currentRecords.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #F1F5F9', background: item.is_at_risk ? '#FEF2F2' : 'transparent' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: item.is_at_risk ? '#FEE2E2' : '#D1FAE5', color: item.is_at_risk ? '#991B1B' : '#065F46', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>
                        {item.is_at_risk ? "AT RISK" : "NORMAL"}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}><span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#2563EB', background: '#EFF6FF', padding: '4px 10px', borderRadius: '8px', fontSize: '12px' }}>{item.student_id || "STU-N/A"}</span></td>
                    <td style={{ padding: '14px 20px' }}><div style={{ fontWeight: '700', color: '#0F172A' }}>{item.student_name}</div><div style={{ fontSize: '12px', color: '#64748B' }}>{item.student_email}</div></td>
                    <td style={{ padding: '14px 20px' }}><span style={{ fontWeight: '600', color: '#334155' }}>{item.subject}</span></td>
                    <td style={{ padding: '14px 20px' }}><strong style={{ color: item.marks_obtained >= 75 ? '#10B981' : item.marks_obtained < 50 ? '#EF4444' : '#F59E0B', fontSize: '14px' }}>{item.marks_obtained}/{item.max_marks || 100}</strong></td>
                    <td style={{ padding: '14px 20px' }}><span style={{ padding: '4px 10px', borderRadius: '8px', fontWeight: '800', fontSize: '12px', background: '#F1F5F9', color: '#1E293B' }}>{item.grade}</span></td>
                    <td style={{ padding: '14px 20px', fontWeight: '600', color: '#334155' }}>{item.attendance_rate}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <button onClick={() => handleSaveRemark(item._id, item.teacher_remark)} style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: '#334155' }}>
                        <MessageSquare size={14} color="#2563EB" /> {item.teacher_remark ? item.teacher_remark : "Add Remark"}
                      </button>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openEditModal(item)} style={{ background: '#EFF6FF', border: 'none', cursor: 'pointer', color: '#2563EB', padding: '6px', borderRadius: '8px' }}><Edit size={16} /></button>
                        <button onClick={() => handleDelete(item._id)} style={{ background: '#FEF2F2', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '6px', borderRadius: '8px' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ maxWidth: '320px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <Inbox size={32} color="#94A3B8" />
                      <h4 style={{ margin: 0, color: '#0F172A', fontSize: '16px', fontWeight: '700' }}>No Student Records Found</h4>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', background: '#FFFFFF', padding: '14px 24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
            <span>Show</span>
            <select value={recordsPerPage} onChange={(e) => { setRecordsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: '600' }}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>records per page</span>
          </div>

          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
            Showing {sortedRecords.length > 0 ? indexOfFirstRecord + 1 : 0} to {Math.min(indexOfLastRecord, sortedRecords.length)} of {sortedRecords.length} records
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', background: currentPage === 1 ? '#F1F5F9' : '#FFF', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}><ChevronLeft size={16} /></button>
            <span style={{ fontSize: '13.5px', fontWeight: '700', padding: '0 10px', color: '#0F172A' }}>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', background: currentPage === totalPages ? '#F1F5F9' : '#FFF', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}><ChevronRight size={16} /></button>
          </div>
        </div>

      </div>

      {/* Edit/Add Record Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '30px', width: '90%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '19px', fontWeight: '800' }}>{editItem ? "Edit Student Record" : "Add New Student Record"}</h3>
              <X size={22} cursor="pointer" onClick={() => setIsModalOpen(false)} color="#64748B" />
            </div>

            <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Student ID</label>
                  <input type="text" required placeholder="e.g. STU1001" value={formData.student_id || ""} onChange={e => setFormData({...formData, student_id: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '13.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Student Name</label>
                  <input type="text" required placeholder="Kasun Perera" value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '13.5px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Student Email</label>
                <input type="email" required value={formData.student_email} onChange={e => setFormData({...formData, student_email: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '13.5px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Subject</label>
                  <input type="text" required placeholder="Mathematics" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '13.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Marks (0-100)</label>
                  <input type="number" required value={formData.marks_obtained} onChange={e => setFormData({...formData, marks_obtained: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '13.5px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Grade</label>
                  <input type="text" placeholder="A" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '13.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Attendance (%)</label>
                  <input type="text" placeholder="85%" value={formData.attendance_rate} onChange={e => setFormData({...formData, attendance_rate: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '13.5px' }} />
                </div>
              </div>

              <button type="submit" style={{ marginTop: '10px', background: '#2563EB', color: '#FFFFFF', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: '700', fontSize: '14.5px', cursor: 'pointer' }}>
                {editItem ? "Update Changes" : "Save Record"}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer1 />
    </div>
  );
}