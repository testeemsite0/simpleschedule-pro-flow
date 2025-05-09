
import React from "react";
import { Button } from "@/components/ui/button";

interface WalkInButtonProps {
  show: boolean;
  onClick: () => void;
}

export const WalkInButton: React.FC<WalkInButtonProps> = ({
  show,
  onClick
}) => {
  if (!show) return null;
  
  return (
    <Button 
      variant="secondary" 
      size="sm"
      onClick={onClick}
    >
      Encaixe Imediato
    </Button>
  );
};
