import React from "react";
import { Form, Input, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { Header } from "../organisms";
import { AuthTemplate } from "../templates";

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    console.log("Login:", values);
  };

  return (
    <AuthTemplate
      header={
        <Header
          onContactClick={() => console.log("Contact clicked")}
          onBookClick={() => console.log("Book Now clicked")}
        />
      }
    >
      <Form
        name="login"
        onFinish={onFinish}
        className="auth-form"
        layout="vertical"
      >
        <Title className="auth-title">Login</Title>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Valid email required",
            },
          ]}
        >
          <Input placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Password required" }]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>

        <Form.Item className="auth-form-button-wrapper">
          <Button type="primary" htmlType="submit" className="submit-btn">
            Login
          </Button>
        </Form.Item>

        <Text className="auth-links">
          <span className="auth-links-text">Don't have an account? </span>
          <span
            className="auth-links-link"
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </Text>
      </Form>
    </AuthTemplate>
  );
};

export default LoginPage;
