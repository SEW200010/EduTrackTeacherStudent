import React, { useState, useEffect } from "react";
import API from "../api/axios";
import Header1 from "../../components/Header1";
import Footer1 from "../../components/Footer1";
import API from "../../api";
import { 
  Megaphone, Clock, Award, BookOpen, 
  CheckCircle, AlertCircle, DollarSign, User
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F1F5F9', fontFamily: "'Inter', sans-serif" }}>
      
      <Header1 
        title="Parent Portal" 
        subtitle={`Viewing Academic Progress for: ${childDetails?.student_name || "Child"} (ID: ${childDetails?.student_id || "N/A"})`} 
      />

      <div style={{ flex: 1, maxWidth: '1320px', width: '100%', margin: '0 auto', padding: '90px 24px 60px 24px' }}>
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '24px',
          padding: '28px 36px',
          color: '#FFFFFF',
          marginBottom: '32px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '30px', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
              <User size={16} color="#38BDF8" /> Parent Dashboard
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 6px 0' }}>
              Welcome, {user?.name || "Parent"} 👋
            </h1>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '14px' }}>
              Track your child's academic performance, class attendance, and school announcements.
            </p>
          </div>

          {/* Quick Summary Cards */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '14px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8', display: 'block', fontWeight: '700' }}>OVERALL AVG</span>
              <strong style={{ fontSize: '22px', color: '#38BDF8' }}>{avgMarks}%</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '14px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8', display: 'block', fontWeight: '700' }}>TERM FEE</span>
              <strong style={{ fontSize: '18px', color: childDetails?.fee_info?.term_fee_status === 'Paid' ? '#4ADE80' : '#F87171' }}>
                {childDetails?.fee_info?.term_fee_status || "Paid"}
              </strong>
            </div>
          </div>
        </div>

        {/* 🌟🌟🌟 TWO CARDS SIDE BY SIDE (LEFT & RIGHT) 🌟🌟🌟 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          
          {/* LEFT CARD: Class Announcements & Quiz Schedules */}
          <div style={{ 
            background: '#FFFFFF', 
            borderRadius: '24px', 
            padding: '26px', 
            border: '1px solid #E2E8F0', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ background: '#EFF6FF', padding: '10px', borderRadius: '12px' }}>
                  <Megaphone size={22} color="#2563EB" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#0F172A', fontSize: '20px', fontWeight: '800' }}>
                    School & Class Notices ({announcements.length})
                  </h3>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '13px' }}>
                    Important updates posted by teachers
                  </p>
                </div>
              </div>

              {announcements.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '260px', overflowY: 'auto' }}>
                  {announcements.map((item) => (
                    <div key={item._id} style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <strong style={{ color: '#0F172A', fontSize: '14.5px' }}>{item.title}</strong>
                        <span style={{ fontSize: '11px', background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: '8px', fontWeight: '800' }}>
                          {item.subject}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 10px 0', color: '#475569', fontSize: '13px', lineHeight: 1.4 }}>{item.message}</p>
                      
                      {/* Quiz Date & Time Highlight */}
                      {item.event_date && (
                        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', padding: '6px 12px', borderRadius: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#92400E', fontWeight: '700' }}>
                          <Clock size={14} color="#D97706" />
                          <span>Quiz Date: <strong>{item.event_date}</strong> {item.event_time ? `at ${item.event_time}` : ''}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>By: {item.posted_by || "Teacher"}</span>
                        <span style={{ fontSize: '11px', color: '#0284C7', fontWeight: '700' }}>Posted: {item.date_posted}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>No announcements posted yet.</p>
              )}
            </div>
          </div>

          {/* RIGHT CARD: Fee Details & Status */}
          <div style={{ 
            background: '#FFFFFF', 
            borderRadius: '24px', 
            padding: '26px', 
            border: '1px solid #E2E8F0', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ background: '#ECFDF5', padding: '10px', borderRadius: '12px' }}>
                  <DollarSign size={22} color="#10B981" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#0F172A', fontSize: '20px', fontWeight: '800' }}>
                    Term Fee & Payment Status
                  </h3>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '13px' }}>
                    Billing and term fee statements
                  </p>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>Payment Status:</span>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontWeight: '800', 
                    fontSize: '12.5px',
                    background: childDetails?.fee_info?.term_fee_status === 'Paid' ? '#D1FAE5' : '#FEE2E2',
                    color: childDetails?.fee_info?.term_fee_status === 'Paid' ? '#065F46' : '#991B1B'
                  }}>
                    {childDetails?.fee_info?.term_fee_status || "Paid"}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>Due Date:</span>
                  <strong style={{ fontSize: '14px', color: '#1E293B' }}>{childDetails?.fee_info?.due_date || "N/A"}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>Amount Due:</span>
                  <strong style={{ fontSize: '16px', color: '#2563EB' }}>{childDetails?.fee_info?.amount_due || "LKR 0.00"}</strong>
                </div>
              </div>
            </div>

            <div style={{ background: '#EFF6FF', padding: '14px 16px', borderRadius: '14px', border: '1px solid #BFDBFE' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#1E40AF', fontWeight: '600', lineHeight: '1.4' }}>
                💡 For fee clearance receipts or installment inquiries, please contact the school administration office.
              </p>
            </div>
          </div>

        </div>

        {/* Performance Comparison Chart */}
        {marksList.length > 0 && (
          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '30px', border: '1px solid #E2E8F0', marginBottom: '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                  Academic Comparison (Student vs Class Average)
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563EB' }}></span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>Child's Marks</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#94A3B8' }}></span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>Class Avg</span>
                </div>
              </div>
            </div>

            <div style={{ width: '100%', height: 320, background: '#F8FAFC', borderRadius: '16px', padding: '16px 16px 10px 0' }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }} barGap={8}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="subject" stroke="#475569" fontSize={14} fontWeight="700" tickLine={false} dy={8} />
                  <YAxis domain={[0, 100]} stroke="#475569" fontSize={14} fontWeight="700" tickLine={false} dx={-5} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF', border: 'none', padding: '10px 14px' }}
                    itemStyle={{ color: '#F8FAFC', fontWeight: '600' }}
                  />
                  <Bar dataKey="StudentMarks" fill="#2563EB" name="Child's Marks" radius={[6, 6, 0, 0]} barSize={26} />
                  <Bar dataKey="ClassAvg" fill="#94A3B8" name="Class Average" radius={[6, 6, 0, 0]} barSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Academic Marks & Teacher Remarks Table */}
        <div style={{ background: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ color: '#0F172A', fontWeight: '800', fontSize: '20px', margin: '0 0 18px 0' }}>
            Detailed Subject Marks & Teacher Remarks
          </h3>

          <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid #F1F5F9' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '14px 16px', color: '#334155', fontSize: '13.5px', fontWeight: '800', textTransform: 'uppercase' }}>Subject</th>
                  <th style={{ padding: '14px 16px', color: '#334155', fontSize: '13.5px', fontWeight: '800', textTransform: 'uppercase' }}>Exam Type</th>
                  <th style={{ padding: '14px 16px', color: '#334155', fontSize: '13.5px', fontWeight: '800', textTransform: 'uppercase' }}>Marks</th>
                  <th style={{ padding: '14px 16px', color: '#334155', fontSize: '13.5px', fontWeight: '800', textTransform: 'uppercase' }}>Grade</th>
                  <th style={{ padding: '14px 16px', color: '#334155', fontSize: '13.5px', fontWeight: '800', textTransform: 'uppercase' }}>Attendance</th>
                  <th style={{ padding: '14px 16px', color: '#334155', fontSize: '13.5px', fontWeight: '800', textTransform: 'uppercase' }}>Teacher Remark</th>
                </tr>
              </thead>
              <tbody>
                {marksList.length > 0 ? (
                  marksList.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px', fontWeight: '800', color: '#0F172A', fontSize: '14.5px' }}>{item.subject}</td>
                      <td style={{ padding: '16px', color: '#64748B', fontSize: '14px', fontWeight: '500' }}>{item.exam_type || "Mid-Term"}</td>
                      <td style={{ padding: '16px', fontWeight: '800', fontSize: '14.5px' }}>{item.marks_obtained}/{item.max_marks || 100}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '16px', fontWeight: '800', fontSize: '12.5px', background: item.grade === 'A' ? '#D1FAE5' : '#FEF3C7', color: item.grade === 'A' ? '#065F46' : '#92400E' }}>
                          Grade {item.grade}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontWeight: '600', fontSize: '14px', color: '#1E293B' }}>{item.attendance_rate}</td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#0284C7', fontWeight: '600' }}>{item.teacher_remark || "No remark yet"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8', fontSize: '14px' }}>
                      No academic records found for this student.
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