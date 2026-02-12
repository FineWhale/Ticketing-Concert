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
    <div className="auth-page">
      <Header
        onContactClick={() => console.log("Contact clicked")}
        onBookClick={() => navigate("/book-ticket")}
      />
      <div className="auth-container">
        <div className="profile-content">
          <Title level={2}>Profile</Title>
          <div className="profile-info">
            <Text strong>Name: </Text>
            <Text>
              {user.firstName} {user.lastName}
            </Text>
          </div>
          <div className="profile-info">
            <Text strong>Email: </Text>
            <Text>{user.email}</Text>
          </div>
          <Button type="primary" onClick={handleLogout} style={{ marginTop: 16 }}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
