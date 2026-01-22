"use client";

import { Spin } from "antd";

interface LoadingSpinnerProps {
  size?: "small" | "default" | "large";
  tip?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingSpinner({
  size = "large",
  tip,
  fullScreen = true,
  className = "",
}: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? "flex justify-center items-center min-h-screen"
    : "flex justify-center items-center py-20";

  return (
    <div className={`${containerClass} ${className}`}>
      <Spin size={size} tip={tip} />
    </div>
  );
}
