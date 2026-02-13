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
        className="w-[520px] max-w-full m-0"
        layout="vertical"
      >
        <Title className="text-4xl font-bold text-[#1a1a1a] mb-10 text-left !mb-10">Create Account</Title>

        <Form.Item
          name="firstName"
          label={<span className="font-normal text-[15px] text-[#1a1a1a]">First Name</span>}
          rules={[{ required: true, message: "First name required" }]}
        >
          <Input 
            placeholder="Enter first name"
            className="!rounded-full !bg-[#f0f0f0] !border-none !px-6 !h-14 !text-base [&.ant-input-focused]:!bg-[#e8e8e8] [&.ant-input-focused]:!shadow-none [&.ant-input-focused]:!border-transparent"
          />
        </Form.Item>

        <Form.Item
          name="lastName"
          label={<span className="font-normal text-[15px] text-[#1a1a1a]">Last Name</span>}
          rules={[{ required: true, message: "Last name required" }]}
        >
          <Input 
            placeholder="Enter last name"
            className="!rounded-full !bg-[#f0f0f0] !border-none !px-6 !h-14 !text-base [&.ant-input-focused]:!bg-[#e8e8e8] [&.ant-input-focused]:!shadow-none [&.ant-input-focused]:!border-transparent"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={<span className="font-normal text-[15px] text-[#1a1a1a]">Email</span>}
          rules={[
            {
              required: true,
              type: "email",
              message: "Valid email required",
            },
          ]}
        >
          <Input 
            placeholder="Enter your email"
            className="!rounded-full !bg-[#f0f0f0] !border-none !px-6 !h-14 !text-base [&.ant-input-focused]:!bg-[#e8e8e8] [&.ant-input-focused]:!shadow-none [&.ant-input-focused]:!border-transparent"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span className="font-normal text-[15px] text-[#1a1a1a]">Password</span>}
          rules={[{ required: true, message: "Password required" }]}
        >
          <Input.Password 
            placeholder="Create password"
            className="[&_.ant-input-affix-wrapper]:!rounded-full [&_.ant-input-affix-wrapper]:!bg-[#f0f0f0] [&_.ant-input-affix-wrapper]:!border-none [&_.ant-input-affix-wrapper]:!px-6 [&_.ant-input-affix-wrapper]:!h-14 [&_.ant-input-affix-wrapper.ant-input-affix-wrapper-focused]:!bg-[#e8e8e8] [&_.ant-input-affix-wrapper.ant-input-affix-wrapper-focused]:!shadow-none [&_.ant-input-affix-wrapper.ant-input-affix-wrapper-focused]:!border-transparent [&_input]:!h-14 [&_input]:!leading-[56px] [&_input]:!p-0 [&_input]:!bg-transparent"
          />
        </Form.Item>

        <Form.Item className="flex justify-center mt-12 [&_.ant-form-item-control-input-content]:flex [&_.ant-form-item-control-input-content]:justify-center">
          <Button
            type="primary"
            htmlType="submit"
            className="!w-[260px] !h-14 !text-xl !font-semibold !bg-primary !border-none !rounded-full hover:!bg-primary-dark focus:!bg-primary-dark active:!bg-primary-dark"
            loading={loading}
          >
            Create Account
          </Button>
        </Form.Item>

        <Text className="text-left mt-10 block">
          <span className="text-[#000000] text-[15px]">Already have an account? </span>
          <span className="text-primary cursor-pointer text-[15px] hover:underline" onClick={() => navigate("/login")}>
            Login here
          </span>
        </Text>
      </Form>
    </AuthTemplate>
  );
};

export default RegisterPage;
