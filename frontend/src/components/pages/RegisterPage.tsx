import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { Header } from "../organisms";
import { AuthTemplate } from "../templates";
import { useAuthContext } from "../../context/AuthContext";

const { Title, Text } = Typography;

const inputClass =
  "!rounded-full !bg-[#f0f0f0] !border-none !px-6 !h-14 !text-base [&.ant-input-focused]:!bg-[#e8e8e8] [&.ant-input-focused]:!shadow-none [&.ant-input-focused]:!border-transparent";

const passwordInputClass = `
  !rounded-full !bg-[#f0f0f0] !border-none !px-6 !h-14 !text-base
  [&.ant-input-affix-wrapper]:!rounded-full
  [&.ant-input-affix-wrapper]:!bg-[#f0f0f0]
  [&.ant-input-affix-wrapper]:!border-none
  [&.ant-input-affix-wrapper]:!px-6
  [&.ant-input-affix-wrapper]:!h-14
  [&.ant-input-affix-wrapper-focused]:!bg-[#e8e8e8]
  [&.ant-input-affix-wrapper-focused]:!shadow-none
  [&.ant-input-affix-wrapper-focused]:!border-transparent
  [&_input]:!bg-transparent
  [&_input]:!border-none
  [&_input]:!shadow-none
  [&_input]:!outline-none
`;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
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
          onContactClick={() => navigate("/")}
          onBookClick={() => navigate("/book-ticket")}
        />
      }
    >
      <Form
        name="register"
        onFinish={onFinish}
        className="w-[520px] max-w-full m-0"
        layout="vertical"
      >
        <Title className="text-4xl font-bold text-[#1a1a1a] mb-10 text-left !mb-10">
          Create Account
        </Title>

        <Form.Item
          name="firstName"
          label={
            <span className="font-normal text-[15px] text-[#1a1a1a]">
              First Name
            </span>
          }
          rules={[{ required: true, message: "First name required" }]}
        >
          <Input placeholder="Enter first name" className={inputClass} />
        </Form.Item>

        <Form.Item
          name="lastName"
          label={
            <span className="font-normal text-[15px] text-[#1a1a1a]">
              Last Name
            </span>
          }
          rules={[{ required: true, message: "Last name required" }]}
        >
          <Input placeholder="Enter last name" className={inputClass} />
        </Form.Item>

        <Form.Item
          name="email"
          label={
            <span className="font-normal text-[15px] text-[#1a1a1a]">
              Email
            </span>
          }
          rules={[
            { required: true, type: "email", message: "Valid email required" },
          ]}
        >
          <Input placeholder="Enter your email" className={inputClass} />
        </Form.Item>

        <Form.Item
          name="password"
          label={
            <span className="font-normal text-[15px] text-[#1a1a1a]">
              Password
            </span>
          }
          rules={[{ required: true, message: "Password required" }]}
        >
          <Input.Password
            placeholder="Create password"
            className={passwordInputClass}
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
          <span className="text-[#000000] text-[15px]">
            Already have an account?{" "}
          </span>
          <span
            className="text-primary cursor-pointer text-[15px] hover:underline"
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </Text>
      </Form>
    </AuthTemplate>
  );
};

export default RegisterPage;
