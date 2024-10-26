import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Dashboard from "./Dashboard";
import MainRoutes from "./MainRoutes";

// These Routes are for all the Pages where we don't want the navbar or footer
const App = () => {
  return (
    <BrowserRouter>

            <Routes>
              <Route exact path='/dashboard' element={<Dashboard />}/>
              {/* Below is where the router pulls in the routes with the navbar and footer
              Above this is where the pages with no navbar or footer should go*/ }
              <Route path="*" element={<MainRoutes/>}/>
            </Routes>
      
    </BrowserRouter>
  );
};

export default App;
