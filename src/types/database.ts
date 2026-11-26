export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  dragonball: {
    Tables: {
      objets: {
        Row: {
          annee: number | null;
          categorie: Database["dragonball"]["Enums"]["categorie_objet"];
          cree_le: string;
          editeur: string | null;
          ere: Database["dragonball"]["Enums"]["ere_db"];
          id: string;
          image_url: string | null;
          marche: Database["dragonball"]["Enums"]["marche"];
          reference: string | null;
          slug: string;
          titre: string;
          titre_original: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          annee?: number | null;
          categorie: Database["dragonball"]["Enums"]["categorie_objet"];
          cree_le?: string;
          editeur?: string | null;
          ere: Database["dragonball"]["Enums"]["ere_db"];
          id?: string;
          image_url?: string | null;
          marche: Database["dragonball"]["Enums"]["marche"];
          reference?: string | null;
          slug: string;
          titre: string;
          titre_original?: string | null;
          updated_at?: string;
        };
        Update: {
          annee?: number | null;
          categorie?: Database["dragonball"]["Enums"]["categorie_objet"];
          cree_le?: string;
          editeur?: string | null;
          ere?: Database["dragonball"]["Enums"]["ere_db"];
          id?: string;
          image_url?: string | null;
          marche?: Database["dragonball"]["Enums"]["marche"];
          reference?: string | null;
          slug?: string;
          titre?: string;
          titre_original?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      possessions: {
        Row: {
          cree_le: string;
          objet_id: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          cree_le?: string;
          objet_id: string;
          user_id?: string;
        };
        Update: {
          cree_le?: string;
          objet_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "possessions_objet_id_fkey";
            columns: ["objet_id"];
            isOneToOne: false;
            referencedRelation: "objets";
            referencedColumns: ["id"];
          },
        ];
      };
      profils: {
        Row: {
          cree_le: string;
          pseudo: string;
          role: Database["dragonball"]["Enums"]["role_compte"];
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          cree_le?: string;
          pseudo: string;
          role?: Database["dragonball"]["Enums"]["role_compte"];
          user_id: string;
        };
        Update: {
          cree_le?: string;
          pseudo?: string;
          role?: Database["dragonball"]["Enums"]["role_compte"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      est_proprietaire: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      categorie_objet: "manga-livre" | "video" | "carte" | "jeu" | "figurine";
      ere_db: "dragon-ball" | "dbz" | "dbgt" | "dbs" | "daima" | "films";
      marche: "FR" | "JAP" | "US";
      role_compte: "proprietaire" | "collectionneur";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "dragonball"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  dragonball: {
    Enums: {
      categorie_objet: ["manga-livre", "video", "carte", "jeu", "figurine"],
      ere_db: ["dragon-ball", "dbz", "dbgt", "dbs", "daima", "films"],
      marche: ["FR", "JAP", "US"],
      role_compte: ["proprietaire", "collectionneur"],
    },
  },
} as const;
