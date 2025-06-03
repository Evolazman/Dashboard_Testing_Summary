// อย่าลืมติดตั้ง Recharts: npm install recharts
"use client"
import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// ========================================================================
// TYPE DEFINITIONS (อิงตามโครงสร้างล่าสุด)
// ========================================================================
interface PerformanceMetrics {
  successRate: number;
  errorRate: number;
  responseTime: number;
  accuracy: number;
}
interface AnalysisResults {
  totalRecords: number;
  processedRecords: number;
  errorRecords: number;
  summary: string;
}
interface CountDataPerformance {
    count_hang_up?: number;
    // ... อื่นๆ
}
interface VoiceBotReportData {
  fileName: string;
  timestamp: string;
  performanceMetrics: PerformanceMetrics;
  analysisResults: AnalysisResults;
  countDataPerfermance?: CountDataPerformance;
  // ... อื่นๆ
}
interface VoiceBotReportWrapper {
  Alldata: VoiceBotReportData;
}
interface DashboardProps {
  reports: VoiceBotReportWrapper[] | null;
}

// ========================================================================
// MAIN DASHBOARD COMPONENT
// ========================================================================
const PerformanceTrendDashboard: React.FC<DashboardProps> = ({ reports }) => {
  // 1. จัดการข้อมูลนำเข้าและเรียงตามวันที่
//   const sortedReports = useMemo(() => {
//     let reportArray: VoiceBotReportWrapper[] = [];
//     if (Array.isArray(reports)) {
//       reportArray = reports;
//     } else if (reports && typeof reports === 'object' && !Array.isArray(reports)) {
//       reportArray = Object.values(reports);
//     }
//     // เรียงข้อมูลจากเก่าไปใหม่
//     return reportArray.sort((a, b) => new Date(a.Alldata.timestamp).getTime() - new Date(b.Alldata.timestamp).getTime());
//   }, [reports]);

  // 2. คำนวณค่าสำหรับแสดงบนการ์ดสรุป (KPI Cards)
  const summaryData = useMemo(() => {
    if (sortedReports.length === 0) return null;

    const latestReport = sortedReports[sortedReports.length - 1].Alldata;
    const previousReport = sortedReports.length > 1 ? sortedReports[sortedReports.length - 2].Alldata : null;

    const calcTrend = (latestVal: number, prevVal: number | null | undefined) => {
      if (prevVal === null || prevVal === undefined || latestVal === prevVal) return 'stable';
      return latestVal > prevVal ? 'up' : 'down';
    };

    const totalProcessed = sortedReports.reduce((sum, report) => sum + report.Alldata.analysisResults.processedRecords, 0);
    const totalResponseTime = sortedReports.reduce((sum, report) => sum + report.Alldata.performanceMetrics.responseTime, 0);

    return {
      latestSuccessRate: latestReport.performanceMetrics.successRate,
      successRateTrend: calcTrend(latestReport.performanceMetrics.successRate, previousReport?.performanceMetrics.successRate),
      latestAccuracy: latestReport.performanceMetrics.accuracy,
      accuracyTrend: calcTrend(latestReport.performanceMetrics.accuracy, previousReport?.performanceMetrics.accuracy),
      avgResponseTime: totalResponseTime / sortedReports.length,
      totalProcessedRecords: totalProcessed,
    };
  }, [sortedReports]);

  // 3. เตรียมข้อมูลสำหรับพล็อตกราฟทั้งหมด
  const chartData = useMemo(() => {
    return sortedReports.map(report => {
      const data = report.Alldata;
      return {
        // จัดรูปแบบวันที่สำหรับแกน X
        date: new Date(data.timestamp).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' }),
        fileName: data.fileName.replace('samitivej_agent data - ', ''),
        successRate: data.performanceMetrics.successRate,
        accuracy: data.performanceMetrics.accuracy,
        responseTime: data.performanceMetrics.responseTime,
        errorRate: data.performanceMetrics.errorRate,
        hangUps: data.countDataPerfermance?.count_hang_up ?? 0,
      };
    });
  }, [sortedReports]);

  if (!summaryData) {
    return <div className="dashboard-card">No data available to display trends.</div>;
  }

  const TrendIndicator = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <span className="trend-up">▲</span>;
    if (trend === 'down') return <span className="trend-down">▼</span>;
    return null;
  };

  return (
    <>
      {/* ส่วนที่ 1: ภาพรวมสรุป (Overall Summary) */}
      <div className="dashboard-card">
        <h2 className="card-title">ภาพรวมสรุป</h2>
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-value">
              {summaryData.latestSuccessRate.toFixed(2)}%
              {/* <TrendIndicator trend={summaryData.successRateTrend} /> */}
            </div>
            {/* <div className="kpi-label">Success Rate (ล่าสุด)</div> */}
          </div>
          <div className="kpi-card">
            <div className="kpi-value">
              {summaryData.latestAccuracy.toFixed(2)}%
              {/* <TrendIndicator trend={summaryData.accuracyTrend} /> */}
            </div>
            <div className="kpi-label">Accuracy (ล่าสุด)</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{summaryData.avgResponseTime.toFixed(2)}s</div>
            <div className="kpi-label">Avg. Response Time</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{summaryData.totalProcessedRecords}</div>
            <div className="kpi-label">Total Processed Records</div>
          </div>
        </div>
      </div>

      {/* ส่วนที่ 2: กราฟแสดงแนวโน้มประสิทธิภาพหลัก */}
      <div className="dashboard-card">
        <h2 className="card-title">กราฟแสดงแนวโน้มประสิทธิภาพหลัก</h2>
        <div className="chart-container">
          <p className="chart-subtitle">Success Rate & Accuracy Over Time</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis unit="%" domain={[0, 100]}/>
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="successRate" stroke="#82ca9d" name="Success Rate" />
              <Line type="monotone" dataKey="accuracy" stroke="#8884d8" name="Accuracy" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <p className="chart-subtitle">Response Time Over Time</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis unit="s"/>
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="responseTime" stroke="#ffc658" name="Response Time (s)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <p className="chart-subtitle">Error & Hang-up Analysis</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#ff8042" unit="%"/>
              <YAxis yAxisId="right" orientation="right" stroke="#00C49F" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="errorRate" fill="#ff8042" name="Error Rate (%)" />
              <Bar yAxisId="right" dataKey="hangUps" fill="#00C49F" name="Hang-ups (count)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        .dashboard-card { background-color: #fff; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
        .card-title { font-size: 1.25rem; font-weight: 600; margin-top: 0; margin-bottom: 20px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; }
        .kpi-card { text-align: center; }
        .kpi-value { font-size: 2rem; font-weight: 700; color: #1a237e; }
        .kpi-label { font-size: 0.9rem; color: #5f6368; margin-top: 4px; }
        .trend-up { color: #28a745; margin-left: 8px; }
        .trend-down { color: #dc3545; margin-left: 8px; }
        .chart-container { margin-top: 30px; }
        .chart-subtitle { font-weight: 500; margin-bottom: 10px; color: #333; }
      `}</style>
    </>
  );
};

export default PerformanceTrendDashboard;