import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export interface ExportOptions {
  filename?: string
  quality?: number
  format?: "a4" | "a3" | "letter"
  orientation?: "portrait" | "landscape"
}

export async function exportToPDF(elementId: string, options: ExportOptions = {}): Promise<void> {
  const { filename = "dashboard-export", quality = 0.95, format = "a4", orientation = "portrait" } = options

  try {
    // Find the element to export
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`)
    }

    // Show loading state
    const loadingElement = document.createElement("div")
    loadingElement.id = "pdf-loading"
    loadingElement.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    loadingElement.innerHTML = `
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-center gap-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="text-sm font-medium">กำลังสร้าง PDF...</span>
      </div>
    `
    document.body.appendChild(loadingElement)

    // Scroll to top and wait for content to settle
    window.scrollTo(0, 0)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // PDF page dimensions (in mm)
    const pageFormats = {
      a4: { width: 210, height: 297 },
      a3: { width: 297, height: 420 },
      letter: { width: 216, height: 279 },
    }

    const pageFormat = pageFormats[format]
    const pdfWidth = orientation === "landscape" ? pageFormat.height : pageFormat.width
    const pdfHeight = orientation === "landscape" ? pageFormat.width : pageFormat.height

    // Use smaller margins for more content space
    const marginX = 5 // 5mm margin on each side
    const marginY = 15 // 15mm margin top/bottom (for title and footer)

    // Available content area in mm
    const contentWidth = pdfWidth - marginX * 2
    const contentHeight = pdfHeight - marginY * 2 - 20 // Extra space for title

    // Get element dimensions
    const elementRect = element.getBoundingClientRect()
    const elementWidth = element.scrollWidth
    const elementHeight = element.scrollHeight

    // Use higher scale for better quality and larger size
    const baseScale = 3 // Increased base scale

    // Capture the element as canvas with high resolution
    const canvas = await html2canvas(element, {
      scale: baseScale,
      width: elementWidth,
      height: elementHeight,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: elementWidth,
      windowHeight: elementHeight,
    })

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
    })

    // Add title
    const timestamp = new Date().toLocaleString("th-TH")
    pdf.setFontSize(16)
    pdf.text("Dashboard Report", pdfWidth / 2, 12, { align: "center" })
    pdf.setFontSize(10)
    pdf.text(`สร้างเมื่อ: ${timestamp}`, pdfWidth / 2, 20, { align: "center" })

    // Convert canvas to image
    const imgData = canvas.toDataURL("image/jpeg", quality)

    // Calculate image dimensions to fit the content area
    const canvasAspectRatio = canvas.width / canvas.height
    const contentAspectRatio = contentWidth / contentHeight

    let imgWidthMM: number
    let imgHeightMM: number

    if (canvasAspectRatio > contentAspectRatio) {
      // Image is wider - fit to width
      imgWidthMM = contentWidth
      imgHeightMM = contentWidth / canvasAspectRatio
    } else {
      // Image is taller - fit to height or use full width if reasonable
      imgHeightMM = contentHeight
      imgWidthMM = contentHeight * canvasAspectRatio

      // If the calculated width is much smaller than available width, use more width
      if (imgWidthMM < contentWidth * 0.8) {
        imgWidthMM = contentWidth
        imgHeightMM = contentWidth / canvasAspectRatio
      }
    }

    // Center the image
    const xOffset = marginX + (contentWidth - imgWidthMM) / 2
    const yOffset = marginY + 10 // Start after title

    // Check if image fits on one page
    const availableHeight = pdfHeight - yOffset - 10 // 10mm bottom margin

    if (imgHeightMM <= availableHeight) {
      // Single page
      pdf.addImage(imgData, "JPEG", xOffset, yOffset, imgWidthMM, imgHeightMM)
    } else {
      // Multiple pages needed
      const pageContentHeight = availableHeight
      const totalPages = Math.ceil(imgHeightMM / pageContentHeight)

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage()

        // Calculate the portion of image for this page
        const sourceYRatio = (i * pageContentHeight) / imgHeightMM
        const sourceHeightRatio = Math.min(pageContentHeight / imgHeightMM, 1 - sourceYRatio)

        const sourceY = sourceYRatio * canvas.height
        const sourceHeight = sourceHeightRatio * canvas.height

        // Create a temporary canvas for this page portion
        const tempCanvas = document.createElement("canvas")
        const tempCtx = tempCanvas.getContext("2d")
        tempCanvas.width = canvas.width
        tempCanvas.height = sourceHeight

        if (tempCtx) {
          // Fill with white background
          tempCtx.fillStyle = "#ffffff"
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

          // Draw the image portion
          tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight)

          const pageImgData = tempCanvas.toDataURL("image/jpeg", quality)
          const pageImgHeightMM = sourceHeightRatio * imgHeightMM

          pdf.addImage(pageImgData, "JPEG", xOffset, yOffset, imgWidthMM, pageImgHeightMM)
        }
      }
    }

    // Add footer with page numbers
    const pageCount = pdf.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.text(`หน้า ${i} จาก ${pageCount}`, pdfWidth / 2, pdfHeight - 5, { align: "center" })
    }

    // Save the PDF
    pdf.save(`${filename}-${new Date().toISOString().split("T")[0]}.pdf`)
  } catch (error) {
    console.error("Error exporting PDF:", error)
    throw error
  } finally {
    // Remove loading state
    const loadingElement = document.getElementById("pdf-loading")
    if (loadingElement) {
      document.body.removeChild(loadingElement)
    }
  }
}

export function exportDashboardToPDF(dashboardType: "chatbot" | "voicebot") {
  const filename = dashboardType === "chatbot" ? "chatbot-dashboard" : "voicebot-dashboard"
  return exportToPDF("dashboard-content", {
    filename,
    orientation: "portrait",
    format: "a4",
    quality: 0.9,
  })
}
