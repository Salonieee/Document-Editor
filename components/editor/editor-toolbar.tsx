"use client"

import type React from "react"

import type { Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ImageIcon,
  Palette,
  Upload,
  PenTool,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState, useRef } from "react"
import { toast } from "sonner"
import { CanvasDrawing } from "./canvas-drawing"

interface EditorToolbarProps {
  editor: Editor
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [canvasDialogOpen, setCanvasDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUrl = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run()
      setImageUrl("")
      setImageDialogOpen(false)
      toast.success("Image added successfully!")
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    setUploading(true)

    try {
      // Convert file to base64 data URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        editor.chain().focus().setImage({ src: dataUrl }).run()
        setImageDialogOpen(false)
        toast.success("Image uploaded successfully!")
        setUploading(false)
      }
      reader.onerror = () => {
        toast.error("Failed to read image file")
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload image")
      setUploading(false)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCanvasSave = (dataUrl: string) => {
    editor.chain().focus().setImage({ src: dataUrl }).run()
  }

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run()
  }

  const getCurrentFontSize = () => {
    const fontSize = editor.getAttributes("textStyle").fontSize
    return fontSize ? fontSize.replace("px", "") : "16"
  }

  const setFontSize = (size: string) => {
    if (size === "default") {
      editor.chain().focus().unsetFontSize().run()
    } else {
      editor.chain().focus().setFontSize(`${size}px`).run()
    }
  }

  return (
    <div className="border-b p-2 flex flex-wrap items-center gap-1">
      {/* Font Family */}
      <Select
        value={editor.getAttributes("textStyle").fontFamily || "Inter"}
        onValueChange={(value) => {
          if (value === "default") {
            editor.chain().focus().unsetFontFamily().run()
          } else {
            editor.chain().focus().setFontFamily(value).run()
          }
        }}
      >
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default</SelectItem>
          <SelectItem value="Inter" className="font-inter">
            Inter (Clean)
          </SelectItem>
          <SelectItem value="Libre Baskerville" className="font-libre-baskerville">
            Libre Baskerville (Serif)
          </SelectItem>
          <SelectItem value="JetBrains Mono" className="font-jetbrains-mono">
            JetBrains Mono (Code)
          </SelectItem>
          <SelectItem value="Lora" className="font-lora">
            Lora (Elegant)
          </SelectItem>
          <SelectItem value="Dancing Script" className="font-dancing-script">
            Dancing Script (Cursive)
          </SelectItem>
          <SelectItem value="Fredoka One" className="font-fredoka-one">
            Fredoka One (Playful)
          </SelectItem>
          <SelectItem value="Orbitron" className="font-orbitron">
            Orbitron (Futuristic)
          </SelectItem>
          <SelectItem value="Creepster" className="font-creepster">
            Creepster (Horror)
          </SelectItem>
          <SelectItem value="Arial" style={{ fontFamily: "Arial" }}>
            Arial (System)
          </SelectItem>
          <SelectItem value="Georgia" style={{ fontFamily: "Georgia" }}>
            Georgia (System)
          </SelectItem>
          <SelectItem value="Times New Roman" style={{ fontFamily: "Times New Roman" }}>
            Times New Roman
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Font Size */}
      <Select value={getCurrentFontSize()} onValueChange={setFontSize}>
        <SelectTrigger className="w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Auto</SelectItem>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="12">12</SelectItem>
          <SelectItem value="14">14</SelectItem>
          <SelectItem value="16">16</SelectItem>
          <SelectItem value="18">18</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="24">24</SelectItem>
          <SelectItem value="28">28</SelectItem>
          <SelectItem value="32">32</SelectItem>
          <SelectItem value="36">36</SelectItem>
          <SelectItem value="48">48</SelectItem>
          <SelectItem value="64">64</SelectItem>
          <SelectItem value="72">72</SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Formatting */}
      <Button
        variant={editor.isActive("bold") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive("italic") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive("underline") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>

      {/* Text Color */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" title="Text Color">
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="grid grid-cols-6 gap-2">
            {[
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
            ].map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded border-2 border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => setColor(color)}
                title={color}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Alignment */}
      <Button
        variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive({ textAlign: "justify" }) ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        title="Justify"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists */}
      <Button
        variant={editor.isActive("bulletList") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive("orderedList") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Media */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" title="Insert Image">
            <ImageIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>Upload an image from your device or enter an image URL.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="image-upload">Upload from device</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  disabled={uploading}
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Browse"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF, WebP (max 5MB)</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleImageUrl()
                    }
                  }}
                />
                <Button onClick={handleImageUrl} disabled={!imageUrl.trim()}>
                  Insert
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Canvas Drawing */}
      <Button variant="ghost" size="sm" title="Draw on Canvas" onClick={() => setCanvasDialogOpen(true)}>
        <PenTool className="h-4 w-4" />
      </Button>

      <CanvasDrawing open={canvasDialogOpen} onOpenChange={setCanvasDialogOpen} onSave={handleCanvasSave} />
    </div>
  )
}
