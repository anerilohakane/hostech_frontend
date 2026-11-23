import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonList,
  IonBadge,
  IonAlert,
  IonModal,
  IonInput,
  IonToast,
  IonButtons,
} from '@ionic/react';
import {
  personCircleOutline,
  mailOutline,
  callOutline,
  businessOutline,
  shieldCheckmarkOutline,
  logOutOutline,
  createOutline,
  lockClosedOutline,
  closeOutline,
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import { propertyService, settingsService, authService } from '../../services';
import { useHistory } from 'react-router-dom';

const AdminProfilePage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [appSettings, setAppSettings] = useState<any>(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    password: '',
  });

  const fetchData = async () => {
    try {
      const [props, sets, meRes] = await Promise.all([
        propertyService.getAll(),
        settingsService.getSettings(),
        authService.getMe(),
      ]);
      setProperties(props);
      setAppSettings(sets);
      if (meRes?.user) {
        setEditForm({
          name: meRes.user.name || '',
          phone: meRes.user.phone || '',
          password: '',
        });
      }
    } catch (err) {
      console.error('Error fetching admin profile data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    history.replace('/login');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.updateProfile({
        name: editForm.name,
        phone: editForm.phone,
        password: editForm.password ? editForm.password : undefined,
      });
      setToastMessage('Profile updated successfully!');
      setEditModalOpen(false);
      await refreshUser();
      await fetchData();
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Admin Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setEditModalOpen(true)}>
              <IonIcon icon={createOutline} slot="start" />
              Edit
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        {/* Profile Card */}
        <IonCard style={{ margin: '0 0 16px 0', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <IonCardContent style={{ padding: '24px 16px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#dbeafe',
                color: '#1d4ed8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '44px',
                marginBottom: '12px',
              }}
            >
              <IonIcon icon={personCircleOutline} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              {user?.name || 'Super Admin'}
            </h2>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#64748b' }}>
              PG Property Owner & Administrator
            </p>
            <IonBadge color="primary" style={{ padding: '4px 10px', fontSize: '12px' }}>
              SYSTEM ADMINISTRATOR
            </IonBadge>

            <div style={{ marginTop: '16px' }}>
              <IonButton size="small" fill="outline" onClick={() => setEditModalOpen(true)}>
                <IonIcon icon={createOutline} slot="start" />
                Edit Account Info
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Administrator Details */}
        <IonCard style={{ margin: '0 0 16px 0', border: '1px solid #e2e8f0' }}>
          <IonCardContent style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>
              Admin Account Info
            </h3>
            <IonList lines="full">
              <IonItem>
                <IonIcon icon={mailOutline} slot="start" color="primary" />
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Login Email</p>
                  <h4 style={{ fontWeight: '600' }}>{user?.email || 'admin@pgapp.com'}</h4>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonIcon icon={callOutline} slot="start" color="primary" />
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Contact Phone</p>
                  <h4 style={{ fontWeight: '600' }}>{editForm.phone || '9876543210'}</h4>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonIcon icon={shieldCheckmarkOutline} slot="start" color="primary" />
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>System Role</p>
                  <h4 style={{ fontWeight: '600' }}>Full Management Permissions</h4>
                  <small style={{ color: '#64748b' }}>Properties, Rooms, Rent, Approvals & Reports</small>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Managed Properties */}
        <IonCard style={{ margin: '0 0 16px 0', border: '1px solid #e2e8f0' }}>
          <IonCardContent style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>
              Managed PG Properties ({properties.length})
            </h3>
            <IonList lines="full">
              {properties.map((p) => (
                <IonItem key={p._id}>
                  <IonIcon icon={businessOutline} slot="start" color="secondary" />
                  <IonLabel>
                    <h4 style={{ fontWeight: '700' }}>{p.name}</h4>
                    <p style={{ color: '#475569', fontSize: '12px' }}>
                      {p.city}, {p.state} • Contact: {p.contactPerson} ({p.contactNumber})
                    </p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Payment & Settings Configuration */}
        <IonCard style={{ margin: '0 0 16px 0', border: '1px solid #e2e8f0' }}>
          <IonCardContent style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>
              PG Banking & Payment Configuration
            </h3>
            <IonList lines="full">
              <IonItem>
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Official UPI ID</p>
                  <h4 style={{ fontWeight: '700', color: '#2563eb' }}>
                    {appSettings?.upiId || 'pgmanagement@okhdfcbank'}
                  </h4>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Bank Account</p>
                  <h4 style={{ fontWeight: '600' }}>
                    {appSettings?.bankDetails?.bankName || 'HDFC Bank'} - {appSettings?.bankDetails?.accountNumber || '50200012345678'}
                  </h4>
                  <small style={{ color: '#64748b' }}>IFSC: {appSettings?.bankDetails?.ifscCode || 'HDFC0001234'}</small>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Prominent Log Out Button */}
        <div style={{ margin: '24px 0 32px 0' }}>
          <IonButton
            expand="block"
            color="danger"
            style={{ height: '48px', fontSize: '16px', fontWeight: '700' }}
            onClick={() => setShowLogoutAlert(true)}
          >
            <IonIcon icon={logOutOutline} slot="start" />
            Log Out from Admin Portal
          </IonButton>
        </div>

        {/* Edit Profile Modal */}
        <IonModal isOpen={editModalOpen} onDidDismiss={() => setEditModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Edit Admin Profile</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setEditModalOpen(false)} style={{ color: '#ffffff', fontWeight: 800 }}>
                  <IonIcon icon={closeOutline} slot="start" style={{ fontSize: '20px' }} />
                  Cancel
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <form onSubmit={handleSaveProfile}>
              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Admin Full Name *</IonLabel>
                <IonInput
                  required
                  value={editForm.name}
                  onIonChange={(e) => setEditForm({ ...editForm, name: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '16px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Contact Phone *</IonLabel>
                <IonInput
                  type="tel"
                  required
                  value={editForm.phone}
                  onIonChange={(e) => setEditForm({ ...editForm, phone: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '24px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>
                  New Password (leave blank to keep current)
                </IonLabel>
                <IonInput
                  type="password"
                  placeholder="••••••••"
                  value={editForm.password}
                  onIonChange={(e) => setEditForm({ ...editForm, password: e.detail.value! })}
                />
              </IonItem>

              <IonButton expand="block" type="submit" color="primary" style={{ height: '48px' }}>
                Save Profile Changes
              </IonButton>
            </form>
          </IonContent>
        </IonModal>

        {/* Confirmation Alert */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Confirm Log Out"
          message="Are you sure you want to log out of the Admin Management System?"
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Log Out',
              role: 'destructive',
              handler: handleLogout,
            },
          ]}
        />

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || ''}
          duration={3000}
          onDidDismiss={() => setToastMessage(null)}
          color="dark"
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminProfilePage;
