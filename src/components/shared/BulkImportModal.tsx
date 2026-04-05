"use client";

import { useState } from "react";
import { Modal, Upload, Button, Alert, Table, Typography, Space } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";

const { Dragger } = Upload;
const { Text } = Typography;

export interface BulkImportResult {
  imported: number;
  errors?: { row: number; message: string }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<BulkImportResult>;
  title: string;
  csvDescription: string;
  loading?: boolean;
}

export default function BulkImportModal({ open, onClose, onImport, title, csvDescription }: Props) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setFileList([]);
    setResult(null);
    setError(null);
    onClose();
  };

  const handleImport = async () => {
    const file = fileList[0]?.originFileObj as File | undefined;
    if (!file) return;
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const res = await onImport(file);
      setResult(res);
      setFileList([]);
    } catch (e: any) {
      setError(e?.response?.data?.error || "เกิดข้อผิดพลาด");
    } finally {
      setImporting(false);
    }
  };

  const errorColumns = [
    { title: "แถว", dataIndex: "row", key: "row", width: 80 },
    { title: "ข้อผิดพลาด", dataIndex: "message", key: "message" },
  ];

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      destroyOnHidden
      footer={
        result ? (
          <Button type="primary" onClick={handleClose}>ปิด</Button>
        ) : (
          <Space>
            <Button onClick={handleClose}>ยกเลิก</Button>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={handleImport}
              disabled={fileList.length === 0}
              loading={importing}
            >
              นำเข้า
            </Button>
          </Space>
        )
      }
      width={600}
    >
      {!result ? (
        <div className="space-y-4">
          <Text type="secondary" className="block">{csvDescription}</Text>
          <Dragger
            accept=".csv"
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
            maxCount={1}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">คลิกหรือลากไฟล์ CSV มาที่นี่</p>
          </Dragger>
          {error && <Alert type="error" message={error} showIcon />}
        </div>
      ) : (
        <div className="space-y-4">
          <Alert
            type={result.errors?.length ? "warning" : "success"}
            message={`นำเข้าสำเร็จ ${result.imported} รายการ${result.errors?.length ? `, ผิดพลาด ${result.errors.length} รายการ` : ""}`}
            showIcon
          />
          {result.errors && result.errors.length > 0 && (
            <Table
              columns={errorColumns}
              dataSource={result.errors}
              rowKey="row"
              size="small"
              pagination={{ pageSize: 10 }}
            />
          )}
        </div>
      )}
    </Modal>
  );
}
