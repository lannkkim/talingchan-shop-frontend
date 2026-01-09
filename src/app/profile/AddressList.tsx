"use client";

import React, { useState } from "react";
import { Button, Card, Typography, Tag, Space, Empty, Popconfirm, App } from "antd";
import { PlusOutlined, DeleteOutlined, StarOutlined, StarFilled, EnvironmentOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAddresses, deleteAddress, setDefaultAddress } from "@/services/address";
import AddAddressModal from "./AddAddressModal";
import { Address } from "@/types/address";

const { Title, Text } = Typography;

export default function AddressList() {
    const { message } = App.useApp();
    const queryClient = useQueryClient();
    const [modalVisible, setModalVisible] = useState(false);

    const { data: addresses = [], isLoading } = useQuery({
        queryKey: ["addresses"],
        queryFn: getAddresses,
    });

    const handleDelete = async (id: number) => {
        try {
            await deleteAddress(id);
            message.success("Address deleted");
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
        } catch (error) {
            message.error("Failed to delete address");
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await setDefaultAddress(id);
            message.success("Default address updated");
             queryClient.invalidateQueries({ queryKey: ["addresses"] });
        } catch (error) {
            message.error("Failed to update default address");
        }
    };

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                     <Title level={4} className="!mb-0">My Addresses</Title>
                     <Text type="secondary">Manage your shipping and shop addresses</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                    Add New Address
                </Button>
            </div>

            {isLoading ? (
               <div className="text-center py-8">Loading...</div>
            ) : addresses.length === 0 ? (
                <Empty description="No addresses found" />
            ) : (
                <div className="space-y-4">
                    {addresses.map((addr: Address) => (
                        <Card key={addr.address_id} size="small" className={`border-1 ${addr.is_default ? 'border-blue-300 bg-blue-50/20' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Text strong className="text-base">{addr.name}</Text>
                                        <div className="space-x-1">
                                            {addr.is_default && <Tag color="blue">Default</Tag>}
                                            <Tag>{addr.address_type?.name || 'Shipping'}</Tag>
                                        </div>
                                    </div>
                                    <div className="text-gray-600 flex gap-2 items-start mt-2">
                                         <EnvironmentOutlined className="mt-1 text-gray-400" />
                                         <span>
                                            {addr.address}<br/>
                                            {addr.sub_district}, {addr.district}<br/>
                                            {addr.province} {addr.zipcode}
                                         </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    {!addr.is_default && (
                                        <Button size="small" type="text" onClick={() => handleSetDefault(addr.address_id)}>
                                            Set as Default
                                        </Button>
                                    )}
                                    <Popconfirm title="Delete this address?" onConfirm={() => handleDelete(addr.address_id)}>
                                        <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <AddAddressModal 
                visible={modalVisible} 
                onClose={() => setModalVisible(false)}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ["addresses"] })}
            />
        </div>
    );
}
