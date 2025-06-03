import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Clock, CheckCircle, Target, AlertTriangle } from 'lucide-react';
import _ from 'lodash';

// Type definition based on your actual data structure
interface VoicebotDataItem {
  data: number[];
  feedback: {
    group: string;
    count: number;
  }[];
}

interface VoicebotData {
  timestamp?: string;
  file_name?: string;
  [key: string]: any;
  items: VoicebotDataItem[];
}

interface DashboardProps {
  allData: VoicebotData[];
}

const VoicebotDashboard: React.FC<DashboardProps> = ({ allData = [] }) => {
  const [selectedFeedbackGroup, setSelectedFeedbackGroup] = useState<string>('all');

  // Calculate aggregated metrics from the actual data structure
  const aggregatedData = useMemo(() => {
    if (!allData.length) return [];
    
    return allData.map((dataSet, index) => {
      // Calculate metrics from data array
      const allDataPoints = dataSet.items.flatMap(item => item.data);
      const totalDataPoints = allDataPoints.length;
      const averageValue = _.mean(allDataPoints) || 0;
      
      // Calculate feedback metrics
      const totalFeedback = _.sumBy(dataSet.items.flatMap(item => item.feedback), 'count');
      const uniqueIssues = _.uniqBy(dataSet.items.flatMap(item => item.feedback), 'group').length;
      
      // Generate timestamp if not provided
      const timestamp = dataSet.timestamp || `Dataset ${index + 1}`;
      
      return {
        timestamp,
        averageValue: Math.round(averageValue * 100) / 100,
        totalDataPoints,
        totalFeedback,
        uniqueIssues,
        dataConsistency: allDataPoints.every(val => val === allDataPoints[0]) ? 100 : 
                        (1 - (_.max(allDataPoints) - _.min(allDataPoints)) / _.max(allDataPoints)) * 100
      };
    });
  }, [allData]);

  // Calculate latest KPIs
  const latestKPIs = useMemo(() => {
    if (!aggregatedData.length) return null;
    
    const latest = aggregatedData[aggregatedData.length - 1];
    const previous = aggregatedData.length > 1 ? aggregatedData[aggregatedData.length - 2] : null;
    
    return {
      averageValue: {
        value: latest.averageValue,
        trend: previous ? latest.averageValue - previous.averageValue : 0
      },
      dataConsistency: {
        value: latest.dataConsistency,
        trend: previous ? latest.dataConsistency - previous.dataConsistency : 0
      },
      totalFeedback: {
        value: latest.totalFeedback,
        trend: previous ? latest.totalFeedback - previous.totalFeedback : 0
      },
      uniqueIssues: {
        value: latest.uniqueIssues,
        trend: previous ? latest.uniqueIssues - previous.uniqueIssues : 0
      }
    };
  }, [aggregatedData]);

  // Aggregate all feedback data
  const feedbackAnalysis = useMemo(() => {
    if (!allData.length) return [];
    
    const allFeedback = allData.flatMap(dataSet => 
      dataSet.items.flatMap(item => item.feedback)
    );
    
    const groupedFeedback = _.groupBy(allFeedback, 'group');
    
    return Object.entries(groupedFeedback).map(([group, items]) => ({
      group,
      totalCount: _.sumBy(items, 'count'),
      occurrences: items.length,
      averageCount: Math.round(_.meanBy(items, 'count') * 100) / 100
    })).sort((a, b) => b.totalCount - a.totalCount);
  }, [allData]);

  // Data distribution analysis
  const dataDistribution = useMemo(() => {
    if (!allData.length) return [];
    
    return allData.map((dataSet, index) => {
      const allDataPoints = dataSet.items.flatMap(item => item.data);
      const valueFrequency = _.countBy(allDataPoints);
      
      return {
        dataset: `Dataset ${index + 1}`,
        distribution: Object.entries(valueFrequency).map(([value, count]) => ({
          value: parseInt(value),
          count
        })).sort((a, b) => a.value - b.value)
      };
    });
  }, [allData]);

  // Filter feedback based on selection
  const filteredFeedback = useMemo(() => {
    let filtered = feedbackAnalysis;
    
    if (selectedFeedbackGroup !== 'all') {
      filtered = filtered.filter(item => item.group === selectedFeedbackGroup);
    }
    
    return filtered;
  }, [feedbackAnalysis, selectedFeedbackGroup]);

  // Get unique feedback groups for filter
  const feedbackGroupOptions = useMemo(() => {
    return _.uniq(feedbackAnalysis.map(item => item.group)).sort();
  }, [feedbackAnalysis]);

  // Colors for pie chart
  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  const formatTrend = (value: number, isReverse = false) => {
    const isPositive = isReverse ? value < 0 : value > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center ${color} text-sm`}>
        <Icon className="w-4 h-4 mr-1" />
        {Math.abs(value).toFixed(2)}
      </div>
    );
  };

  if (!allData.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="text-lg font-medium">ไม่มีข้อมูลให้แสดงผล</div>
        <div className="text-sm mt-2">กรุณาโหลดข้อมูลก่อนใช้งาน Dashboard</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Voicebot Analytics Dashboard</h1>
        <p className="text-gray-600">การวิเคราะห์ข้อมูลและ Feedback ของระบบ Voicebot</p>
      </div>

      {/* Section 1: Data Overview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-500 pb-2">
          📊 ส่วนที่ 1: มุมมองภาพรวมข้อมูล (Data Overview)
        </h2>
        
        {/* KPI Cards */}
        {latestKPIs && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Data Value</p>
                  <p className="text-2xl font-bold text-gray-900">{latestKPIs.averageValue.value}</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-2">
                {formatTrend(latestKPIs.averageValue.trend)}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Consistency</p>
                  <p className="text-2xl font-bold text-gray-900">{latestKPIs.dataConsistency.value.toFixed(1)}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-2">
                {formatTrend(latestKPIs.dataConsistency.trend)}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{latestKPIs.totalFeedback.value}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div className="mt-2">
                {formatTrend(latestKPIs.totalFeedback.trend, true)}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Issue Types</p>
                  <p className="text-2xl font-bold text-gray-900">{latestKPIs.uniqueIssues.value}</p>
                </div>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  T
                </div>
              </div>
              <div className="mt-2">
                {formatTrend(latestKPIs.uniqueIssues.trend, true)}
              </div>
            </div>
          </div>
        )}

        {/* Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Value & Consistency Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={aggregatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="averageValue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Average Value"
                />
                <Line 
                  type="monotone" 
                  dataKey="dataConsistency" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Data Consistency (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Issues Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={aggregatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="totalFeedback" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Total Issues"
                />
                <Line 
                  type="monotone" 
                  dataKey="uniqueIssues" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Unique Issue Types"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Section 2: Feedback Analysis */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-red-500 pb-2">
          🔍 ส่วนที่ 2: การวิเคราะห์ Feedback และปัญหา (Feedback Analysis)
        </h2>

        {/* Feedback Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Issues by Category</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={feedbackAnalysis.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="group" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'totalCount' ? 'Total Issues' : name]}
                />
                <Bar dataKey="totalCount" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Issue Distribution</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={feedbackAnalysis.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ group, percent }) => `${group.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="totalCount"
                >
                  {feedbackAnalysis.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Total Issues']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Feedback Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Issue Analysis</h3>
          
          {/* Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Issue Group</label>
            <select 
              value={selectedFeedbackGroup}
              onChange={(e) => setSelectedFeedbackGroup(e.target.value)}
              className="w-full max-w-md p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Issue Groups</option>
              {feedbackGroupOptions.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Feedback Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Issue Group</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Count</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Occurrences</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Average Count</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Severity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFeedback.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-md">
                      <div className="truncate" title={item.group}>
                        {item.group}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">{item.totalCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.occurrences}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.averageCount}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.totalCount >= 20 
                          ? 'bg-red-100 text-red-800' 
                          : item.totalCount >= 10 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.totalCount >= 20 ? 'High' : item.totalCount >= 10 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Distribution Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Distribution Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dataDistribution.map((dataset, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">{dataset.dataset}</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dataset.distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="value" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Example usage with actual data format
const mockData: VoicebotData[] = [
  {
    timestamp: "2024-01-01T10:00:00Z",
    file_name: "test_data_1.json",
    items: [
      {
        data: [15],
        feedback: [
          {
            group: "กลุ่มปัญหาการรู้จำเสียงพูด (ASR)",
            count: 11
          },
          {
            group: "กลุ่มปัญหาเกี่ยวกับการเข้าใจวัน เวลา หรือบอทตอบเรื่องเวลา/วัน",
            count: 11
          },
          {
            group: "กลุ่มปัญหาอื่นๆ",
            count: 11
          }
        ]
      },
      {
        data: [15],
        feedback: [
          {
            group: "กลุ่มปัญหาการรู้จำเสียงพูด (ASR)",
            count: 8
          },
          {
            group: "กลุ่มปัญหาเกี่ยวกับการเข้าใจวัน เวลา หรือบอทตอบเรื่องเวลา/วัน",
            count: 5
          }
        ]
      }
    ]
  },
  {
    timestamp: "2024-01-02T10:00:00Z",
    file_name: "test_data_2.json",
    items: [
      {
        data: [14],
        feedback: [
          {
            group: "กลุ่มปัญหาการรู้จำเสียงพูด (ASR)",
            count: 9
          },
          {
            group: "กลุ่มปัญหาอื่นๆ",
            count: 7
          }
        ]
      }
    ]
  }
];

export default function App() {
  const [allData] = useState<VoicebotData[]>(mockData);
  
  return <VoicebotDashboard allData={allData} />;
}