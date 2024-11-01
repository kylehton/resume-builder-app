import React from "react";
import { Routes, Route } from "react-router-dom";
import './App.css';
import Resume from "./Resume";
import { NavbarProvider } from "./NavbarContext";
import Navbar from "./Components/Navbar";

// These Routes are for all the pages that we want a NavBar and later a Footer
const MainRoutes = () => {
  return (
            <NavbarProvider>
            <Navbar />
            <Routes>
              <Route exact path='/resume' element={<Resume />}/>
            </Routes>
          </NavbarProvider>
      
  );
};

export default MainRoutes;
