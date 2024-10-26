import React, { createContext, useState } from 'react';

export const NavbarContext = createContext();

export const NavbarProvider = ({ children }) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  return (
    <NavbarContext.Provider value={{ isNavbarOpen, toggleNavbar }}>
      {children}
    </NavbarContext.Provider>
  );
};