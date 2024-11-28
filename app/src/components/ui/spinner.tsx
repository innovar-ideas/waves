import React, { useEffect, useState } from "react";
// import classNames from "classnames";

interface SpinnerProps {
  size?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = "6" }) => {
  const [isSpinning, setIsSpinning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSpinning(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center">
      {isSpinning && (
        <div
          className={`w-${size} h-${size} animate-spin rounded-full border-4 border-dashed border-gray-500`}
        ></div>
      )}
    </div>
  );
};

export default Spinner;
