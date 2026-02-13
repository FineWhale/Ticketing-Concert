import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button } from "antd";
import { Header } from "../organisms";
import { useAuthContext } from "../../context/AuthContext";

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthContext();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      <Header
        onContactClick={() => console.log("Contact clicked")}
        onBookClick={() => navigate("/book-ticket")}
      />
      <div className="mt-[72px] relative">
        <div className="max-w-[520px] mx-auto px-6 py-12">
          <Title level={2} className="!mb-6">Profile</Title>
          <div className="mb-3 text-base">
            <Text strong>Name: </Text>
            <Text className="text-base">
              {user.firstName} {user.lastName}
            </Text>
          </div>
          <div className="mb-3 text-base">
            <Text strong>Email: </Text>
            <Text className="text-base">{user.email}</Text>
          </div>
          <Button 
            type="primary" 
            onClick={handleLogout} 
            className="mt-4 !bg-primary hover:!bg-primary-dark"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
