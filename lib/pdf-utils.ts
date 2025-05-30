// Utility functions for PDF optimization
export function optimizeElementForPDF(elementId: string): void {
  const element = document.getElementById(elementId)
  if (!element) return

  // Add PDF-specific styles
  element.style.backgroundColor = "#ffffff"
  element.style.color = "#000000"

  // Ensure all images are loaded
  const images = element.querySelectorAll("img")
  images.forEach((img) => {
    if (!img.complete) {
      img.style.display = "none"
    }
  })

  // Optimize charts and graphs
  const charts = element.querySelectorAll("[data-recharts-wrapper]")
  charts.forEach((chart) => {
    const chartElement = chart as HTMLElement
    chartElement.style.backgroundColor = "#ffffff"
  })

  // Ensure proper spacing for PDF
  const cards = element.querySelectorAll('[class*="card"]')
  cards.forEach((card) => {
    const cardElement = card as HTMLElement
    cardElement.style.pageBreakInside = "avoid"
    cardElement.style.marginBottom = "10px"
  })
}

export function restoreElementAfterPDF(elementId: string): void {
  const element = document.getElementById(elementId)
  if (!element) return

  // Remove PDF-specific styles
  element.style.backgroundColor = ""
  element.style.color = ""

  // Restore images
  const images = element.querySelectorAll("img")
  images.forEach((img) => {
    img.style.display = ""
  })

  // Restore charts
  const charts = element.querySelectorAll("[data-recharts-wrapper]")
  charts.forEach((chart) => {
    const chartElement = chart as HTMLElement
    chartElement.style.backgroundColor = ""
  })

  // Restore cards
  const cards = element.querySelectorAll('[class*="card"]')
  cards.forEach((card) => {
    const cardElement = card as HTMLElement
    cardElement.style.pageBreakInside = ""
    cardElement.style.marginBottom = ""
  })
}

export function calculateOptimalScale(
  elementWidth: number,
  elementHeight: number,
  targetWidth: number,
  targetHeight: number,
): number {
  const scaleX = targetWidth / elementWidth
  const scaleY = targetHeight / elementHeight

  // Use the smaller scale to ensure content fits
  // But limit maximum scale for quality
  return Math.min(scaleX, scaleY, 2.5)
}

export function getPageDimensions(format: string, orientation: string) {
  const formats = {
    a4: { width: 210, height: 297 },
    a3: { width: 297, height: 420 },
    letter: { width: 216, height: 279 },
  }

  const pageFormat = formats[format] || formats.a4

  return {
    width: orientation === "landscape" ? pageFormat.height : pageFormat.width,
    height: orientation === "landscape" ? pageFormat.width : pageFormat.height,
  }
}
