
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

type DriverStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

/**
 * Update driver status in the database
 * This implementation uses the Supabase client directly instead of REST API
 * for better reliability and built-in error handling
 */
export const updateDriverStatus = async (
  newStatus: DriverStatus
): Promise<{ success: boolean; data?: any; error?: string }> => {
  console.log(`🔄 Updating driver status to: ${newStatus}`);
  
  try {
    // Step 1: Get driver ID from localStorage
    const driverId = localStorage.getItem('driverId');
    if (!driverId) {
      console.error('❌ Driver ID not found in localStorage');
      return { 
        success: false, 
        error: 'Driver not authenticated' 
      };
    }

    // Step 2: If trying to set to AVAILABLE, check for active rides
    if (newStatus === 'AVAILABLE') {
      console.log('🔍 Checking for active rides before setting status to AVAILABLE');
      
      try {
        // Use the Supabase client for querying - more reliable than direct REST API calls
        const { data: activeRides, error } = await supabase
          .from('ride_requests')
          .select('id')
          .eq('driver_id', driverId)
          .in('status', ['accepted', 'en_route', 'picked_up']);
        
        console.log('📊 Active rides check result:', activeRides);
        
        if (error) {
          console.error('❌ Error checking active rides:', error);
          throw error;
        }
        
        if (activeRides && activeRides.length > 0) {
          console.warn('⚠️ Driver has active rides, cannot set status to AVAILABLE');
          return { 
            success: false, 
            error: 'Cannot set status to Available while you have active rides' 
          };
        }
      } catch (error: any) {
        console.error('❌ Error checking active rides:', error);
        return { 
          success: false, 
          error: error.message || 'Error checking active rides' 
        };
      }
    }
    
    // Step 3: Update the driver status using the Supabase client
    console.log(`📝 Updating driver ${driverId} is_available status to:`, newStatus === 'AVAILABLE');
    
    const { data: updatedDrivers, error } = await supabase
      .from('drivers')
      .update({ is_available: newStatus === 'AVAILABLE' })
      .eq('id', driverId)
      .select();
    
    if (error) {
      console.error('❌ Error updating driver status:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    if (!updatedDrivers || updatedDrivers.length === 0) {
      console.error('❌ No driver was updated');
      return {
        success: false,
        error: 'No driver was updated'
      };
    }
    
    // Step 4: Handle the response data
    const updatedDriver = updatedDrivers[0];
    console.log('✅ Driver status update response:', updatedDriver);
    
    // Step 5: Update localStorage with the new status to ensure persistence
    const existingDataStr = localStorage.getItem('driverData');
    let existingData = {};
    try {
      existingData = existingDataStr ? JSON.parse(existingDataStr) : {};
    } catch (e) {
      console.error('❌ Error parsing existing driver data:', e);
      // Continue with empty object if parsing fails
    }
    
    // Map the is_available to the appropriate status for the UI
    const derivedStatus = updatedDriver.is_available ? 'AVAILABLE' : 'OFFLINE';
    
    // Create a complete driver data object
    const updatedDriverData = {
      ...existingData,
      status: derivedStatus, 
      is_available: updatedDriver.is_available,
      // Ensure the ID is always included
      id: driverId
    };
    
    // Store the updated data in localStorage
    localStorage.setItem('driverData', JSON.stringify(updatedDriverData));
    console.log('💾 Updated localStorage with driver data:', updatedDriverData);
    
    // Return success with the updated data
    return { 
      success: true, 
      data: updatedDriverData 
    };
    
  } catch (error: any) {
    console.error('❌ Unexpected error updating driver status:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    };
  }
};

/**
 * Helper function to handle status updates with UI feedback
 * This implementation ensures consistent UI updates
 */
export const toggleDriverStatus = async (
  currentStatus: string,
  onStatusChanged: (newData: any) => void
) => {
  try {
    // Determine the new status based on the current one
    const newStatus = currentStatus === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
    
    // Show toast notification for status update
    const toastId = toast.loading(`Setting status to ${newStatus.toLowerCase()}...`);
    
    // Call the update function
    const result = await updateDriverStatus(newStatus as DriverStatus);
    
    // Dismiss loading toast
    toast.dismiss(toastId);
    
    if (result.success && result.data) {
      // Successful status change notification
      toast.success(`Status changed to ${newStatus.toLowerCase()}`);
      
      // Update the UI
      onStatusChanged(result.data);
      return true;
    } else {
      // Error notification
      toast.error(result.error || 'Failed to update status');
      return false;
    }
  } catch (error: any) {
    toast.dismiss();
    toast.error(error.message || 'An unexpected error occurred');
    return false;
  }
};
