// Hand-maintained typing of the Neon Data API (PostgREST) schema, so the typed
// client reasons about query results instead of `any`. Add tables here as the
// schema grows (consider a codegen tool like `neon-js gen-types` once it does).
//
// The `__InternalSupabase.PostgrestVersion` marker is required — without it
// @neondatabase/postgrest-js can't infer row types and falls back to `any`.

export interface UserProfileRow {
	user_id: string;
	tier: string;
}

export interface Database {
	__InternalSupabase: { PostgrestVersion: '12' };
	public: {
		Tables: {
			user_profiles: {
				Row: UserProfileRow;
				Insert: { user_id: string; tier?: string };
				Update: { user_id?: string; tier?: string };
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
}
