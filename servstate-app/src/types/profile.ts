export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null; // ISO date string
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  avatar_url: string | null;
  // Servicer-specific fields (nullable for borrowers)
  employee_id: string | null;
  department: string | null;
  manager_id: string | null;
  office_location: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  avatar_url?: string;
}

export interface ProfileWithUser extends UserProfile {
  user_email: string;
  user_name: string;
  user_role: string;
  user_avatar: string | null;
}
