import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LandingHomePage } from './LandingHomePage';
import { InspectorCommandCenter } from '../components/command-center/InspectorCommandCenter';
import { LegalReviewerCommandCenter } from '../components/command-center/LegalReviewerCommandCenter';
import { AdminCommandCenter } from '../components/command-center/AdminCommandCenter';
import { CustomerCommandCenter } from '../components/command-center/CustomerCommandCenter';

export const HomeDashboard = () => {
  const { user } = useAuth();

  // If not logged in, display the Public Landing / Homepage & Login Station
  if (!user) {
    return <LandingHomePage />;
  }

  switch (user.role) {
    case 'reviewer':
      return <LegalReviewerCommandCenter />;
    case 'admin':
      return <AdminCommandCenter />;
    case 'customer':
    case 'citizen':
      return <CustomerCommandCenter />;
    case 'inspector':
    default:
      return <InspectorCommandCenter />;
  }
};

export default HomeDashboard;

