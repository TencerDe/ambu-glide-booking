
-- Create ride_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ride_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  age INTEGER NOT NULL,
  ambulance_type TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  notes TEXT,
  hospital TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  charge INTEGER NOT NULL DEFAULT 5000, -- Fixed charge of 5000 rupees
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  driver_id UUID REFERENCES public.drivers(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add realtime support for the ride_requests table
ALTER TABLE public.ride_requests REPLICA IDENTITY FULL;

-- Enable publication for real-time updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END
$$;

-- Add table to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_requests;
