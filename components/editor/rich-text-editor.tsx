"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextAlign } from "@tiptap/extension-text-align"
import { FontFamily } from "@tiptap/extension-font-family"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { Image } from "@tiptap/extension-image"
import { Underline } from "@tiptap/extension-underline"
import { useEffect, useState } from "react"
import { EditorToolbar } from "./editor-toolbar"
import { FallbackEditor } from "./fallback-editor"
import { createClient } from "@/lib/supabase/client"
import { FontSize } from "@/lib/extensions/FontSize"

interface RichTextEditorProps {
  content: any
  documentId: string
  onUpdate: (content: any) => void
  editable?: boolean
}

export default function RichTextEditor({
  content,
  documentId,
  onUpdate,
  editable = true,
}: RichTextEditorProps) {
  const [editorError, setEditorError] = useState(false)
  const supabase = createClient()

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      FontFamily,
      TextStyle,
      FontSize,
      Color,
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto",
        },
      }),
    ],
    content,
    editable,
    immediatelyRender: false, // ✅ SSR fix
    onUpdate: ({ editor }) => {
      try {
        const json = editor.getJSON()
        onUpdate(json)
      } catch (error) {
        console.error("Editor update failed:", error)
      }
    },
    onCreate: ({ editor }) => {
      console.log("Tiptap editor created successfully")
    },
  })

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!editor || !editable || editorError) return

    const saveInterval = setInterval(async () => {
      try {
        const content = editor.getJSON()

        await supabase
          .from("documents")
          .update({
            content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", documentId)
      } catch (error) {
        console.error("Auto-save failed:", error)
      }
    }, 5000)

    return () => clearInterval(saveInterval)
  }, [editor, documentId, editable, editorError]) // ✅ supabase removed

  // Show fallback if editor fails
  if (editorError || (!editor && editable)) {
    return <FallbackEditor content={content} onUpdate={onUpdate} editable={editable} />
  }

  // Loading state
  if (!editor) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="min-h-[500px] p-4 flex items-center justify-center">
          <div className="text-muted-foreground">Loading editor...</div>
        </div>
      </div>
    )
  }

  // Main Editor UI
  return (
    <div className="border rounded-lg overflow-hidden">
      {editable && <EditorToolbar editor={editor} />}
      <div className="min-h-[500px] p-4">
        <EditorContent
          editor={editor}
          className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none dark:prose-invert max-w-none"
        />
      </div>
    </div>
  )
}
