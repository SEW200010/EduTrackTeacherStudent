import React, { useState, useEffect, useRef } from "react";
import Header1 from "../../components/Header1";
import Footer1 from "../../components/Footer1";
import API from "../../api";
import html2pdf from "html2pdf.js";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";
import { 
  Megaphone, Search, Filter, RefreshCw, 
  Sparkles, Download, Target, Clock
} from "lucide-react";

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F1F5F9', fontFamily: "'Inter', sans-serif" }}>

      <Header1 
        title="Student Portal" 
        subtitle={`Welcome back, ${user?.name || "Student"} | ID: ${user?.user_id || "N/A"}`} 
      />

      <div style={{ flex: 1, maxWidth: '1320px', width: '100%', margin: '0 auto', padding: '90px 24px 60px 24px' }}>
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)',
          borderRadius: '24px',
          padding: '32px 36px',
          color: '#FFFFFF',
          marginBottom: '32px',
          boxShadow: '0 12px 30px -10px rgba(37, 99, 235, 0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '30px', fontSize: '16px', fontWeight: '600', backdropFilter: 'blur(10px)', marginBottom: '14px' }}>
              <Sparkles size={20} color="#FDE047" /> Student Performance Center
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0' }}>
              Hello, {user?.name || "Student"} 👋
            </h1>
          </div>

          <div>
            <button 
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              style={{
                background: downloadingPdf ? '#94A3B8' : '#DC2626',
                border: 'none',
                color: '#FFFFFF',
                padding: '12px 22px',
                borderRadius: '14px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: downloadingPdf ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
              }}
            >
              {downloadingPdf ? (
                <>
                  <RefreshCw className="animate-spin" size={18} /> Generating PDF...
                </>
              ) : (
                <>
                  <Download size={18} /> Download Report PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Announcements & Target GPA */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          
          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '26px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ background: '#EFF6FF', padding: '10px', borderRadius: '12px' }}>
                <Megaphone size={22} color="#2563EB" />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '20px', fontWeight: '800' }}>
                  Class Announcements ({announcements.length})
                </h3>
                <p style={{ margin: 0, color: '#64748B', fontSize: '13px' }}>Important updates posted by teachers</p>
              </div>
            </div>

            {announcements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '250px', overflowY: 'auto' }}>
                {announcements.map((item) => (
                  <div key={item._id} style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ color: '#0F172A', fontSize: '14.5px' }}>{item.title}</strong>
                      <span style={{ fontSize: '11px', background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: '8px', fontWeight: '800' }}>
                        {item.subject}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '13px', lineHeight: 1.4 }}>{item.message}</p>
                    
                    {item.event_date && (
                      <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', padding: '6px 12px', borderRadius: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#92400E', fontWeight: '700' }}>
                        <Clock size={14} color="#D97706" />
                        <span>Schedule: <strong>{item.event_date}</strong></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>No announcements posted yet.</p>
            )}
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '26px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target size={22} color="#8B5CF6" /> Target GPA Calculator
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <label style={{ fontSize: '16px', fontWeight: '700', color: '#334155' }}>Target GPA:</label>
                <input 
                  type="number" step="0.1" max="4.0" min="0.0"
                  value={targetGPA} 
                  onChange={(e) => setTargetGPA(e.target.value)}
                  style={{ width: '90px', padding: '8px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', outline: 'none', fontWeight: '800', fontSize: '18px', color: '#8B5CF6' }}
                />
              </div>
            </div>
            <div style={{ background: '#F3E8FF', padding: '16px', borderRadius: '14px', border: '1px solid #DDD6FE' }}>
              <p style={{ margin: 0, fontSize: '15px', color: '#5B21B6', fontWeight: '600' }}>
                💡 To achieve <strong>{targetGPA} GPA</strong>, you need an estimated average score of <strong>{neededMarks}%</strong>.
              </p>
            </div>
          </div>

        </div>

        {/* Chart */}
        {marks.length > 0 && (
          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '30px', border: '1px solid #E2E8F0', marginBottom: '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '600', color: '#0F172A', margin: '0 0 20px 0' }}>Performance Comparison</h3>
            <div style={{ width: '100%', height: 350, background: '#F8FAFC', borderRadius: '16px', padding: '16px 16px 10px 0' }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }} barGap={8}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="subject" stroke="#475569" fontSize={14} fontWeight="700" tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#475569" fontSize={14} fontWeight="700" tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF', border: 'none' }} />
                  <Bar dataKey="MyMarks" fill="#2563EB" name="My Marks" radius={[6, 6, 0, 0]} barSize={28} />
                  <Bar dataKey="ClassAvg" fill="#94A3B8" name="Class Average" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Table Report */}
        <div ref={reportRef} style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ color: '#0F172A', fontWeight: '800', fontSize: '22px', margin: '0 0 4px 0' }}>Academic Performance Records</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Student: {user?.name || "N/A"} | ID: {user?.user_id || "N/A"}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '0 14px' }}>
                <Search size={18} color="#64748B" />
                <input 
                  type="text" placeholder="Search subject..." 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 'none', background: 'transparent', padding: '12px 10px', outline: 'none', fontSize: '15px', width: '150px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '0 14px' }}>
                <Filter size={18} color="#64748B" />
                <select 
                  value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}
                  style={{ border: 'none', background: 'transparent', padding: '12px 10px', outline: 'none', fontSize: '15px', cursor: 'pointer' }}
                >
                  <option value="ALL">All Grades</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                  <option value="F">Grade F</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid #F1F5F9' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '16px 18px', color: '#334155', fontSize: '14px', fontWeight: '800' }}>SUBJECT</th>
                  <th style={{ padding: '16px 18px', color: '#334155', fontSize: '14px', fontWeight: '800' }}>EXAM TYPE</th>
                  <th style={{ padding: '16px 18px', color: '#334155', fontSize: '14px', fontWeight: '800' }}>MARKS</th>
                  <th style={{ padding: '16px 18px', color: '#334155', fontSize: '14px', fontWeight: '800' }}>GRADE</th>
                  <th style={{ padding: '16px 18px', color: '#334155', fontSize: '14px', fontWeight: '800' }}>ATTENDANCE</th>
                  <th style={{ padding: '16px 18px', color: '#334155', fontSize: '14px', fontWeight: '800' }}>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarks.length > 0 ? (
                  filteredMarks.map((item, index) => (
                    <tr key={item._id || index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px 18px', fontWeight: '800', color: '#0F172A', fontSize: '15px' }}>{item.subject}</td>
                      <td style={{ padding: '16px 18px', color: '#64748B', fontSize: '14px' }}>{item.exam_type || "Mid-Term"}</td>
                      <td style={{ padding: '16px 18px', fontWeight: '800', fontSize: '15px' }}>{item.marks_obtained}/{item.max_marks || 100}</td>
                      <td style={{ padding: '16px 18px' }}>
                        <span style={{ padding: '5px 12px', borderRadius: '20px', fontWeight: '800', fontSize: '13px', background: item.grade === 'A' ? '#D1FAE5' : '#FEF3C7', color: item.grade === 'A' ? '#065F46' : '#92400E' }}>
                          Grade {item.grade}
                        </span>
                      </td>
                      <td style={{ padding: '16px 18px', fontWeight: '600', fontSize: '14px' }}>{item.attendance_rate}</td>
                      <td style={{ padding: '16px 18px', fontSize: '14px', color: '#0284C7', fontWeight: '600' }}>{item.teacher_remark || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8', fontSize: '15px' }}>
                      No records match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <Footer1 />
    </div>
  );
}