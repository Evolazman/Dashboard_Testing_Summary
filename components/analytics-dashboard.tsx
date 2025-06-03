"use client"
import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown , FileDown} from 'lucide-react';

import type { DateRange } from "react-day-picker"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue , SelectGroup } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { components, MultiValue } from "react-select";
import { DatabaseService } from "@/lib/database"
import CheckboxSelect from "@/components/ui/checkboxSelect"
import { LineChart } from '@mui/x-charts/LineChart';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@mui/material";
// Filter context for sharing filters across components
export interface DashboardFilters {
  dateRange?: DateRange
  selectedTester: string
  selectedPlatform: string
  selectedIssue: string
}
interface getAgentsByProjectIdResponse {
  id?: string
  file_name?: string
  project_name?: string
}

interface Project {
  id: string
  name: string
  id_agent : string
}

interface Agent {
  id: string
  name: string
}
interface getFileVoiceByIdResponse {
  // Basic info
  file_name: string
  project_name: string
  agent_name: string
  timestamp: string

  // Performance metrics (similar to dashboard)
  
  count_hang_up? : number,
  success_hang_up? : number,
  count_spelling_name? : number,
  success_spelling_name? : number,
  count_result? : number,
  success_result? : number,

  success_rate?: number
  error_rate?: number
  response_time?: number
  accuracy?: number
  



  // Analysis results
    total_records?: number
    processed_records?: number
    error_records?: number
    summary?: string
    recommendations?: string[]
 

  // Issues detected
  detectedIssues?: Array<{
    type: string
    severity: "low" | "medium" | "high"
    count: number
    description: string
  }>

  // Processing details
  processingDetails?: {
    duration: number
    steps: Array<{
      name: string
      status: "completed" | "failed" | "skipped"
      duration?: number
      message?: string
    }>
  }

  test_case?: string[]

  user_test?: string[]
  
  feedback?: Array<{ group: string , count: number}>


  // Additional data from webhook
  [key: string]: any
}
export interface SelectOptionType {
  value: number
  label: string
}


