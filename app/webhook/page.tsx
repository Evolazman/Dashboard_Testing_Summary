import { WebhookForm } from "@/components/webhook-form"
import { ProjectFolders } from "@/components/project-folders"
import { ProjectManagement } from "@/components/project-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WebhookPage() {
  return (
    <div className="flex flex-col space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">สรุปข้อมูลอัตโนมัติไปยังแดชบอร์ด</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          ส่งไฟล์ CSV ไปยัง n8n webhook และจัดการโปรเจกต์แบบกำหนดเอง
        </p>
      </div>

      {/* Project Folders Section */}
      <ProjectFolders />
      <WebhookForm />
      <ProjectManagement />
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">วิธีการใช้งาน</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>• อัปโหลดไฟล์ CSV จากคอมพิวเตอร์ของคุณ</li>
                <li>• ใส่ URL ของ n8n webhook แบบกำหนดเอง</li>
                <li>• ระบุชื่อไฟล์ที่อธิบายได้</li>
                <li>• เลือกโปรเจกต์และเอเจนต์</li>
                <li>• คลิกส่งเพื่อส่งข้อมูล</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">ข้อมูล Webhook</h3>
              <div className="bg-muted p-3 sm:p-4 rounded-lg">
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {`{
  "fileName": "ชื่อไฟล์ของคุณ",
  "projectName": "โปรเจกต์ที่เลือก",
  "projectId": "project1",
  "agentName": "เอเจนต์ที่เลือก", 
  "agentId": "agent1",
  "fileContent": "csv,data,here...",
  "originalFileName": "file.csv",
  "fileSize": 1024,
  "timestamp": "2024-01-15T10:30:00Z"
}`}
                </pre>
              </div>
            </div>
          </div>

      {/* <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
         
          
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          
          {/* Information Section */}
          
        {/* </TabsContent>
      </Tabs> */} 

    </div>
  )
}
