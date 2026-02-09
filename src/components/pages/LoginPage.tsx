import React from "react";
import { Form, Input, Typography, Button } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    console.log("Login:", values);
  };

  return (
    <div className="auth-page">
      <div className="header-bar">
        <img src="/images/logo.png" alt="Logo" className="logo-header" />
        <div className="header-actions">
          <span className="contact-link">Contact</span>
          <button className="book-btn">Book Now</button>
        </div>
      </div>

      <div className="auth-container">
        <div className="left-section">
          <img src="public/images/beachboy-login.jpg" alt="Beach" />
          <div className="overlay" />
        </div>

        <div className="right-section">
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

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="submit-btn"
              >
                Login
              </Button>
            </Form.Item>

            <Text className="bottom-text">
              Don't have an account?{" "}
              <span className="link-btn" onClick={() => navigate("/register")}>
                Register here
              </span>
            </Text>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
