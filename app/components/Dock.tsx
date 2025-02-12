import { Dock, DockIcon } from "@/components/ui/dock";
import {
  FaLinkedin,
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaDiscord,
} from "react-icons/fa"; // Importing social media icons
import React from "react";

const DockComponent: React.FC = () => {
  return (
    <Dock
      className="flex items-center justify-center gap-4 p-4 bg-opacity-20 backdrop-blur-md rounded-full transition-all hover:bg-opacity-30"
      iconSize={50}
      iconMagnification={80}
      iconDistance={150}
      direction="middle"
    >
      {/* LinkedIn Icon */}
      <DockIcon
        size={50}
        magnification={80}
        distance={150}
        className="transform transition-all duration-300 ease-out hover:scale-110 hover:translate-y-[-10px] hover:opacity-100"
      >
        <a
          href="https://www.linkedin.com/company/invoice-stock/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaLinkedin size={30} className="text-[#0077B5]" />{" "}
          {/* LinkedIn Blue */}
        </a>
      </DockIcon>

      {/* Instagram Icon */}
      <DockIcon
        size={50}
        magnification={80}
        distance={150}
        className="transform transition-all duration-300 ease-out hover:scale-110 hover:translate-y-[-10px] hover:opacity-100"
      >
        <a
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram size={30} className="text-[#E1306C]" />{" "}
          {/* Instagram Color */}
        </a>
      </DockIcon>

      {/* Facebook Icon */}
      <DockIcon
        size={50}
        magnification={80}
        distance={150}
        className="transform transition-all duration-300 ease-out hover:scale-110 hover:translate-y-[-10px] hover:opacity-100"
      >
        <a
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebook size={30} className="text-[#1877F2]" />{" "}
          {/* Facebook Blue */}
        </a>
      </DockIcon>

      {/* Discord Icon */}
      <DockIcon
        size={50}
        magnification={80}
        distance={150}
        className="transform transition-all duration-300 ease-out hover:scale-110 hover:translate-y-[-10px] hover:opacity-100"
      >
        <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
          <FaDiscord size={30} className="text-[#7289DA]" />{" "}
          {/* Discord Blue */}
        </a>
      </DockIcon>

      {/* WhatsApp Icon */}
      <DockIcon
        size={50}
        magnification={80}
        distance={150}
        className="transform transition-all duration-300 ease-out hover:scale-110 hover:translate-y-[-10px] hover:opacity-100"
      >
        <a
          href="https://www.whatsapp.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaWhatsapp size={30} className="text-[#25D366]" />{" "}
          {/* WhatsApp Green */}
        </a>
      </DockIcon>
    </Dock>
  );
};

export default DockComponent;
