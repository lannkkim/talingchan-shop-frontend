"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCart, checkout, CheckoutInput } from "@/services/cart";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Typography,
  Layout,
  Card,
  Button,
  Upload,
  message,
  App,
  ConfigProvider,
  QRCode,
  Spin,
} from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { useState } from "react";
import { useTranslations } from "next-intl";

const bottegaTheme = {
  token: {
    borderRadius: 0,
    colorPrimary: "#000000",
    fontFamily: "var(--font-inter)",
    colorText: "#000000",
    colorBgContainer: "#ffffff",
    colorBorder: "#e5e5e5",
  },
  components: {
    Button: {
      borderRadius: 0,
      controlHeight: 48,
      fontWeight: 500,
      primaryColor: "#ffffff",
      defaultBorderColor: "#000000",
      defaultColor: "#000000",
    },
    Input: {
      borderRadius: 0,
      controlHeight: 48,
      activeBorderColor: "#000000",
      hoverBorderColor: "#000000",
    },
    Layout: {
      bodyBg: "#ffffff",
      siderBg: "#ffffff",
    },
    Menu: {
      itemSelectedColor: "#000000",
      itemSelectedBg: "#f5f5f5",
      itemActiveBg: "#f5f5f5",
      itemHoverBg: "#fafafa",
      subMenuItemBg: "#ffffff",
    },
    Typography: {
      fontFamily: "var(--font-inter)",
    },
    InputNumber: {
      borderRadius: 0,
      activeBorderColor: "#000000",
      hoverBorderColor: "#000000",
    },
  },
};

const { Title, Text } = Typography;
const { Content } = Layout;

export default function CartPayPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const addressId = searchParams.get("addressId");
  const t = useTranslations("CartPage");
  const tCart = useTranslations("Cart");
  const { modal } = App.useApp();

  const [slipFile, setSlipFile] = useState<File | null>(null);

  const { data: cartData, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });
  const cartItems = cartData || [];

  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.product.price || 0);
    return acc + price * item.quantity;
  }, 0);

  const shippingFee = cartItems.reduce((acc, item) => {
    return acc + Number(item.product.shipping_fee || 0) * item.quantity;
  }, 0);

  const total = subtotal + shippingFee;

  const checkoutMutation = useMutation({
    mutationFn: (data: CheckoutInput) => checkout(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      modal.success({
        title: t("success"),
        content: t("successContent", { orderIds: data.order_ids.join(", ") }),
        onOk: () => {
          router.push("/profile?tab=purchases");
        },
      });
    },
    onError: (error: any) => {
      modal.error({
        title: t("error"),
        content: error.response?.data?.error || "ไม่สามารถทำรายการได้",
      });
    },
  });

  const handleConfirmPayment = () => {
    if (!addressId) {
      message.error(t("selectShippingAddress"));
      router.push("/cart");
      return;
    }

    if (!slipFile) {
      message.error("กรุณาแนบสลิปการโอนเงินก่อนยืนยัน");
      return;
    }

    // Usually slip file upload via an API to S3 occurs here if supported by the backend checkout flow.
    // For now, the user requested only the UI blocker. We trigger the checkout directly.

    modal.confirm({
      title: "ยืนยันการชำระเงิน",
      content: "คุณแน่ใจหรือไม่ว่าต้องการยืนยันการชำระเงินนี้?",
      okText: t("confirm"),
      cancelText: t("cancel"),
      onOk: () => {
        checkoutMutation.mutate({
          shipping_address_id: addressId,
          payment_type_id: "42430f49-e9d3-4678-b95a-a144b4aa88b6", // QR PromptPay UUID from DB
          cart_item_ids: [],
        });
      },
    });
  };

  if (isLoading) {
    return (
      <Layout className="min-h-screen flex items-center justify-center bg-white">
        <Spin size="large" />
      </Layout>
    );
  }

  // Generate PromptPay URL (Placeholder logic - replace with actual generator if logic exists)
  // Standard format relies on phone number / citizen ID + Amount
  const promptPayNumber = "0812345678"; // Replace with your Talingchan official promptpay number
  const qrCodeText = `PROMPTPAY: ${promptPayNumber} AMOUNT: ${total}`; 

  return (
    <ConfigProvider theme={bottegaTheme}>
      <Layout className="min-h-screen bg-white">
        <PageHeader title={tCart("title")} subtitle="Payment" />

        <Content className="p-8 bg-gray-50 flex-1 flex justify-center py-12">
          <div className="max-w-xl w-full">
            <div className="mb-6 flex items-center">
              <Link href="/cart">
                <Button type="text" icon={<ArrowLeftOutlined />}>
                  Back to Cart
                </Button>
              </Link>
            </div>

            <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
              <div className="p-8 text-center border-b border-gray-100">
                <Title level={4} className="!mb-6 uppercase tracking-widest text-gray-500">
                  Scan to Pay
                </Title>
                
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm inline-block">
                    <QRCode
                      value={qrCodeText}
                      size={200}
                      icon="/images/icon/logo.png"
                      iconSize={40}
                      errorLevel="H"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg inline-block text-center border border-blue-100 min-w-[200px]">
                  <Text type="secondary" className="block text-xs uppercase tracking-wider mb-1 text-blue-600">Total Amount</Text>
                  <Title level={2} className="!mb-0 !text-blue-800">฿{total.toLocaleString()}</Title>
                </div>
              </div>

              <div className="p-8 bg-white">
                <Title level={5} className="mb-4">Upload Payment Slip</Title>
                <div className="mb-8">
                  <Upload.Dragger
                    accept="image/*"
                    maxCount={1}
                    beforeUpload={(file) => {
                      setSlipFile(file);
                      return false; // Prevent auto-upload if no backend API is handling it explicitly yet
                    }}
                    onRemove={() => setSlipFile(null)}
                    className="bg-gray-50 border-gray-300 hover:border-blue-500 transition-colors"
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined className="text-3xl text-gray-400" />
                    </p>
                    <p className="ant-upload-text font-medium text-gray-800">
                      Click or drag slip image to this area to upload
                    </p>
                    <p className="ant-upload-hint text-gray-500 px-4">
                      Support for a single image upload (JPG, PNG).
                    </p>
                  </Upload.Dragger>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  className="h-14 text-lg shadow-md font-medium"
                  onClick={handleConfirmPayment}
                  disabled={!slipFile || checkoutMutation.isPending}
                  loading={checkoutMutation.isPending}
                >
                  Confirm Payment
                </Button>
              </div>
            </Card>
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
