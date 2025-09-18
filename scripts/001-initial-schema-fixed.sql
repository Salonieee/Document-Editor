-- Collaborative Document Editor Database Schema (Fixed)
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS active_collaborators CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
DROP TABLE IF EXISTS document_permissions CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  theme_preference TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
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
CREATE TABLE document_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  permission_level TEXT CHECK (permission_level IN ('view', 'edit', 'admin')) DEFAULT 'view',
  granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- Create document_versions table for version history
CREATE TABLE document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version INTEGER NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create active_collaborators table for real-time presence
CREATE TABLE active_collaborators (
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

-- Simple, non-recursive RLS Policies

-- Profiles policies
CREATE POLICY "profiles_select_own" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Documents policies (simplified to avoid recursion)
CREATE POLICY "documents_select_owner" ON documents 
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "documents_insert_owner" ON documents 
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "documents_update_owner" ON documents 
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "documents_delete_owner" ON documents 
  FOR DELETE USING (auth.uid() = owner_id);

-- Document permissions policies
CREATE POLICY "permissions_select_owner" ON document_permissions 
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM documents WHERE documents.id = document_id AND documents.owner_id = auth.uid())
  );

CREATE POLICY "permissions_insert_owner" ON document_permissions 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = document_id AND documents.owner_id = auth.uid())
  );

CREATE POLICY "permissions_update_owner" ON document_permissions 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = document_id AND documents.owner_id = auth.uid())
  );

CREATE POLICY "permissions_delete_owner" ON document_permissions 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = document_id AND documents.owner_id = auth.uid())
  );

-- Document versions policies
CREATE POLICY "versions_select_owner" ON document_versions 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = document_id AND documents.owner_id = auth.uid())
  );

CREATE POLICY "versions_insert_owner" ON document_versions 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM documents WHERE documents.id = document_id AND documents.owner_id = auth.uid())
  );

-- Active collaborators policies
CREATE POLICY "collaborators_select_all" ON active_collaborators 
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM documents WHERE documents.id = document_id AND documents.owner_id = auth.uid())
  );

CREATE POLICY "collaborators_insert_own" ON active_collaborators 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "collaborators_update_own" ON active_collaborators 
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "collaborators_delete_own" ON active_collaborators 
  FOR DELETE USING (user_id = auth.uid());

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
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_documents_owner_id ON documents(owner_id);
CREATE INDEX idx_documents_updated_at ON documents(updated_at DESC);
CREATE INDEX idx_document_permissions_document_id ON document_permissions(document_id);
CREATE INDEX idx_document_permissions_user_id ON document_permissions(user_id);
CREATE INDEX idx_active_collaborators_document_id ON active_collaborators(document_id);
CREATE INDEX idx_active_collaborators_last_seen ON active_collaborators(last_seen);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📋 Tables created: profiles, documents, document_permissions, document_versions, active_collaborators';
  RAISE NOTICE '🔒 Simple RLS policies applied (no recursion)';
  RAISE NOTICE '🎯 Ready to use the Document Editor!';
END $$;
