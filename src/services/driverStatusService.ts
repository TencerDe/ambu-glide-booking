
import { toast } from 'sonner';

const SUPABASE_URL = "https://lavfpsnvwyzpilmgkytj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdmZwc252d3l6cGlsbWdreXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYyNTYsImV4cCI6MjA2MjEwMjI1Nn0.fQ1m_bE_jBAp-1VGrDv3O-j0yK3z1uq-8N1E1SsOjwo";

type DriverStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

// Simple robust function to update driver status
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
      
      // Send a fetch with the right headers to match our data model
      const activeRidesResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/ride_requests?driver_id=eq.${driverId}&or=(status.eq.accepted,status.eq.en_route,status.eq.picked_up)`,
        {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      // Handle fetch errors
      if (!activeRidesResponse.ok) {
        const errorText = await activeRidesResponse.text();
        console.error('❌ Error checking active rides:', activeRidesResponse.status, errorText);
        return { 
          success: false, 
          error: 'Failed to check for active rides' 
        };
      }
      
      // Process the response
      const activeRides = await activeRidesResponse.json();
      console.log('📊 Active rides check result:', activeRides);
      
      if (activeRides && activeRides.length > 0) {
        console.warn('⚠️ Driver has active rides, cannot set status to AVAILABLE');
        return { 
          success: false, 
          error: 'Cannot set status to Available while you have active rides' 
        };
      }
    }
    
    // Step 3: Update the driver status
    console.log(`📝 Updating driver ${driverId} status`);
    
    // IMPORTANT: The table doesn't have a 'status' column according to the error
    // Only update the is_available field which does exist in the schema
    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/drivers?id=eq.${driverId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          is_available: newStatus === 'AVAILABLE'
        })
      }
    );
    
    // Handle update errors
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Driver status update failed:', updateResponse.status, errorText);
      return { 
        success: false, 
        error: `Failed to update status: ${updateResponse.statusText}` 
      };
    }
    
    // Parse the response data
    const responseData = await updateResponse.json();
    console.log('✅ Driver status update response:', responseData);
    
    // Update localStorage with new status
    if (responseData && responseData.length > 0) {
      const updatedDriver = responseData[0];
      console.log('💾 Updating localStorage with driver data:', updatedDriver);
      
      // Get existing driver data to merge with new data
      const existingDataStr = localStorage.getItem('driverData');
      const existingData = existingDataStr ? JSON.parse(existingDataStr) : {};
      
      // Map the is_available to an equivalent status for our UI
      const derivedStatus = updatedDriver.is_available ? 'AVAILABLE' : 'OFFLINE';
      
      // Update only the status-related fields
      const updatedDriverData = {
        ...existingData,
        status: derivedStatus, // Derive status from is_available for local use
        is_available: updatedDriver.is_available
      };
      
      localStorage.setItem('driverData', JSON.stringify(updatedDriverData));
      return { success: true, data: updatedDriverData };
    } else {
      console.error('⚠️ No driver data received from update response');
      return { 
        success: false, 
        error: 'No driver data received from update' 
      };
    }
  } catch (error: any) {
    // Catch any unexpected errors
    console.error('❌ Unexpected error updating driver status:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    };
  }
};

// Helper function to handle status updates with UI feedback
export const toggleDriverStatus = async (
  currentStatus: string,
  onStatusChanged: (newData: any) => void
) => {
  try {
    // Determine the new status based on the current one
    const newStatus = currentStatus === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
    toast.loading(`Setting status to ${newStatus.toLowerCase()}...`);
    
    // Call the update function
    const result = await updateDriverStatus(newStatus as DriverStatus);
    toast.dismiss();
    
    if (result.success && result.data) {
      toast.success(`Status changed to ${newStatus.toLowerCase()}`);
      onStatusChanged(result.data);
      return true;
    } else {
      toast.error(result.error || 'Failed to update status');
      return false;
    }
  } catch (error: any) {
    toast.dismiss();
    toast.error(error.message || 'An unexpected error occurred');
    return false;
  }
};
