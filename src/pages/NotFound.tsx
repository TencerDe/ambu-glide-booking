
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-red-500">404</h1>
        <p className="text-xl text-gray-700 mb-2">Page not found</p>
        <p className="text-gray-500 mb-6">
          The page you are looking for doesn't exist or has been moved.
          <br />
          <span className="text-sm italic">
            Path: {location.pathname}
          </span>
        </p>
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
