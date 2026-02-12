import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { Header } from "../organisms";
import { AuthTemplate } from "../templates";
import { authService } from "../../services/authService";

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    console.log("Register:", values);

    try {
      setLoading(true);
      await authService.register(values);
      message.success("Registration successful!");
      navigate("/");
    } catch (error: any) {
      message.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
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
        name="register"
        onFinish={onFinish}
        className="auth-form"
        layout="vertical"
      >
        <Title className="auth-title">Create Account</Title>

        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: "First name required" }]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, message: "Last name required" }]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

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
          <Input.Password placeholder="Create password" />
        </Form.Item>

        <Form.Item className="auth-form-button-wrapper">
          <Button
            type="primary"
            htmlType="submit"
            className="submit-btn"
            loading={loading}
          >
            Create Account
          </Button>
        </Form.Item>

        <Text className="auth-links">
          <span className="auth-links-text">Already have an account? </span>
          <span className="auth-links-link" onClick={() => navigate("/login")}>
            Login here
          </span>
        </Text>
      </Form>
    </AuthTemplate>
  );
};

export default RegisterPage;
