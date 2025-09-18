-- Collaborative Document Editor Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  theme_preference TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content JSONB DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}',
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_edited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1
);

-- Create document_permissions table
CREATE TABLE IF NOT EXISTS document_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  permission_level TEXT CHECK (permission_level IN ('view', 'edit', 'admin')) DEFAULT 'view',
  granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- Create document_versions table for version history
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version INTEGER NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create active_collaborators table for real-time presence
CREATE TABLE IF NOT EXISTS active_collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cursor_position JSONB,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_collaborators ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view documents they have access to" ON documents;
DROP POLICY IF EXISTS "Users can create documents" ON documents;
DROP POLICY IF EXISTS "Users can update documents they have edit access to" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

DROP POLICY IF EXISTS "Users can manage permissions for their documents" ON document_permissions;
DROP POLICY IF EXISTS "Users can view permissions for accessible documents" ON document_permissions;

DROP POLICY IF EXISTS "Users can view versions of accessible documents" ON document_versions;
DROP POLICY IF EXISTS "Users can create versions of accessible documents" ON document_versions;

DROP POLICY IF EXISTS "Users can manage collaborators for accessible documents" ON active_collaborators;

-- Create RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS Policies for documents
CREATE POLICY "Users can view documents they have access to" ON documents 
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    EXISTS (
      SELECT 1 FROM document_permissions 
      WHERE document_id = documents.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents" ON documents 
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update documents they have edit access to" ON documents 
  FOR UPDATE USING (
    auth.uid() = owner_id OR 
    EXISTS (
      SELECT 1 FROM document_permissions 
      WHERE document_id = documents.id AND user_id = auth.uid() AND permission_level IN ('edit', 'admin')
    )
  );

CREATE POLICY "Users can delete own documents" ON documents 
  FOR DELETE USING (auth.uid() = owner_id);

-- Create RLS Policies for document_permissions
CREATE POLICY "Users can manage permissions for their documents" ON document_permissions 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND owner_id = auth.uid())
  );

CREATE POLICY "Users can view permissions for accessible documents" ON document_permissions 
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND owner_id = auth.uid())
  );

-- Create RLS Policies for document_versions
CREATE POLICY "Users can view versions of accessible documents" ON document_versions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE id = document_id AND (
        owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM document_permissions 
          WHERE document_permissions.document_id = documents.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create versions of accessible documents" ON document_versions 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE id = document_id AND (
        owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM document_permissions 
          WHERE document_permissions.document_id = documents.id AND user_id = auth.uid() AND permission_level IN ('edit', 'admin')
        )
      )
    )
  );

-- Create RLS Policies for active_collaborators
CREATE POLICY "Users can manage collaborators for accessible documents" ON active_collaborators 
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM documents 
      WHERE id = document_id AND (
        owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM document_permissions 
          WHERE document_permissions.document_id = documents.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_permissions_document_id ON document_permissions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_permissions_user_id ON document_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_collaborators_document_id ON active_collaborators(document_id);
CREATE INDEX IF NOT EXISTS idx_active_collaborators_last_seen ON active_collaborators(last_seen);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📋 Tables created: profiles, documents, document_permissions, document_versions, active_collaborators';
  RAISE NOTICE '🔒 Row Level Security policies applied';
  RAISE NOTICE '🎯 Ready to use the Document Editor!';
END $$;
