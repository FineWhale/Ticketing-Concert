import React from "react";

interface AuthTemplateProps {
  children: React.ReactNode;
  header: React.ReactNode;
  backgroundImage?: string;
}

export const AuthTemplate: React.FC<AuthTemplateProps> = ({
  children,
  header,
  backgroundImage = "/images/beachboys-login.jpg",
}) => {
  return (
    <div className="min-h-screen bg-white">
      {header}

      <div className="mt-[72px] relative">
        <div className="fixed top-[72px] left-0 bottom-0 w-[50vw] z-[1] overflow-hidden md:block hidden">
          <img src={backgroundImage} alt="Beach" className="w-full h-full object-cover block" />
          <div className="absolute inset-0 z-[2]" />
        </div>

        <div className="md:ml-[50vw] p-10 md:p-20 flex flex-col justify-center items-center bg-white min-h-[calc(100vh-72px)] relative z-[10]">
          {children}
        </div>
      </div>
    </div>
  );
};
