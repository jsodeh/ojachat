import { supabase } from '@/lib/supabase';

/**
 * Check if the current user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    // Check if the user has an admin role
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    if (error || !data) {
      return false;
    }
    
    return data.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Assign admin role to a user
 */
export async function assignAdminRole(userId: string): Promise<boolean> {
  try {
    // First check if the current user is admin
    const isCurrentUserAdmin = await isAdmin();
    if (!isCurrentUserAdmin) {
      throw new Error('Only admins can assign admin roles');
    }
    
    // Assign admin role to the user
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });
    
    return !error;
  } catch (error) {
    console.error('Error assigning admin role:', error);
    return false;
  }
}

/**
 * Remove admin role from a user
 */
export async function removeAdminRole(userId: string): Promise<boolean> {
  try {
    // First check if the current user is admin
    const isCurrentUserAdmin = await isAdmin();
    if (!isCurrentUserAdmin) {
      throw new Error('Only admins can remove admin roles');
    }
    
    // Remove admin role from the user
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');
    
    return !error;
  } catch (error) {
    console.error('Error removing admin role:', error);
    return false;
  }
} 