import { ConfigProvider, DatePicker } from "antd";
import { clsx } from "clsx";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/th";
import React, { useState } from "react";

// Set locale to Thai
dayjs.locale("th");

const { RangePicker } = DatePicker;

interface FloatingLabelRangePickerProps {
  label: string;
  value?: [Dayjs | null, Dayjs | null] | null;
  onChange?: (
    dates: [Dayjs | null, Dayjs | null] | null,
    dateStrings: [string, string],
  ) => void;
  status?: "" | "warning" | "error";
  className?: string;
  placeholder?: [string, string];
  disabled?: boolean;
}

export const FloatingLabelRangePicker: React.FC<
  FloatingLabelRangePickerProps
> = ({
  label,
  value,
  onChange,
  status,
  className,
  placeholder = ["", ""],
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Check if current value exists
  const hasValue = value && value[0] && value[1];

  // Specific theme for DatePicker to match Bottega minimalist style
  const datePickerTheme = {
    components: {
      DatePicker: {
        borderRadius: 0,
        activeBorderColor: "transparent",
        hoverBorderColor: "transparent",
        activeShadow: "none",
        colorBgContainer: "transparent",
        colorBorder: "transparent",
        cellRangeBorderColor: "transparent",
        cellActiveWithRangeBg: "#F3F3F3",
        cellHoverWithRangeBg: "#E5E5E5",
      },
      Button: {
        borderRadius: 0,
      },
    },
    token: {
      borderRadius: 0,
      colorPrimary: "#000000",
    },
  };

  return (
    <ConfigProvider theme={datePickerTheme}>
      <div
        className={clsx(
          "relative border-b border-gray-300 transition-colors duration-300",
          {
            "!border-black": isOpen && status !== "error",
            "!border-gray-200": !isOpen && !hasValue && status !== "error",
            "!border-gray-300": hasValue && !isOpen && status !== "error",
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
              "top-0 text-xs": isOpen || hasValue,
              "top-3 text-base": !isOpen && !hasValue,
              "text-gray-400": !isOpen && !hasValue && status !== "error",
              "text-black": (isOpen || hasValue) && status !== "error",
              "text-red-500": status === "error",
            },
          )}
        >
          {label}
        </span>

        <RangePicker
          value={value}
          onChange={onChange}
          onOpenChange={setIsOpen}
          bordered={false}
          className="w-full !px-0 !pb-0 !pt-2 !mt-4 !bg-transparent"
          placeholder={isOpen ? placeholder : ["", ""]}
          suffixIcon={null}
          allowClear={true}
          status={status}
          style={{ width: "100%" }}
          disabled={disabled}
          popupClassName="bottega-datepicker-popup" // We might need global CSS for popup if detailed custom is needed
          format="DD MMM YYYY"
        />
      </div>
    </ConfigProvider>
  );
};
