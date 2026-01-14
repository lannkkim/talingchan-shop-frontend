"use client";

import React, { useEffect, useState } from "react";
import { Layout, Spin, App } from "antd";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import PageHeader from "@/components/shared/PageHeader";

const { Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        message.error("Please login first");
        router.push("/");
        return;
      }

      if (user.role?.name !== "admin") {
        message.error("Access denied. Admin privileges required.");
        router.push("/");
        return;
      }

      setIsAuthorized(true);
    }
  }, [user, loading, router]);

  if (loading || !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Spin size="large" />
        <div className="mt-4 text-gray-600 font-medium">Verifying access...</div>
        <div className="mt-2 text-gray-500 text-sm border p-2 rounded bg-gray-50">
          Loading: {loading ? "Yes" : "No"} <br/>
          User: {user ? user.username : "None"} <br/>
          Role: {user?.role ? user.role.name : "None"}
        </div>
      </div>
    );
  }

  return (
    <Layout className="min-h-screen">
      {/* We need PageHeader here. But PageHeader is fixed/sticky usually or part of main layout. 
          AdminLayout is a child of RootLayout? RootLayout might already validly checking current path? 
          Root layout usually just wraps children. 
          The user explicitly asked to "put header in admin page too".
      */}
      {/* Since PageHeader logic is self-contained (auth check), we can just import it. */}
      {/* However, AdminSidebar is a Sider. Antd Layout structure: Layout -> (Sider, Layout -> (Header, Content, Footer)) */}
      <AdminSidebar />
      <Layout>
         {/* We probably don't want the default PageHeader sticking out if it conflicts with Sidebar style. 
             But user asked for it. Let's put it on top of content area or inside the inner Layout.*/}
             
         {/* Note: Original PageHeader has sticky behavior and specific container/logo logic used for Public pages.
             For Admin, maybe we want a simpler header or re-use it. User said "take header to admin page".
         */}
         {/* Issue: PageHeader contains Navigation Menu. Admin pages usually don't need "Cards", "Products" links taking space?
             User wants the button to enter admin, and header in admin.
         */}
        <div className="bg-white">
             {/* Dynamic title? */}
            <PageHeader title="Admin Dashboard" /> 
        </div>
        
        <Content className="p-8">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
