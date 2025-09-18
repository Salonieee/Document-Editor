"use client"

import type React from "react"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface FallbackEditorProps {
  content: any
  onUpdate: (content: any) => void
  editable?: boolean
}

export function FallbackEditor({ content, onUpdate, editable = true }: FallbackEditorProps) {
  const [text, setText] = useState(() => {
    // Extract text from Tiptap JSON content
    if (content?.content) {
      return content.content
        .map((node: any) => {
          if (node.content) {
            return node.content.map((textNode: any) => textNode.text || "").join("")
          }
          return ""
        })
        .join("\n")
    }
    return ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)

    // Convert plain text back to Tiptap JSON format
    const paragraphs = newText.split("\n").map((line) => ({
      type: "paragraph",
      content: line
        ? [
            {
              type: "text",
              text: line,
            },
          ]
        : [],
    }))

    onUpdate({
      type: "doc",
      content: paragraphs,
    })
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Alert className="rounded-none border-x-0 border-t-0">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Rich text editor failed to load. Using fallback text editor. Some formatting features may not be available.
        </AlertDescription>
      </Alert>
      <div className="p-4">
        <Textarea
          value={text}
          onChange={handleChange}
          disabled={!editable}
          className="min-h-[500px] border-none resize-none focus-visible:ring-0"
          placeholder="Start writing your document here..."
        />
      </div>
    </div>
  )
}
