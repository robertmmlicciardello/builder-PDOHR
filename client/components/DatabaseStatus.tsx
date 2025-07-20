import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "./ui/badge";
import { PersonnelService } from "../services/firebase";
import { PositionService } from "../services/hrDatabase";

interface DatabaseStatusProps {
  className?: string;
}

export const DatabaseStatus: React.FC<DatabaseStatusProps> = ({
  className = "",
}) => {
  const [status, setStatus] = useState<{
    connected: boolean;
    testing: boolean;
    error?: string;
  }>({
    connected: false,
    testing: true,
  });

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test both Firebase and HR database connections
        await Promise.all([
          PersonnelService.getPersonnel(),
          PositionService.getPositions(),
        ]);

        setStatus({ connected: true, testing: false });
      } catch (error: any) {
        setStatus({
          connected: false,
          testing: false,
          error: error.message,
        });
      }
    };

    testConnection();
  }, []);

  if (status.testing) {
    return (
      <Badge
        variant="secondary"
        className={`gap-2 ${className}`}
        title="Testing database connection..."
      >
        <AlertCircle className="h-3 w-3" />
        Testing...
      </Badge>
    );
  }

  if (status.connected) {
    return (
      <Badge
        variant="default"
        className={`gap-2 bg-green-600 hover:bg-green-700 ${className}`}
        title="Database connected successfully"
      >
        <CheckCircle className="h-3 w-3" />
        DB Connected
      </Badge>
    );
  }

  return (
    <Badge
      variant="destructive"
      className={`gap-2 ${className}`}
      title={`Database connection failed: ${status.error}`}
    >
      <XCircle className="h-3 w-3" />
      DB Error
    </Badge>
  );
};

export default DatabaseStatus;
