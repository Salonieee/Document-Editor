# Collaborative Document Editor

A real-time collaborative document editor inspired by MS Word, built with Next.js, Supabase, and Tiptap.

## Features

- 🔐 **User Authentication** - Secure login/signup with email and password
- 📝 **Rich Text Editing** - Full-featured editor with formatting, images, and media
- 👥 **Real-Time Collaboration** - Multiple users can edit simultaneously with live updates
- 🔒 **Access Control** - Granular permissions with view and edit access levels
- 🌙 **Dark Mode** - Beautiful dark theme optimized for comfortable editing
- 💾 **Auto-Save** - Automatic document saving every 5 seconds
- 📱 **Responsive Design** - Works on all screen sizes

## Quick Start

### Setup Instructions

1. **Clone the repository**
   \`\`\`bash
   git clone repository-url
   cd collaborative-document-editor
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - **Important:** Disable email confirmation in your Supabase project:
     - Go to Authentication > Settings in your Supabase dashboard
     - Turn OFF "Enable email confirmations"
   - Create a `.env.local` file with your Supabase credentials:
     \`\`\`
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     \`\`\`

4. **Set up the database**
   - Run the SQL script in the Supabase SQL editor:
     - Run `scripts/001-initial-schema.sql`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open the application**
   - Navigate to `http://localhost:3000`
   - Create a new account - no email verification required!

## Database Schema

The application uses the following main tables:

- `profiles` - User profiles and preferences
- `documents` - Document content and metadata
- `document_permissions` - Access control and sharing permissions
- `document_versions` - Version history (ready for implementation)
- `active_collaborators` - Real-time presence tracking

## Technology Stack

- **Frontend:** Next.js 14, React, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Editor:** Tiptap (ProseMirror-based)
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **Deployment:** Vercel (recommended)

## Key Components

- `RichTextEditor` - Main document editing interface
- `EditorToolbar` - Rich text formatting controls
- `CollaboratorAvatars` - Real-time presence indicators
- `ShareDialog` - Document sharing interface
- `PermissionsDialog` - Access control management

## Development

### Adding New Features

1. **Rich Text Extensions** - Add new Tiptap extensions in the editor configuration
2. **Real-time Features** - Use Supabase real-time subscriptions
3. **Permissions** - Extend the permission system in the database schema

### Environment Variables

Required environment variables:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

## Deployment

1. **Deploy to Vercel**
   \`\`\`bash
   npm run build
   vercel --prod
   \`\`\`

2. **Set environment variables** in your Vercel dashboard

3. **Configure Supabase** with your production URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
