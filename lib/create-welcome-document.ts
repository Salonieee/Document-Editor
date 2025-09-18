export const createWelcomeDocument = (userId: string) => {
  return {
    title: "Welcome to Document Editor",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Welcome to your new collaborative document editor! 🎉",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Here's what you can do:",
            },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "bold" }],
                      text: "Format text",
                    },
                    {
                      type: "text",
                      text: " - Make text bold, italic, underlined, or change colors",
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      marks: [{ type: "italic" }],
                      text: "Align text",
                    },
                    {
                      type: "text",
                      text: " - Left, center, right, or justify alignment",
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Create lists and organize content",
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Share documents with others for real-time collaboration",
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Insert images and media",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Start editing this document or create a new one from your dashboard. Happy writing!",
            },
          ],
        },
      ],
    },
    owner_id: userId,
  }
}
