import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import {
  homeOutline,
  businessOutline,
  peopleOutline,
  cardOutline,
  documentTextOutline,
  chatbubbleEllipsesOutline,
  barChartOutline,
  personCircleOutline,
} from 'ionicons/icons';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPayments from './pages/admin/AdminPayments';
import AdminResidents from './pages/admin/AdminResidents';
import AdminRooms from './pages/admin/AdminRooms';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminReports from './pages/admin/AdminReports';
import AdminProfilePage from './pages/admin/AdminProfile';
import ResidentDetail from './pages/admin/ResidentDetail';
import RoomDetail from './pages/admin/RoomDetail';

import ResidentDashboard from './pages/resident/ResidentDashboard';
import ResidentPay from './pages/resident/ResidentPay';
import ResidentPayments from './pages/resident/ResidentPayments';
import ResidentDocuments from './pages/resident/ResidentDocuments';
import ResidentComplaints from './pages/resident/ResidentComplaints';
import ResidentNotifications from './pages/resident/ResidentNotifications';
import ResidentProfilePage from './pages/resident/ResidentProfile';

setupIonicReact();

const AdminTabs: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/admin/dashboard" component={AdminDashboard} />
      <Route exact path="/admin/payments" component={AdminPayments} />
      <Route exact path="/admin/residents" component={AdminResidents} />
      <Route exact path="/admin/residents/:id" component={ResidentDetail} />
      <Route exact path="/admin/rooms" component={AdminRooms} />
      <Route exact path="/admin/rooms/:id" component={RoomDetail} />
      <Route exact path="/admin/complaints" component={AdminComplaints} />
      <Route exact path="/admin/reports" component={AdminReports} />
      <Route exact path="/admin/profile" component={AdminProfilePage} />
    </IonRouterOutlet>
    <IonTabBar slot="bottom">
      <IonTabButton tab="dashboard" href="/admin/dashboard">
        <IonIcon icon={homeOutline} />
        <IonLabel>Dashboard</IonLabel>
      </IonTabButton>
      <IonTabButton tab="payments" href="/admin/payments">
        <IonIcon icon={cardOutline} />
        <IonLabel>Verify</IonLabel>
      </IonTabButton>
      <IonTabButton tab="residents" href="/admin/residents">
        <IonIcon icon={peopleOutline} />
        <IonLabel>Residents</IonLabel>
      </IonTabButton>
      <IonTabButton tab="rooms" href="/admin/rooms">
        <IonIcon icon={businessOutline} />
        <IonLabel>Rooms</IonLabel>
      </IonTabButton>
      <IonTabButton tab="complaints" href="/admin/complaints">
        <IonIcon icon={chatbubbleEllipsesOutline} />
        <IonLabel>Issues</IonLabel>
      </IonTabButton>
      <IonTabButton tab="reports" href="/admin/reports">
        <IonIcon icon={barChartOutline} />
        <IonLabel>Reports</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/admin/profile">
        <IonIcon icon={personCircleOutline} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

const ResidentTabs: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/resident/dashboard" component={ResidentDashboard} />
      <Route exact path="/resident/pay" component={ResidentPay} />
      <Route exact path="/resident/payments" component={ResidentPayments} />
      <Route exact path="/resident/documents" component={ResidentDocuments} />
      <Route exact path="/resident/complaints" component={ResidentComplaints} />
      <Route exact path="/resident/notifications" component={ResidentNotifications} />
      <Route exact path="/resident/profile" component={ResidentProfilePage} />
    </IonRouterOutlet>
    <IonTabBar slot="bottom">
      <IonTabButton tab="home" href="/resident/dashboard">
        <IonIcon icon={homeOutline} />
        <IonLabel>Home</IonLabel>
      </IonTabButton>
      <IonTabButton tab="pay" href="/resident/pay">
        <IonIcon icon={cardOutline} />
        <IonLabel>Pay Rent</IonLabel>
      </IonTabButton>
      <IonTabButton tab="payments" href="/resident/payments">
        <IonIcon icon={documentTextOutline} />
        <IonLabel>History</IonLabel>
      </IonTabButton>
      <IonTabButton tab="complaints" href="/resident/complaints">
        <IonIcon icon={chatbubbleEllipsesOutline} />
        <IonLabel>Issues</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/resident/profile">
        <IonIcon icon={personCircleOutline} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/login" component={Login} />
        <Route
          path="/admin"
          render={() => (user?.role === 'admin' ? <AdminTabs /> : <Redirect to="/login" />)}
        />
        <Route
          path="/resident"
          render={() => (user?.role === 'resident' ? <ResidentTabs /> : <Redirect to="/login" />)}
        />
        <Route
          exact
          path="/"
          render={() => {
            if (!user) return <Redirect to="/login" />;
            return user.role === 'admin' ? <Redirect to="/admin/dashboard" /> : <Redirect to="/resident/dashboard" />;
          }}
        />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </IonApp>
);

export default App;
