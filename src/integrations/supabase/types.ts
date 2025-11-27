export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
        }
        Relationships: []
      }
      changelog_entries: {
        Row: {
          component: string | null
          created_at: string | null
          id: string
          notes: string
          released_at: string
          title: string
          version: string
        }
        Insert: {
          component?: string | null
          created_at?: string | null
          id?: string
          notes: string
          released_at?: string
          title: string
          version: string
        }
        Update: {
          component?: string | null
          created_at?: string | null
          id?: string
          notes?: string
          released_at?: string
          title?: string
          version?: string
        }
        Relationships: []
      }
      code_projects: {
        Row: {
          code: string
          created_at: string | null
          id: string
          language: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          code?: string
          created_at?: string | null
          id?: string
          language: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          language?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      docs: {
        Row: {
          author_id: string | null
          content_markdown: string
          created_at: string | null
          id: string
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content_markdown: string
          created_at?: string | null
          id?: string
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content_markdown?: string
          created_at?: string | null
          id?: string
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          daily_runs_limit: number | null
          daily_runs_used: number | null
          email: string
          font_size: string | null
          full_name: string | null
          id: string
          last_run_reset: string | null
          preferred_font: string | null
          subscription_tier: string | null
          theme: string | null
          tts_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_runs_limit?: number | null
          daily_runs_used?: number | null
          email: string
          font_size?: string | null
          full_name?: string | null
          id: string
          last_run_reset?: string | null
          preferred_font?: string | null
          subscription_tier?: string | null
          theme?: string | null
          tts_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_runs_limit?: number | null
          daily_runs_used?: number | null
          email?: string
          font_size?: string | null
          full_name?: string | null
          id?: string
          last_run_reset?: string | null
          preferred_font?: string | null
          subscription_tier?: string | null
          theme?: string | null
          tts_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      roadmap_items: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          status: string
          title: string
          votes: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          status: string
          title: string
          votes?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          status?: string
          title?: string
          votes?: number | null
        }
        Relationships: []
      }
      roadmap_votes: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_votes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "roadmap_items"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorial_progress: {
        Row: {
          id: string
          last_step: number | null
          percent_complete: number | null
          tutorial_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          last_step?: number | null
          percent_complete?: number | null
          tutorial_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          last_step?: number | null
          percent_complete?: number | null
          tutorial_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutorial_progress_tutorial_id_fkey"
            columns: ["tutorial_id"]
            isOneToOne: false
            referencedRelation: "tutorials"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorials: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          difficulty: string
          id: string
          language: string | null
          steps_json: Json
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          difficulty: string
          id?: string
          language?: string | null
          steps_json?: Json
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          difficulty?: string
          id?: string
          language?: string | null
          steps_json?: Json
          title?: string
        }
        Relationships: []
      }
      usage: {
        Row: {
          chat_count: number | null
          code_runs: number | null
          date: string
          id: string
          user_id: string
          wiki_lookups: number | null
        }
        Insert: {
          chat_count?: number | null
          code_runs?: number | null
          date?: string
          id?: string
          user_id: string
          wiki_lookups?: number | null
        }
        Update: {
          chat_count?: number | null
          code_runs?: number | null
          date?: string
          id?: string
          user_id?: string
          wiki_lookups?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          settings: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          settings?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          settings?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wiki_cache: {
        Row: {
          cached_at: string
          id: string
          summary: string
          term: string
        }
        Insert: {
          cached_at?: string
          id?: string
          summary: string
          term: string
        }
        Update: {
          cached_at?: string
          id?: string
          summary?: string
          term?: string
        }
        Relationships: []
      }
      wiki_usage: {
        Row: {
          count: number
          date: string
          id: string
          user_id: string
        }
        Insert: {
          count?: number
          date?: string
          id?: string
          user_id: string
        }
        Update: {
          count?: number
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_roadmap_votes: { Args: { item_id: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_roadmap_votes: { Args: { item_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
