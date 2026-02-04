import { ConfigProvider, Input, InputNumber } from "antd";
import { clsx } from "clsx";
import React, { useState } from "react";

interface FloatingLabelInputProps {
  label: string;
  value?: any;
  onChange?: (value: any) => void;
  type?: "text" | "number" | "password" | "textarea";
  className?: string;
  status?: "" | "warning" | "error";
  placeholder?: string;
  suffix?: React.ReactNode;
  max?: number;
  min?: number;
  rows?: number;
  disabled?: boolean;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  className,
  status,
  placeholder,
  suffix,
  max,
  min,
  rows,
  disabled,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && value !== "";

  // Bottega Veneta Theme for this specific input
  const inputTheme = {
    components: {
      Input: {
        borderRadius: 0,
        colorBgContainer: "transparent",
        colorBorder: "transparent",
        activeBorderColor: "transparent",
        hoverBorderColor: "transparent",
        activeShadow: "none",
        paddingInline: 0,
        paddingBlock: 4, // Reduce padding as we set fixed controlHeight
        controlHeight: 48,
        fontSize: 16,
      },
      InputNumber: {
        borderRadius: 0,
        colorBgContainer: "transparent",
        colorBorder: "transparent",
        activeBorderColor: "transparent",
        hoverBorderColor: "transparent",
        activeShadow: "none",
        paddingInline: 0,
        paddingBlock: 4,
        controlHeight: 48,
        fontSize: 16,
      },
    },
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <ConfigProvider theme={inputTheme}>
      <div
        className={clsx(
          "relative border-b border-gray-300 transition-colors duration-300 h-[64px]",
          {
            "!border-black": isFocused && status !== "error",
            "!border-gray-200": !isFocused && !hasValue && status !== "error",
            "!border-gray-300": hasValue && !isFocused && status !== "error",
            "!border-red-500": status === "error",
            "opacity-50 cursor-not-allowed": disabled,
          },
          className,
        )}
      >
        <span
          className={clsx(
            "absolute left-0 transition-all duration-200 pointer-events-none z-10",
            {
              "top-1 text-xs": isFocused || hasValue,
              "top-6 text-base": !isFocused && !hasValue,
              "text-gray-400": !isFocused && !hasValue && status !== "error",
              "text-black": (isFocused || hasValue) && status !== "error",
              "text-red-500": status === "error",
            },
          )}
        >
          {label}
        </span>

        <div className="absolute bottom-0 left-0 w-full">
          {type === "number" ? (
            <InputNumber
              value={value}
              onChange={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full !bg-transparent"
              controls={false}
              status={status}
              placeholder={isFocused ? placeholder : ""}
              suffix={suffix}
              max={max}
              min={min}
              disabled={disabled}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) =>
                value?.replace(/\$\s?|(,*)/g, "") as unknown as number
              }
              style={{ height: '40px', border: 'none', boxShadow: 'none' }}
            />
          ) : type === "textarea" ? (
            <Input.TextArea
              value={value}
              onChange={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full !px-0 !bg-transparent !resize-none"
              status={status}
              placeholder={isFocused ? placeholder : ""}
              rows={rows || 3}
              disabled={disabled}
              style={{ border: 'none', boxShadow: 'none' }}
            />
          ) : (
            <Input
              value={value}
              onChange={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              type={type}
              className="w-full !px-0 !bg-transparent"
              status={status}
              placeholder={isFocused ? placeholder : ""}
              suffix={suffix}
              disabled={disabled}
              style={{ height: '40px', border: 'none', boxShadow: 'none' }}
            />
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};
