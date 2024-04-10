import React from 'react';
import { Tabs, Tab } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const TabsNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Function to handle tab change
  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };

  // Determine the current tab based on the location
  const currentTab = location.pathname;

  return (
    <Tabs value={currentTab} onChange={handleTabChange}>
      <Tab label="Markets" value="/" />
      <Tab label="Create Market" value="/create-market" />
      <Tab label="Portfolio" value="/portfolio" />
    </Tabs>
  );
};

export default TabsNavigation;