export function AnalyticsDashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  })
  const [selected, setSelected] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [selectedTester, setSelectedTester] = useState<string>("all")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [selectedIssue, setSelectedIssue] = useState<string>("all")
  const [filtersChanged, setFiltersChanged] = useState(0)
  const [projects, setProjects] = useState<Project[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const { toast } = useToast()
  const [projectId, setProjectId] = useState("")
  const [options, setOptions] = useState <getAgentsByProjectIdResponse[]>([])
  const [selectedFiles, setSelectedFiles] = useState<MultiValue<SelectOptionType>>([]);
  const [allData, setAllData] = useState([]);

  const [success_rate , setSuccessRate] = useState<number[]>([0]);
  const [error_rate , setErrorRate] = useState<number[]>([0]);
  const [response_time , setResponseTime] = useState<number[]>([0]);
  const [accuracy , setAccuracy] = useState<number[]>([0]);
  const [xLabels, setXLabels] = useState<string[]>(["No Data"]);

  const [feedback_count_1, setFeedbackCount1] = useState<number[]>([0]);
  const [feedback_count_2, setFeedbackCount2] = useState<number[]>([0]);
  const [feedback_count_3, setFeedbackCount3] = useState<number[]>([0]);
  const [feedbackLabels, setFeedbackLabels] = useState<string[]>(["No Data"]);
  const [success_test, setSuccessTest] = useState<number[]>([0]);
  
  const [summary_count_1, setSummaryCount1] = useState<number[]>([0]);
  const [summary_count_2, setSummaryCount2] = useState<number[]>([0]);
  const [summary_count_3, setSummaryCount3] = useState<number[]>([0]);

  const [testCase1, setTestCase1] = useState<number[]>([0]);
  const [testCase2, setTestCase2] = useState<number[]>([0]);
  const [testCase3, setTestCase3] = useState<number[]>([0]);
  const [testCase4, setTestCase4] = useState<number[]>([0]);
  const [testCase5, setTestCase5] = useState<number[]>([0]);

  // let success_rate = [0];
  // let error_rate = [0];
  // let response_time = [0];
  // let accuracy = [0];
  // let xLabels = ["No Data"];

  // let feedback_count_1 = [0];
  // let feedback_count_2 = [0];
  // let feedback_count_3 = [0];

  // let success_test = [0];
  // let summary_count_1 = [0];
  // let summary_count_2 = [0];
  // let summary_count_3 = [0];


  // let feedbackLabels = ["No Data"];

  
const exportMultiIdToPDF = async (ids) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: "a4"
  });
  let isFirstPage = true;

  for (const id of ids) {
    const element = document.getElementById(id);
    if (!element) continue;
    // สั่ง capture ทีละ id
    // scale: 2 เพื่อความคมชัด (ปรับได้)
    const canvas = await html2canvas(element, { useCORS: true, scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    // set ขนาด pdf/page
    const pdfWidth = 440;
    const pdfHeight = 842;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (!isFirstPage) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    isFirstPage = false;
  }
  pdf.save("multi-section-export.pdf");
}

// วิธีใช้งาน เช่น
const handleExportAllSections = () => {
  exportMultiIdToPDF(['pdf-content-1', 'pdf-content-2', 'pdf-content-3']);
};

  
  const handleFileSelectionChange = (selectedOptions: MultiValue<SelectOptionType>) => {
    // console.log('ข้อมูลที่ถูกเลือกจาก Component ลูก:', selectedOptions);
    setSelectedFiles(selectedOptions);
  };

  const TOTAL = allData.userTest?.map((item) => item.value).reduce((a, b) => a + b, 0);



  const increaseRateDisplay = (arr: number[]) => {
    const rate = increaseRate(arr);

    if (rate === undefined) return <span>-</span>;

    return (
      <div className="flex items-center justify-center gap-1">
        <span className="flex gap-1 text-center">
          {rate > 0 && <TrendingUp className="w-4 h-4 text-green-500 text-center" />}
          {rate < 0 && <TrendingDown className="w-4 h-4 text-red-500 text-center" />}
          {rate > 0 && <span className="text-green-500 text-center">{Math.abs(rate)}%</span>}
          {rate < 0 && <span className="text-red-500 text-center">{Math.abs(rate)}%</span>}
        </span>
      </div>
    );
  }
  const increaseRate = (arr: number[]) => {
    if (arr.length < 2) return undefined;
      const first = arr[0];
      const last = arr[arr.length - 1];
      if (first === 0) return undefined;
      const rate = ((last - first) / first) * 100;
      return Math.round(rate * 100) / 100;
  }
  const mod = (arr: number[]) => {
   if (arr.length === 0) return undefined;

  const freq = {};
  let maxFreq = 0;
  let modes = [];

  arr.forEach(val => {
    freq[val] = (freq[val] || 0) + 1;
    if (freq[val] > maxFreq) maxFreq = freq[val];
  });

  // ถ้าค่า maxFreq = 1 แสดงว่าไม่มีค่าซ้ำ
  if (maxFreq === 1) return "ไม่มีค่าซ้ำ";

  for (let key in freq) {
    if (freq[key] === maxFreq) {
      modes.push(Number(key));
    }
  }

  return modes.length === 1 ? modes[0] : modes;
  }
  const median = (arr: number[]) => {
    if (arr.length === 0) return undefined;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return (sorted.length % 2 !== 0)
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  const handleSelectedFilesChange = async () => {
    // if (allData.length < 2) {
    //   console.warn("เลือกไฟล์น้อยเกินไป กรุณาเลือกอย่างน้อย 2 ไฟล์");
    //   return;
    // }
    const results: any[] = []; // ใช้ any[] เพื่อความยืดหยุ่น
    for (const file of selectedFiles) {
      const data = await DatabaseService.getFileVoiceById(file.value);
      if (data) {
        results.push(data);
      } else {
        console.error(`ไม่พบข้อมูลสำหรับไฟล์: ${file.value}`);
      }
      console.log(`Selected file: ${file.value} - ${file.label}`);
    }
    // console.log('results files:',);
    // setAllData(results);
    
    // let success_rate = [];
    
  // let feedbackLabels = ["No Data"];
    
    const successRates = results.map(item => item[0].success_rate);
    
    const error_rate = results.map(item => item[0].error_rate);
    const response_time = results.map(item => item[0].response_time);
    const accuracy = results.map(item => item[0].accuracy);
    const xLabels = results.map(item => item[0].file_name);

    let success_rate = [];
    for (let index = 0; index < successRates.length; index++) {
      success_rate.push( Math.round(successRates[index] + error_rate[index] + response_time[index] + accuracy[index]) / 4);
    }

    const feedback_count_1 = results.map(item => item[0].feedback[0].count);
    const feedback_count_2 = results.map(item => item[0].feedback[1].count);
    const feedback_count_3 = results.map(item => item[0].feedback[2].count);

    const summary_count_1 = results.map(item => item[0].total_records);
    const summary_count_2 = results.map(item => item[0].processed_records);
    const summary_count_3 = results.map(item => item[0].error_records);

    const testCase1set = results.map(item => item[0].test_case[0].data[0]);
    const testCase2set = results.map(item => item[0].test_case[1].data[0]);
    const testCase3set = results.map(item => item[0].test_case[2].data[0]);
    const testCase4 = results.map(item => item[0].test_case[3].data[0]);
    const testCase5 = results.map(item => item[0].test_case[4].data[0]);
    
    console.log('testCase1set:', testCase1set);
    console.log('testCase2set:', testCase2set);
    console.log('testCase3set:', testCase3set);
    console.log('testCase4:', testCase4);
    console.log('testCase5:', testCase5);

    // const summary_count_2 = results.map(item => item[0].summary_count_2);
    // const summary_count_3 = results.map(item => item[0].summary_count_3);



     // [93.33, 87.12, ...] (ถ้ามีฟิลด์นี้ใน object)
    // const allSuccessRates = results.map(item => item[0][0].success_rate);
    // console.log("All Test :" , allSuccessRates); // [93.33, ...]
    // console.log('Success Rate:', success_rate);

    console.log('Button clicked');
    // Example of updating state
    setSuccessRate(successRates);
    setErrorRate(error_rate);
    setResponseTime(response_time);
    setAccuracy(accuracy);
    setXLabels(xLabels);
    
    setFeedbackCount1(feedback_count_1);
    setFeedbackCount2(feedback_count_2);
    setFeedbackCount3(feedback_count_3);
    setFeedbackLabels(xLabels);

    setSuccessTest(success_rate);
    
    setSummaryCount1(summary_count_1);
    setSummaryCount2(summary_count_2);
    setSummaryCount3(summary_count_3);
    setTestCase1(testCase1set);
    setTestCase2(testCase2set);
    setTestCase3(testCase3set);
    setTestCase4(testCase4);
    setTestCase5(testCase5);

    

    

    console.log('State updated');
    console.log(allData)
    
  }
  useEffect(() => {
    console.log('Success Rate:', success_rate);
  }, [success_rate])
  

  

  
  // Create filters object to pass to components
  const filters: DashboardFilters = {
    dateRange: date,
    selectedTester,
    selectedPlatform,
    selectedIssue,
  }
    // Custom Option with Checkbox
  //   const options = [
  //   { value: "apple", label: "Apple" },
  //   { value: "banana", label: "Banana" },
  //   { value: "orange", label: "Orange" },
  //   { value: "grape", label: "Grape" },
  // ];

  const Option = (props) => (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => {}}
        className="mr-2 bg-card border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-card dark:bg-card dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:ring-offset-card"
      />
      <span>{props.label}</span>
    </components.Option>
  );

  const handleProjectChange = async () => {
   
    const data = await DatabaseService.getFileVoiceByProject(projectId)
    
    setOptions(data)
  }

  useEffect(() => {
    handleProjectChange()
  }, [projectId])
  
   const fetchData = async () => {
    try {
      setLoadingData(true)
      const [projectsRes] = await Promise.all([fetch("/api/projects")])

      const projectsData = await projectsRes.json()
    

      if (projectsData.success) setProjects(projectsData.data)

    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลโปรเจกต์และเอเจนต์ได้",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }
  useEffect(() => {
      fetchData()
    }, [])

  const handleProjectCreated = () => {
    fetchData() // Refresh data
  }

  // Trigger re-render when filters change
  const handleFilterChange = () => {
    setFiltersChanged((prev) => prev + 1)
  }

  // useEffect(() => {
  //   handleFilterChange()
  // }, [date, selectedTester, selectedPlatform, selectedIssue])

  return (
    <div id="dashboard-content" className="space-y-6 sm:space-y-8">
      
      {/* Filters Section */}
      <Card className="w-full ">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5"  />
            <span className="truncate">เลือกโปรเจ็กต์และไฟล์ในการแสดงผล</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            กรองข้อมูลตามโปรเจ็กต์และไฟล์
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12">
            {/* Date Range Picker */}
            <Select     
              
              onValueChange={(value) => {
                setProjectId(value)
                setLastError(null)
              }}
              
              required
              
            >
              <SelectTrigger id="project-name" className="flex-1 col-span-4">
                <SelectValue className="text-xs" placeholder="เลือกโปรเจกต์" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.name} >
                    {project.name}
            
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="col-span-7">
              <CheckboxSelect projectId={projectId} onSelectionChange={handleFileSelectionChange}/>
            </div>
            <div className="col-span-1">
              <button className="border bg-card border-[#533E85]  border-r-4 rounded-md w-full h-10" onClick={handleSelectedFilesChange}>แสดงผล</button>
            </div>
            
            {/* <Selects
           
              options={options}
              isMulti
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              components={{ Option }}
              onChange={setSelected}
              value={selected}
              placeholder="เลือกผลไม้ได้หลายอย่าง"
              className="col-span-7"
            />
            <div  className="w-full col-span-12 sm:col-span-6">
              <b>เลือกแล้ว:</b> {selected.map(opt => opt.file_name).join(", ")}
            </div> */}
            
          </div>
        </CardContent>
      </Card>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222831]">VoiceBot Summary Data</h2>
          <div className="text-xs sm:text-sm text-muted-foreground">
            อัปเดตล่าสุด: {new Date().toLocaleString("th-TH")}
            <Button className="border w-28" onClick={handleExportAllSections}><FileDown /> Export PDF</Button>
          </div>
        </div>
        {/* <PerformanceMetrics filters={filters} key={filtersChanged} /> */}
        
      </div>
    <div id="pdf-content-1">
      <div className="grid gap-4 md:grid-cols-6 mb-12" >
        <div className="col-span-6" >
            <Card className="bg-card  " >
                <CardHeader>
                  <CardTitle className="text-[#222831]">Data analysis results</CardTitle>
                  <CardDescription>สรุปผลการประมวลผลข้อมูล จากไฟล์ CSV </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-6">
                    <div className="col-span-2">
                  <LineChart
                  height={300}
                  series={[
                    { data: summary_count_1, label: 'Dialog', yAxisId: 'leftAxisId' },
                    
                  ]}
                  xAxis={[{ scaleType:'point', data: feedbackLabels }]}
                 
                  yAxis={[
                    { scaleType: 'linear',id: 'leftAxisId', },
                    
                  ]}
                />
                </div>
                <div className="col-span-2">
                <LineChart
                  height={300}
                  series={[
                    { data: summary_count_2, label: 'Case', yAxisId: 'leftAxisId' , color: '#90C67C' },
                    
                  ]}
                  xAxis={[{ scaleType:'point', data: feedbackLabels }]}
                 
                  yAxis={[
                    { scaleType: 'linear',id: 'leftAxisId', },
                    
                  ]}
                />
                </div>
                 <div className="col-span-2">
                <LineChart
                  height={300}
                  series={[
                    { data: summary_count_3, label: 'Feedback', yAxisId: 'leftAxisId' , color: '#EA2F14' },
                    
                  ]}
                  xAxis={[{ scaleType:'point', data: feedbackLabels }]}
                 
                  yAxis={[
                    { scaleType: 'linear',id: 'leftAxisId', },
                    
                  ]}
                />
                </div>
                </div>
               

                  <div className="pt-4 border-t"></div>

                  <h3 className="text-lg font-semibold text-[#222831] mb-4">Detailed Data analysis results Analysis</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data groups</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 ">Min</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Avg</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Max</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Median</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Mod</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Total</th>
                          <th className="px-3 py-3 text-center text-sm font-medium text-gray-700">Increase/Decrease Rate</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        
                          <tr  className={'bg-white'}>
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-md mt-2">
                              <div className="pt-2 text-[#90C67C] ">
                                Dialog
                              </div>
                              <div className="pt-2 text-[#EA2F14]">
                                Case
                              </div>
                              <div className="pt-2 text-[#FBBF24]">
                                Feedback
                              </div>
                             
                              
                            </td>
                            <td className="px-4 py-3 text-sm text-red-600 font-medium text-center">
                              <div className="pt-2 text-[#90C67C]">
                                {Math.max(...summary_count_1)}
                              </div>
                              <div className="pt-2 text-[#EA2F14]">
                                {Math.min(...summary_count_2)}
                              </div>
                              <div className="pt-2 text-[#FBBF24]">
                                {Math.min(...summary_count_3)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-center">
                              <div className="pt-2 text-[#90C67C]">
                                {summary_count_1.length > 0? (summary_count_1.reduce((sum, val) => sum + val, 0) / summary_count_1.length).toFixed(2): undefined}
                              </div>
                              <div className="pt-2 text-[#EA2F14]">
                                 {summary_count_2.length > 0? (summary_count_2.reduce((sum, val) => sum + val, 0) / summary_count_2.length).toFixed(2): undefined}
                              </div>
                              <div className="pt-2 text-[#FBBF24]">
                                 {summary_count_3.length > 0? (summary_count_3.reduce((sum, val) => sum + val, 0) / summary_count_3.length).toFixed(2): undefined}
                              </div>
                             
                              
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-center">
                              <div className="pt-2 text-[#90C67C]">
                                {Math.max(...summary_count_1)}
                              </div>
                              <div className="pt-2 text-[#EA2F14]">
                                {Math.max(...summary_count_2)}
                              </div>
                              <div className="pt-2 text-[#FBBF24]">
                                {Math.max(...summary_count_3)}
                              </div>
                              
                            </td>
                            <td className="px-4 py-3 text-sm text-red-600 font-medium text-center">
                                <div className="pt-2 text-[#90C67C]">
                                {median(summary_count_1) !== undefined ? median(summary_count_1) : undefined}
                              </div>
                                <div className="pt-2 text-[#EA2F14]">
                                {median(summary_count_2) !== undefined ? median(summary_count_2) : undefined}
                              </div>
                                <div className="pt-2 text-[#FBBF24]">
                                {median(summary_count_3) !== undefined ? median(summary_count_3) : undefined}
                              </div>
                                
                            </td>
                            <td className="px-4 py-3 text-sm text-red-600 font-medium text-center">
                              <div className="pt-2 text-[#90C67C]">
                                {mod(summary_count_1) !== undefined ? mod(summary_count_1).toString() : undefined}
                              </div>
                                <div className="pt-2 text-[#EA2F14]">
                                {mod(summary_count_2) !== undefined ? mod(summary_count_2).toString() : undefined}
                              </div>
                                <div className="pt-2 text-[#FBBF24]">
                                {mod(summary_count_3) !== undefined ? mod(summary_count_3).toString() : undefined}
                              </div>
                            </td> 
                            <td className="px-4 py-3 text-sm text-red-600 font-medium text-center">
                                <div className="pt-2 text-[#90C67C]">
                                {summary_count_1.reduce((sum, val) => sum + val, 0)}
                              </div>
                                <div className="pt-2 text-[#EA2F14]">
                                {summary_count_2.reduce((sum, val) => sum + val, 0)}
                              </div>
                                <div className="pt-2 text-[#FBBF24]">
                                {summary_count_3.reduce((sum, val) => sum + val, 0)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-red-600 font-medium text-center">
                                <div className="pt-2 text-[#90C67C]">
                                {increaseRateDisplay(summary_count_1)}
                              </div>
                                <div className="pt-2 text-[#EA2F14]">
                                {increaseRateDisplay(summary_count_2)}
                              </div>
                                <div className="pt-2 text-[#FBBF24]">
                                {increaseRateDisplay(summary_count_3)}
                              </div>
                            </td>
                          </tr>
                      
                      </tbody>
                    </table>
                  </div>
                
                  
                </CardContent>
              </Card>
              </div>
              
      </div>
      
      <div className="grid gap-4 md:grid-cols-6 mb-12 ">
            {/* <Card className="text-white bg-cyan-900 col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <ChartPie className="h-4 w-4" />
                  อัตราความสำเร็จผลเทส
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2  pt-20">
                <ChartContainer
                  xAxis={[{ scaleType: 'band', data: ['A', 'B', 'C']  }]}
                  yAxis={[{ scaleType: 'linear', min: 0, max: 100 }]}
                  
                  series={[
                    {
                      type: 'bar',
                      id: 'base',
                      data: [11, 82, 80],
                    },
                  ]}
                  
                  height={200}
                >
                  <BarPlot borderRadius={20}  barLabel="value"   />
                  
                  <ChartsXAxis />
                  <ChartsYAxis />
                  
                </ChartContainer>
                <div className="flex justify-end">
                  <Button size="sm" className="mr-2 cursor-context-menu bg-red-500 text-[#fff] " >
                  <p>Min 56%</p> 
                  </Button>
                  <Button size="sm" className="mr-2 cursor-context-menu bg-yellow-500 text-[#fff]" >
                    <p>Avg 60%</p> 
                  </Button>
                  <Button size="sm" className="mr-2 cursor-context-menu bg-green-700 text-[#fff]" >
                    <p>Max 100%</p> 
                  </Button>
                </div>
                
              </CardContent>
            </Card> */}
           
            <Card className="text-white bg-card col-span-6">
              <CardHeader className="pb-3">
                <CardTitle className=" text-[#222831] flex items-center gap-2">
                  Test results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2  pt-10">
                <LineChart
                  height={300}
                  series={[
                    { data: success_test, label: 'อัตราความสำเร็จผลเทส', yAxisId: 'leftAxisId' },
                  ]}
                  xAxis={[{ scaleType:'point', data: feedbackLabels , min: 0, max: 100 }]}
                 
                  yAxis={[
                    { min: 0, max: 100 , scaleType: 'linear',id: 'leftAxisId' },
                  ]}
                />
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Test results Analysis</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Test results </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 ">Min</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Avg</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Max</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Median</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Mod</th>
                  
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-700">Increase/Decrease Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                
                  <tr  className={'bg-white'}>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-md">
                      <div className="pt-2">
                        อัตราความสำเร็จผลเทส
                      </div>
                      
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium text-center">
                      <div className="pt-2">
                        {Math.min(...success_test)}
                      </div>
                      
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">
                      <div className="pt-2">
                        {success_test.length > 0? (success_test.reduce((sum, val) => sum + val, 0) / success_test.length).toFixed(2): undefined}
                      </div>
                      
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">
                      <div className="pt-2">
                        {Math.max(...success_test)}
                      </div>
                      
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium text-center">
                      
                        
                        <div className="pt-2">
                        {median(success_test) !== undefined ? median(success_test) : undefined}
                      </div>
                      
                      
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium text-center">
                      
                        
                        <div className="pt-2">
                        {mod(success_test) !== undefined ? mod(success_test).toString() : undefined}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 text-sm text-red-600 font-medium text-center">
                      
                        
                        <div className="pt-2">
                        {increaseRateDisplay(success_test)}
                      </div>
                    </td>
                  </tr>
              
              </tbody>
            </table>
          </div>
              </CardContent>
            </Card>
            
            
            
            
            </div>

            <div className="grid gap-4 md:grid-cols-8">
              <div className="col-span-8">
                <Card className="text-white bg-card col-span-3" >
              <CardHeader className="pb-3">
                <CardTitle className="text-[#222831] flex items-center gap-2">
                  
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2  pt-10">
                <LineChart
                  height={310}
                  series={[
                    { data: success_rate, label: 'Hang Up Rate', yAxisId: 'leftAxisId' , color: '#3ED598' },
                    { data: error_rate, label: 'Spelling Name Rate', yAxisId: 'leftAxisId' , color: '#FBBF24' },
                    { data: response_time, label: 'Result Rate', yAxisId: 'leftAxisId' , color: '#EA2F14' },
                    { data: accuracy, label: 'ASR Rate', yAxisId: 'leftAxisId' , color: '#90C67C' },
                  ]}
                  xAxis={[{ scaleType: 'point', data: xLabels }]}
                 
                  yAxis={[
                    { id: 'leftAxisId', width: 50 },
                    { id: 'rightAxisId', position: 'right' },
                    { scaleType: 'linear', min: 0, max: 100 }
                  ]}
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Performance Analysis</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Performance groups</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 ">Min</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Avg</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Max</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Median</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Mod</th>
                  
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-700">Increase/Decrease Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-center">
                
                  <tr  className={'bg-white'}>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-md text-left">
                      <div className="pt-2 text-[#3ED598]">
                        Hang Up Rate
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        Spelling Name Rate
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        Result Rate
                      </div>
                      <div className="pt-2 text-[#90C67C]">
                        ASR Rate
                      </div>
                      
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      <div className="pt-2 text-[#3ED598]">
                        {Math.min(...success_rate)}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {Math.min(...error_rate)}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {Math.min(...response_time)}
                      </div>
                      <div className="pt-2 text-[#90C67C]">
                        {Math.min(...accuracy)}
                      </div>
                      
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="pt-2 text-[#3ED598]">
                        {success_rate.length > 0 ? (success_rate.reduce((sum, val) => sum + val, 0) / success_rate.length).toFixed(2) : undefined}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {error_rate.length > 0 ? (error_rate.reduce((sum, val) => sum + val, 0) / error_rate.length).toFixed(2) : undefined}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {response_time.length > 0 ? (response_time.reduce((sum, val) => sum + val, 0) / response_time.length).toFixed(2) : undefined}
                      </div>
                      <div className="pt-2 text-[#90C67C]">
                        {accuracy.length > 0 ? (accuracy.reduce((sum, val) => sum + val, 0) / accuracy.length).toFixed(2) : undefined}
                      </div>
                      
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="pt-2 text-[#3ED598]">
                        {Math.max(...success_rate)}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {Math.max(...error_rate)}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {Math.max(...response_time)}
                      </div>
                      <div className="pt-2 text-[#90C67C]">
                        {Math.max(...accuracy)}
                      </div>
                      
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                        <div className="pt-2 text-[#3ED598]">
                        {median(success_rate) !== undefined ? median(success_rate) : undefined}
                      </div>
                        <div className="pt-2 text-[#FBBF24]">
                        {median(error_rate) !== undefined ? median(error_rate) : undefined}
                      </div>
                        <div className="pt-2 text-[#EA2F14]">
                        {median(response_time) !== undefined ? median(response_time) : undefined}
                      </div>
                        <div className="pt-2 text-[#90C67C]">
                        {median(accuracy) !== undefined ? median(accuracy) : undefined}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      
                        
                        <div className="pt-2 text-[#3ED598]">
                        {mod(success_rate) !== undefined ? mod(success_rate).toString() : undefined}
                      </div>
                        <div className="pt-2 text-[#FBBF24]">
                        {mod(error_rate) !== undefined ? mod(error_rate).toString() : undefined}
                      </div>
                        <div className="pt-2 text-[#EA2F14]">
                        {mod(response_time) !== undefined ? mod(response_time).toString() : undefined}
                      </div>
                        <div className="pt-2 text-[#90C67C]">
                        {mod(accuracy) !== undefined ? mod(accuracy).toString() : undefined}
                      </div>
                        
                    </td>
                    
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      
                        
                        <div className="pt-2 text-[#3ED598]">
                        {increaseRateDisplay(success_rate)}
                      </div>
                        <div className="pt-2 text-[#FBBF24]">
                        {increaseRateDisplay(error_rate)}
                      </div>
                        <div className="pt-2 text-[#EA2F14]">
                        {increaseRateDisplay(response_time)}
                      </div>
                        <div className="pt-2 text-[#90C67C]">
                        {increaseRateDisplay(accuracy)}
                      </div>
                        
                    </td>
                  </tr>
              
              </tbody>
            </table>
          </div>
          
              </CardContent>
              
            </Card>
            </div>
            
              </div>
              <div  id="pdf-content-2">
              <div className="col-span-8">
                <Card className="text-white bg-card col-span-4">
              <CardHeader className="pb-3">
                <CardTitle className=" text-[#222831]  flex items-center gap-2">
                  Test case
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2  pt-10">
                <div className="grid gap-4 md:grid-cols-6 ">
                  <div className="col-span-2">
                <LineChart
                  height={300}
                  series={[
                    { data: testCase1, label: 'สะดวก-ยืนยัน-วางสาย', yAxisId: 'leftAxisId',  color: '#77B254' },
                   
                  
                  ]}
                  xAxis={[{ scaleType: 'point', data: feedbackLabels }]}
                 
                  yAxis={[
                    { id: 'leftAxisId', width: 50 },
                    { id: 'rightAxisId', position: 'right' },
                    { scaleType: 'linear', min: 0, max: 100 }
                  ]}
                />
                </div>
                  <div className="col-span-2">
                <LineChart
                  height={300}
                  series={[
                   
                    { data: testCase2, label: 'ไม่สะดวก นัดใหม่ (แจ้งวันก่อน -> เวลา ) วางสาย', yAxisId: 'leftAxisId' , color: '#533E85' }
  
                  
                  ]}
                  xAxis={[{ scaleType: 'point', data: feedbackLabels }]}
                 
                  yAxis={[
                    { id: 'leftAxisId', width: 50 },
                    { id: 'rightAxisId', position: 'right' },
                    { scaleType: 'linear', min: 0, max: 100 }
                  ]}
                />
                </div>

                  <div className="col-span-2">
                <LineChart
                  height={300}
                  series={[
                    
                    { data: testCase3, label: 'ไม่สะดวก นัดใหม่ (แจ้งเวลาก่อน -> วัน ) วางสาย', yAxisId: 'leftAxisId' , color: '#5A827E' },
                  
                  ]}
                  xAxis={[{ scaleType: 'point', data: feedbackLabels }]}
                 
                  yAxis={[
                    { id: 'leftAxisId', width: 50 },
                    { id: 'rightAxisId', position: 'right' },
                    { scaleType: 'linear', min: 0, max: 100 }
                  ]}
                />
                </div>
                  <div className="grid grid-cols-12 gap-4 col-span-6">
                    <div className="col-span-2"></div>
                    <div className="col-span-4">
                    <LineChart
                      height={300}
                      series={[
                        
                        { data: testCase4, label: 'ไม่สะดวก นัดใหม่ (แจ้งวัน + เวลา) วางสาย', yAxisId: 'leftAxisId' , color: '#00CAFF' },
                      
                      ]}
                      xAxis={[{ scaleType: 'point', data: feedbackLabels }]}
                    
                      yAxis={[
                        { id: 'leftAxisId', width: 50 },
                        { id: 'rightAxisId', position: 'right' },
                        { scaleType: 'linear', min: 0, max: 100 }
                      ]}
                    />
                    </div>
                    
                    <div className="col-span-4">
                    <LineChart
                      height={300}
                      series={[
                        
                        { data: testCase5, label: 'ยกเลิก โทรนัดใหม่ วางสาย', yAxisId: 'leftAxisId' , color: '#DA6C6C' },
                      
                      ]}
                      xAxis={[{ scaleType: 'point', data: feedbackLabels }]}
                    
                      yAxis={[
                        { id: 'leftAxisId', width: 50 },
                        { id: 'rightAxisId', position: 'right' },
                        { scaleType: 'linear', min: 0, max: 100 }
                      ]}
                    />
                    <div className="col-span-2"></div>
                    </div>
                  </div>
                </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Test case Analysis</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Test case Group</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 ">Min</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Avg</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Max</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Median</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Mod</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Total</th>
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-700">Increase/Decrease Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-center">
                
                  <tr  className={'bg-white'}>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-md text-left">
                      <div className="pt-2 text-[#90C67C]">
                        สะดวก-ยืนยัน-วางสาย
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        ไม่สะดวก นัดใหม่ (แจ้งวันก่อน -> เวลา ) วางสาย
                      </div>
                      <div className="pt-2 text-[#533E85]">
                        ไม่สะดวก นัดใหม่ (แจ้งเวลาก่อน -> วัน ) วางสาย
                      </div>
                      <div className="pt-2 text-[#00CAFF]">
                        ไม่สะดวก นัดใหม่ (แจ้งวัน + เวลา) วางสาย
                      </div>
                      <div className="pt-2 text-[#DA6C6C]">
                        ยกเลิก โทรนัดใหม่ วางสาย
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      <div className="pt-2 text-[#90C67C]">
                        {Math.min(...testCase1)}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {Math.min(...testCase2)}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {Math.min(...testCase3)}
                      </div>
                      <div className="pt-2 text-[#00CAFF]">
                        {Math.min(...testCase4)}
                      </div>
                      <div className="pt-2 text-[#DA6C6C]">
                        {Math.min(...testCase5)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="pt-2 text-[#90C67C]">
                        {testCase1.length > 0 ? (testCase1.reduce((sum, val) => sum + val, 0) / testCase1.length).toFixed(2) : undefined}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {testCase2.length > 0 ? (testCase2.reduce((sum, val) => sum + val, 0) / testCase2.length).toFixed(2) : undefined}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {testCase3.length > 0 ? (testCase3.reduce((sum, val) => sum + val, 0) / testCase3.length).toFixed(2) : undefined}
                      </div>
                      <div className="pt-2 text-[#00CAFF]">
                        {testCase4.length > 0 ? (testCase4.reduce((sum, val) => sum + val, 0) / testCase4.length).toFixed(2) : undefined}
                      </div>
                      <div className="pt-2 text-[#DA6C6C]">
                        {testCase5.length > 0 ? (testCase5.reduce((sum, val) => sum + val, 0) / testCase5.length).toFixed(2) : undefined}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="pt-2 text-[#90C67C]">
                        {Math.max(...testCase1)}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {Math.max(...testCase2)}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {Math.max(...testCase3)}
                      </div>
                      <div className="pt-2 text-[#00CAFF]">
                        {Math.max(...testCase4)}
                      </div>
                      <div className="pt-2 text-[#DA6C6C]">
                        {Math.max(...testCase5)}
                      </div>

                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      <div className="pt-2 text-[#90C67C]">
                        {median(testCase1) !== undefined ? median(testCase1) : undefined}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {median(testCase2) !== undefined ? median(testCase2) : undefined}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {median(testCase3) !== undefined ? median(testCase3) : undefined}
                      </div>
                      <div className="pt-2 text-[#00CAFF]">
                        {median(testCase4) !== undefined ? median(testCase4) : undefined}
                      </div>
                      <div className="pt-2 text-[#DA6C6C]">
                        {median(testCase5) !== undefined ? median(testCase5) : undefined}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      <div className="pt-2 text-[#90C67C]">
                        {mod(testCase1) !== undefined ? mod(testCase1).toString() : undefined}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {mod(testCase2) !== undefined ? mod(testCase2).toString() : undefined}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {mod(testCase3) !== undefined ? mod(testCase3).toString() : undefined}
                      </div>
                      <div className="pt-2 text-[#00CAFF]">
                        {mod(testCase4) !== undefined ? mod(testCase4).toString() : undefined}
                      </div>
                      <div className="pt-2 text-[#DA6C6C]">
                        {mod(testCase5) !== undefined ? mod(testCase5).toString() : undefined}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                     <div className="pt-2 text-[#90C67C]">
                        {testCase1.reduce((sum, val) => sum + val, 0)}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {testCase2.reduce((sum, val) => sum + val, 0)}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {testCase3.reduce((sum, val) => sum + val, 0)}
                      </div>
                      <div className="pt-2 text-[#00CAFF]">
                        {testCase4.reduce((sum, val) => sum + val, 0)}
                      </div>
                      <div className="pt-2 text-[#DA6C6C]">
                        {testCase5.reduce((sum, val) => sum + val, 0)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      <div className="pt-2 text-[#90C67C]">
                        {increaseRateDisplay(testCase1)}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {increaseRateDisplay(testCase2)}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {increaseRateDisplay(testCase3)}
                      </div>
                      <div className="pt-2 text-[#00CAFF]">
                        {increaseRateDisplay(testCase4)}
                      </div>
                      <div className="pt-2 text-[#DA6C6C]">
                        {increaseRateDisplay(testCase5)}
                      </div>
                    </td>
                  </tr>
              
              </tbody>
            </table>
          </div>
              </CardContent>
            </Card>
        </div>
              <div className="col-span-8">
                <Card className="text-white bg-card col-span-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#222831]  flex items-center gap-2">
                  การเปรียบเทียบปัญหา
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2  pt-10">
                <div className="grid gap-4 md:grid-cols-6">
                  <div className="col-span-2">
                <LineChart
                  height={300}
                  series={[
                    { data: feedback_count_1, label: 'กลุ่มปัญหาการรู้จำเสียงพูด (ASR)', yAxisId: 'leftAxisId',  color: '#90C67C' },
                   
                  
                  ]}
                  xAxis={[{ scaleType: 'point', data: feedbackLabels }]}
                 
                  yAxis={[
                    { id: 'leftAxisId', width: 50 },
                    { id: 'rightAxisId', position: 'right' },
                    { scaleType: 'linear', min: 0, max: 100 }
                  ]}
                />
                </div>
                  <div className="col-span-2">
                <LineChart
                  height={300}
                  series={[
                   
                    { data: feedback_count_2, label: 'กลุ่มปัญหาเกี่ยวกับการเข้าใจวัน เวลา หรือบอทตอบเรื่องเวลา/วัน', yAxisId: 'leftAxisId' , color: '#EA2F14' }
  
                  
                  ]}
                  xAxis={[{ scaleType: 'point', data: feedbackLabels }]}
                 
                  yAxis={[
                    { id: 'leftAxisId', width: 50 },
                    { id: 'rightAxisId', position: 'right' },
                    { scaleType: 'linear', min: 0, max: 100 }
                  ]}
                />
                </div>
                  <div className="col-span-2">
                <LineChart
                  height={300}
                  series={[
                    
                    { data: feedback_count_3, label: 'กลุ่มปัญหาอื่นๆ', yAxisId: 'leftAxisId' , color: '#FBBF24' },
                  
                  ]}
                  xAxis={[{ scaleType: 'point', data: feedbackLabels }]}
                 
                  yAxis={[
                    { id: 'leftAxisId', width: 50 },
                    { id: 'rightAxisId', position: 'right' },
                    { scaleType: 'linear', min: 0, max: 100 }
                  ]}
                />
                </div>
                </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Issue Analysis</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Issue Group</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 ">Min</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Avg</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Max</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Median</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Mod</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Total</th>
                  <th className="px-3 py-3 text-center text-sm font-medium text-gray-700">Increase/Decrease Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-center">
                
                  <tr  className={'bg-white'}>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-md text-left">
                      <div className="pt-2 text-[#90C67C]">
                        กลุ่มปัญหาการรู้จำเสียงพูด (ASR)
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        กลุ่มปัญหาเกี่ยวกับการเข้าใจวัน ...
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        กลุ่มปัญหาอื่นๆ
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      <div className="pt-2 text-[#90C67C]">
                        {Math.min(...feedback_count_1)}
                      </div>
                      <div className="pt-2 ">
                        {Math.min(...feedback_count_2)}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {Math.min(...feedback_count_3)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="pt-2 text-[#90C67C]">
                        {feedback_count_1.length > 0 ? (feedback_count_1.reduce((sum, val) => sum + val, 0) / feedback_count_1.length).toFixed(2) : undefined}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {feedback_count_2.length > 0 ? (feedback_count_2.reduce((sum, val) => sum + val, 0) / feedback_count_2.length).toFixed(2) : undefined}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {feedback_count_3.length > 0 ? (feedback_count_3.reduce((sum, val) => sum + val, 0) / feedback_count_3.length).toFixed(2) : undefined}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="pt-2 text-[#90C67C]">
                        {Math.max(...feedback_count_1)}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {Math.max(...feedback_count_2)}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {Math.max(...feedback_count_3)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      
                        
                        <div className="pt-2 text-[#90C67C]">
                        {median(feedback_count_1) !== undefined ? median(feedback_count_1) : undefined}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {median(feedback_count_2) !== undefined ? median(feedback_count_2) : undefined}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {median(feedback_count_3) !== undefined ? median(feedback_count_3) : undefined}
                      </div>
                      
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      
                        
                        <div className="pt-2 text-[#90C67C]">
                        {mod(feedback_count_1) !== undefined ? mod(feedback_count_1).toString() : undefined}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {mod(feedback_count_2) !== undefined ? mod(feedback_count_2).toString() : undefined}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {mod(feedback_count_3) !== undefined ? mod(feedback_count_3).toString() : undefined}
                      </div>
                      
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      
                        
                        <div className="pt-2 text-[#90C67C]">
                        {feedback_count_1.reduce((sum, val) => sum + val, 0)}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {feedback_count_2.reduce((sum, val) => sum + val, 0)}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {feedback_count_3.reduce((sum, val) => sum + val, 0)}
                      </div>
                      
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      
                        
                        <div className="pt-2 text-[#90C67C]">
                        {increaseRateDisplay(feedback_count_1)}
                      </div>
                      <div className="pt-2 text-[#EA2F14]">
                        {increaseRateDisplay(feedback_count_2)}
                      </div>
                      <div className="pt-2 text-[#FBBF24]">
                        {increaseRateDisplay(feedback_count_3)}
                      </div>
                      
                    </td>
                  </tr>
              
              </tbody>
            </table>
          </div>
              </CardContent>
            </Card>
            </div>
              </div>

            </div>
          
          

          
      {/* <VoiceBotDashboard allData={allData} /> */}
      {/* <PerformanceTrendDashboard reports={data}/> */}
      {/* Test Summary */}
      {/* <TestSummary filters={filters} key={filtersChanged} /> */}

      {/* Response Time Chart */}
      {/* <ResponseTimeChart filters={filters} key={filtersChanged} /> */}

      {/* Testing Platforms */}
      {/* <TestingPlatforms filters={filters} key={filtersChanged} /> */}

      {/* ASR Details */}
      {/* <AsrDetails filters={filters} key={filtersChanged} /> */}

      {/* AI Summary Per Session */}
      {/* <AiSummaryPerSession filters={filters} key={filtersChanged} /> */}

      {/* Detected Issues */}
      {/* <DetectedIssues filters={filters} key={filtersChanged} /> */}

      {/* Test Case Chart */}
      {/* <TestCaseChart filters={filters} key={filtersChanged} /> */}

      {/* Frequently Asked Questions */}
      {/* <FrequentlyAskedQuestions filters={filters} key={filtersChanged} /> */}
    </div>
  )
}
