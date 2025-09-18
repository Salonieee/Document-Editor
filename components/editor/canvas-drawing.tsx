"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Palette, Eraser, Trash2, Download, Undo, Redo } from "lucide-react"
import { toast } from "sonner"

interface CanvasDrawingProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (dataUrl: string) => void
}

interface DrawingState {
  paths: Path[]
  currentPath: Path | null
}

interface Path {
  points: Point[]
  color: string
  width: number
  tool: "pen" | "eraser"
}

interface Point {
  x: number
  y: number
}

export function CanvasDrawing({ open, onOpenChange, onSave }: CanvasDrawingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<"pen" | "eraser">("pen")
  const [currentColor, setCurrentColor] = useState("#000000")
  const [currentWidth, setCurrentWidth] = useState([3])
  const [drawingState, setDrawingState] = useState<DrawingState>({ paths: [], currentPath: null })
  const [history, setHistory] = useState<DrawingState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const colors = [
    "#000000",
    "#374151",
    "#DC2626",
    "#EA580C",
    "#D97706",
    "#65A30D",
    "#059669",
    "#0891B2",
    "#2563EB",
    "#7C3AED",
    "#C026D3",
    "#EC4899",
  ]

  useEffect(() => {
    if (open) {
      // Reset canvas when opened
      setDrawingState({ paths: [], currentPath: null })
      setHistory([])
      setHistoryIndex(-1)
      clearCanvas()
    }
  }, [open])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const redrawCanvas = (state: DrawingState) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    clearCanvas()

    // Draw all paths
    state.paths.forEach((path) => {
      if (path.points.length < 2) return

      ctx.beginPath()
      ctx.strokeStyle = path.color
      ctx.lineWidth = path.width
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      if (path.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"
      } else {
        ctx.globalCompositeOperation = "source-over"
      }

      ctx.moveTo(path.points[0].x, path.points[0].y)
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y)
      }
      ctx.stroke()
    })

    // Draw current path
    if (state.currentPath && state.currentPath.points.length > 1) {
      const path = state.currentPath
      ctx.beginPath()
      ctx.strokeStyle = path.color
      ctx.lineWidth = path.width
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      if (path.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"
      } else {
        ctx.globalCompositeOperation = "source-over"
      }

      ctx.moveTo(path.points[0].x, path.points[0].y)
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y)
      }
      ctx.stroke()
    }

    ctx.globalCompositeOperation = "source-over"
  }

  const saveToHistory = (state: DrawingState) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(state)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const pos = getMousePos(e)

    const newPath: Path = {
      points: [pos],
      color: currentColor,
      width: currentWidth[0],
      tool: currentTool,
    }

    setDrawingState((prev) => ({ ...prev, currentPath: newPath }))
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const pos = getMousePos(e)

    setDrawingState((prev) => {
      if (!prev.currentPath) return prev

      const updatedPath = {
        ...prev.currentPath,
        points: [...prev.currentPath.points, pos],
      }

      const newState = { ...prev, currentPath: updatedPath }
      redrawCanvas(newState)
      return newState
    })
  }

  const stopDrawing = () => {
    if (!isDrawing) return

    setIsDrawing(false)

    setDrawingState((prev) => {
      if (!prev.currentPath) return prev

      const newState = {
        paths: [...prev.paths, prev.currentPath],
        currentPath: null,
      }

      saveToHistory(newState)
      return newState
    })
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const state = history[newIndex]
      setDrawingState(state)
      setHistoryIndex(newIndex)
      redrawCanvas(state)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const state = history[newIndex]
      setDrawingState(state)
      setHistoryIndex(newIndex)
      redrawCanvas(state)
    }
  }

  const clearAll = () => {
    const newState = { paths: [], currentPath: null }
    setDrawingState(newState)
    saveToHistory(newState)
    clearCanvas()
  }

  const downloadDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "drawing.png"
    link.href = canvas.toDataURL()
    link.click()
  }

  const saveDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL("image/png")
    onSave(dataUrl)
    onOpenChange(false)
    toast.success("Drawing added to document!")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Canvas Drawing</DialogTitle>
          <DialogDescription>Draw something and add it to your document.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-4 p-2 border rounded-lg">
            {/* Tool Selection */}
            <div className="flex items-center gap-2">
              <Button
                variant={currentTool === "pen" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool("pen")}
              >
                <Palette className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === "eraser" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool("eraser")}
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Color Selection */}
            {currentTool === "pen" && (
              <div className="flex items-center gap-2">
                <Label className="text-sm">Color:</Label>
                <div className="flex gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded border-2 ${
                        currentColor === color ? "border-gray-800" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCurrentColor(color)}
                    />
                  ))}
                </div>
              </div>
            )}

            <Separator orientation="vertical" className="h-6" />

            {/* Brush Size */}
            <div className="flex items-center gap-2">
              <Label className="text-sm">Size:</Label>
              <div className="w-24">
                <Slider value={currentWidth} onValueChange={setCurrentWidth} max={20} min={1} step={1} />
              </div>
              <span className="text-sm w-6">{currentWidth[0]}</span>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={downloadDrawing}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="border rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="cursor-crosshair bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>

          {/* Save Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={saveDrawing}>Add to Document</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
