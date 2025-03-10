/* eslint-disable react/prop-types */
import { Layout } from "antd";
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";

const { Content } = Layout;

function MyLayout({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Header />

      {/* Layout with Sidebar and Content */}
      <Layout style={{ display: "flex", flexDirection: "row" }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <Layout style={{ padding: "10px" }}>
          <Content>{children}</Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default MyLayout;
