
import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface RideRequest {
  id: string;
  name: string;
  address: string;
  ambulanceType: string;
  vehicleType: string;
  status: string;
  createdAt: string;
  driver?: {
    id: string;
    name: string;
  };
}

interface RideRequestsProps {
  rides: RideRequest[];
  loading: boolean;
}

const RideRequests: React.FC<RideRequestsProps> = ({ rides, loading }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Ride Requests</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : rides.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Ambulance Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Driver</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rides.map((ride) => (
                <TableRow key={ride.id}>
                  <TableCell className="text-sm text-gray-500">
                    {typeof ride.id === 'string' ? ride.id.slice(0, 8) : ride.id}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-gray-900">{ride.name}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {ride.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(ride.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(ride.createdAt).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {ride.ambulanceType}<br />
                    <span className="text-xs">{ride.vehicleType}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ride.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : ride.status === 'accepted'
                        ? 'bg-blue-100 text-blue-800'
                        : ride.status === 'en route'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {ride.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {ride.driver ? ride.driver.name : 'Unassigned'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No ride requests found.</p>
        </div>
      )}
    </div>
  );
};

export default RideRequests;
