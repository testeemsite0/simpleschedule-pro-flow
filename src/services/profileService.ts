
import { supabase } from "@/integrations/supabase/client";
import { Professional } from "@/types";

export const fetchUserProfile = async (userId: string): Promise<Professional | null> => {
  try {
    console.log("Fetching user profile for ID:", userId);
    
    // Use .select().eq().maybeSingle() instead of .select().eq().single()
    // for better handling when no row is found
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      // More detailed log about the error
      console.log("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      return null;
    }
    
    if (!profile) {
      console.log("No profile found for user ID:", userId);
      return null;
    }
    
    console.log("User profile fetched:", profile);
    return profile;
  } catch (error) {
    console.error("Unexpected error fetching profile:", error);
    return null;
  }
};

export const createUserProfile = async (userId: string, userData: any): Promise<Professional | null> => {
  try {
    const { data: authUser } = await supabase.auth.getUser(userId);
    
    if (authUser && authUser.user) {
      const slug = userData.slug || 
                   authUser.user.user_metadata?.slug || 
                   authUser.user.email?.split('@')[0]?.toLowerCase() || 
                   'user';
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: userData.name || authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'User',
          email: authUser.user.email || userData.email || '',
          profession: userData.profession || authUser.user.user_metadata?.profession || 'Não especificado',
          slug: slug
        })
        .select()
        .single();
        
      if (createError) {
        console.error("Error creating user profile:", createError);
        return null;
      }
      
      console.log("Created new profile for user:", newProfile);
      return newProfile;
    } else {
      console.error("Unable to retrieve auth user data for profile creation");
      return null;
    }
  } catch (getUserError) {
    console.error("Error getting user data for profile creation:", getUserError);
    return null;
  }
};
