"use client"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// Image data for the grid
const images = [
  { src: "/assets/21.webp", caption: "Zorith - L91" },
  { src: "/assets/22.webp", caption: "Mykar - L27" },
  { src: "/assets/23.webp", caption: "Thalon - V75" },
  { src: "/assets/24.webp", caption: "Vexra - N22" },
  { src: "/assets/25.webp", caption: "Drosin - X29" },
  { src: "/assets/26.webp", caption: "Ryndel - Y52" },
  { src: "/assets/27.webp", caption: "Korin - T18" },
  { src: "/assets/28.webp", caption: "Nymera - L50" },
  { src: "/assets/29.webp", caption: "Lektar - X43" },
  { src: "/assets/30.webp", caption: "Fexil - R50" },
  { src: "/assets/31.webp", caption: "Jaleth - N49" },
  { src: "/assets/32.webp", caption: "Torvik - Y15" },
  { src: "/assets/33.webp", caption: "Lumora - X82" },
  { src: "/assets/34.webp", caption: "Zekron - X99" },
  { src: "/assets/35.webp", caption: "Brynd - Q89" },
  { src: "/assets/36.webp", caption: "Solmir - Q91" },
  { src: "/assets/37.webp", caption: "Dareon - N38" },
  { src: "/assets/38.webp", caption: "Noxil - T76" },
  { src: "/assets/39.webp", caption: "Kairon - R28" },
  { src: "/assets/40.webp", caption: "Voric - T97" },
]

// Repeat the images to have more content
const allImages = [...images, ...images, ...images, ...images, ...images]

export default function ElasticGridScroll() {
  const gridRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const currentColumnCountRef = useRef<number | null>(null)
  const scrollTriggersRef = useRef<ScrollTrigger[]>([])

  // Lag configuration constants
  const baseLag = 0.15
  const lagScale = 0.08

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    // Capture original grid items
    const originalItems = Array.from(grid.querySelectorAll(".grid__item"))

    const groupItemsByColumn = () => {
      const gridStyles = window.getComputedStyle(grid)
      const columnsRaw = gridStyles.getPropertyValue("grid-template-columns")
      const numColumns = columnsRaw.split(" ").filter(Boolean).length
      const columns: HTMLElement[][] = Array.from({ length: numColumns }, () => [])

      grid.querySelectorAll(".grid__item").forEach((item, index) => {
        columns[index % numColumns].push(item as HTMLElement)
      })

      return { columns, numColumns }
    }

    const clearGrid = () => {
      // Kill existing ScrollTriggers
      scrollTriggersRef.current.forEach(st => st.kill())
      scrollTriggersRef.current = []
      
      // Remove column wrappers
      grid.querySelectorAll(".grid__column").forEach((col) => col.remove())
      
      // Restore original items
      originalItems.forEach((item) => {
        gsap.set(item, { clearProps: "all" })
        grid.appendChild(item)
      })
    }

    const buildGrid = (columns: HTMLElement[][], numColumns: number) => {
      const fragment = document.createDocumentFragment()
      const mid = (numColumns - 1) / 2
      const columnContainers: { element: HTMLElement; lag: number }[] = []

      columns.forEach((column, i) => {
        const distance = Math.abs(i - mid)
        const lag = baseLag + distance * lagScale

        const columnContainer = document.createElement("div")
        columnContainer.className = "grid__column"

        column.forEach((item) => columnContainer.appendChild(item))

        fragment.appendChild(columnContainer)
        columnContainers.push({ element: columnContainer, lag })
      })

      grid.appendChild(fragment)
      return columnContainers
    }

    const applyLagEffects = (columnContainers: { element: HTMLElement; lag: number }[]) => {
      columnContainers.forEach(({ element, lag }) => {
        // Create a ScrollTrigger-based parallax effect
        const st = ScrollTrigger.create({
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: lag * 2, // Use lag as scrub smoothing factor
          onUpdate: (self) => {
            const progress = self.progress
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
            const offset = scrollHeight * progress * lag * 0.5
            gsap.set(element, { y: -offset })
          }
        })
        scrollTriggersRef.current.push(st)
      })
    }

    const init = () => {
      clearGrid()
      const { columns, numColumns } = groupItemsByColumn()
      currentColumnCountRef.current = numColumns
      const columnContainers = buildGrid(columns, numColumns)
      applyLagEffects(columnContainers)
      ScrollTrigger.refresh()
    }

    const getColumnCount = () => {
      const styles = getComputedStyle(grid)
      return styles.getPropertyValue("grid-template-columns").split(" ").filter(Boolean).length
    }

    const handleResize = () => {
      const newColumnCount = getColumnCount()
      if (newColumnCount !== currentColumnCountRef.current) {
        init()
      }
    }

    // Preload images
    const preloadImages = () => {
      const imageElements = grid.querySelectorAll(".grid__item-img")
      let loadedCount = 0
      const totalImages = imageElements.length

      if (totalImages === 0) {
        setIsLoading(false)
        init()
        return
      }

      imageElements.forEach((imgEl) => {
        const bgImage = window.getComputedStyle(imgEl).backgroundImage
        const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/)
        
        if (urlMatch && urlMatch[1]) {
          const img = new Image()
          img.onload = img.onerror = () => {
            loadedCount++
            if (loadedCount >= totalImages) {
              setIsLoading(false)
              init()
            }
          }
          img.src = urlMatch[1]
        } else {
          loadedCount++
          if (loadedCount >= totalImages) {
            setIsLoading(false)
            init()
          }
        }
      })
    }

    window.addEventListener("resize", handleResize)
    
    // Small delay to ensure DOM is ready
    const timeout = setTimeout(preloadImages, 100)

    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeout)
      scrollTriggersRef.current.forEach(st => st.kill())
    }
  }, [])

  return (
    <>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-bar" />
        </div>
      )}
      <main>
        <header className="frame">
          <h1 className="frame__title">Elastic Grid Scroll</h1>
          <nav className="frame__demos">
            <span className="active">V01</span>
          </nav>
          <p className="frame__info">Symmetrical outer column lag</p>
        </header>
        <div className="grid" ref={gridRef}>
          {allImages.map((image, index) => (
            <figure className="grid__item" key={index}>
              <div
                className="grid__item-img"
                style={{ backgroundImage: `url(${image.src})` }}
              />
              <figcaption className="grid__item-caption">{image.caption}</figcaption>
            </figure>
          ))}
        </div>
      </main>
    </>
  )
}
