import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-myanmar-gray-light">
      <div className="text-center">
        <div className="w-24 h-24 bg-myanmar-red rounded-full flex items-center justify-center mx-auto mb-8">
          <div className="text-white text-3xl font-bold">✊</div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-myanmar-black">404</h1>
        <p className="text-xl text-myanmar-gray-dark mb-4">Page not found</p>
        <p className="text-myanmar-gray-dark mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/login">
          <Button className="bg-myanmar-red hover:bg-myanmar-red-dark text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Login
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
