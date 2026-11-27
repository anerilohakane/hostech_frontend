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
  cardOutline,
  flashOutline,
  walletOutline,
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
  const [bankingModalOpen, setBankingModalOpen] = useState(false);
  const [lightBillingModalOpen, setLightBillingModalOpen] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    password: '',
  });

  // Banking Form State
  const [bankingForm, setBankingForm] = useState({
    upiId: '',
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  });

  // Light Billing Form State
  const [lightBillingForm, setLightBillingForm] = useState({
    chargeElectricitySeparately: false,
    electricityBillingType: 'per_unit' as 'per_unit' | 'fixed_monthly',
    electricityRatePerUnit: 10,
    electricityFixedMonthly: 500,
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
      if (sets) {
        setBankingForm({
          upiId: sets.upiId || '',
          accountName: sets.bankDetails?.accountName || '',
          accountNumber: sets.bankDetails?.accountNumber || '',
          ifscCode: sets.bankDetails?.ifscCode || '',
          bankName: sets.bankDetails?.bankName || '',
        });
        setLightBillingForm({
          chargeElectricitySeparately: Boolean(sets.chargeElectricitySeparately),
          electricityBillingType: sets.electricityBillingType || 'per_unit',
          electricityRatePerUnit: Number(sets.electricityRatePerUnit) || 10,
          electricityFixedMonthly: Number(sets.electricityFixedMonthly) || 500,
        });
      }
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

  const handleSaveBanking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsService.updateSettings({
        upiId: bankingForm.upiId.trim(),
        bankDetails: {
          accountName: bankingForm.accountName.trim(),
          accountNumber: bankingForm.accountNumber.trim(),
          ifscCode: bankingForm.ifscCode.trim().toUpperCase(),
          bankName: bankingForm.bankName.trim(),
        },
      });
      setToastMessage('Bank account and UPI details updated!');
      setBankingModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to update banking details');
    }
  };

  const handleSaveLightBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsService.updateSettings({
        chargeElectricitySeparately: lightBillingForm.chargeElectricitySeparately,
        electricityBillingType: lightBillingForm.electricityBillingType,
        electricityRatePerUnit: Number(lightBillingForm.electricityRatePerUnit),
        electricityFixedMonthly: Number(lightBillingForm.electricityFixedMonthly),
      });
      setToastMessage('Light billing configuration updated!');
      setLightBillingModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to update light billing configuration');
    }
  };

  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Admin Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setEditModalOpen(true)}>
              <IonIcon icon={createOutline} slot="start" />
              Edit
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#090c12' }}>
        {/* Profile Card */}
        <IonCard style={{ margin: '0 0 16px 0', background: '#111723', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
          <IonCardContent style={{ padding: '24px 16px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(163, 230, 53, 0.15)',
                border: '2px solid #a3e635',
                color: '#a3e635',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '44px',
                marginBottom: '12px',
              }}
            >
              <IonIcon icon={personCircleOutline} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: '0 0 4px 0' }}>
              {user?.name || 'Super Admin'}
            </h2>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#94a3b8' }}>
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
        <IonCard style={{ margin: '0 0 16px 0', background: '#111723', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <IonCardContent style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', margin: '0 0 12px 0' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                PG Banking & Account Setup
              </h3>
              <IonButton size="small" fill="outline" onClick={() => setBankingModalOpen(true)}>
                <IonIcon icon={walletOutline} slot="start" />
                Manage Banking
              </IonButton>
            </div>
            <IonList lines="full">
              <IonItem>
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Official UPI ID</p>
                  <h4 style={{ fontWeight: '700', color: '#326d75' }}>
                    {appSettings?.upiId || 'Not configured yet'}
                  </h4>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Bank Account</p>
                  <h4 style={{ fontWeight: '600' }}>
                    {appSettings?.bankDetails?.bankName ? `${appSettings.bankDetails.bankName} - ${appSettings.bankDetails.accountNumber}` : 'No bank account added'}
                  </h4>
                  <small style={{ color: '#64748b' }}>
                    A/C Name: {appSettings?.bankDetails?.accountName || 'N/A'} • IFSC: {appSettings?.bankDetails?.ifscCode || 'N/A'}
                  </small>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Light Billing Management Card */}
        <IonCard style={{ margin: '0 0 16px 0', border: '1px solid #e2e8f0' }}>
          <IonCardContent style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Electricity & Light Billing
              </h3>
              <IonButton size="small" fill="outline" color="secondary" onClick={() => setLightBillingModalOpen(true)}>
                <IonIcon icon={flashOutline} slot="start" />
                Manage Light Bill
              </IonButton>
            </div>
            <IonList lines="full">
              <IonItem>
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Light Bill Status</p>
                  <h4 style={{ fontWeight: '700', color: appSettings?.chargeElectricitySeparately ? '#eab308' : '#10b981' }}>
                    {appSettings?.chargeElectricitySeparately ? '⚡ Charged Extra to Tenants' : '✓ Included in Rent'}
                  </h4>
                </IonLabel>
              </IonItem>
              {appSettings?.chargeElectricitySeparately && (
                <IonItem>
                  <IonLabel>
                    <p style={{ fontSize: '11px', color: '#64748b' }}>Billing Structure</p>
                    <h4 style={{ fontWeight: '600' }}>
                      {appSettings?.electricityBillingType === 'per_unit'
                        ? `Metered: ₹${appSettings?.electricityRatePerUnit || 10} / unit`
                        : `Fixed: ₹${appSettings?.electricityFixedMonthly || 500} / tenant / month`}
                    </h4>
                  </IonLabel>
                </IonItem>
              )}
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
            <IonToolbar>
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

        {/* Manage Banking Modal */}
        <IonModal isOpen={bankingModalOpen} onDidDismiss={() => setBankingModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Manage Bank Account & UPI</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setBankingModalOpen(false)} style={{ color: '#ffffff', fontWeight: 800 }}>
                  <IonIcon icon={closeOutline} slot="start" style={{ fontSize: '20px' }} />
                  Cancel
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <form onSubmit={handleSaveBanking}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Tenants will send their monthly rent to this UPI ID or Bank Account:
              </p>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '14px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Official UPI ID (e.g. yourpg@okhdfcbank)</IonLabel>
                <IonInput
                  placeholder="yourname@okaxis"
                  value={bankingForm.upiId}
                  onIonChange={(e) => setBankingForm({ ...bankingForm, upiId: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '14px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Account Holder Name</IonLabel>
                <IonInput
                  placeholder="e.g. PG Owner or Property Name"
                  value={bankingForm.accountName}
                  onIonChange={(e) => setBankingForm({ ...bankingForm, accountName: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '14px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Bank Name</IonLabel>
                <IonInput
                  placeholder="e.g. HDFC Bank / SBI / ICICI"
                  value={bankingForm.bankName}
                  onIonChange={(e) => setBankingForm({ ...bankingForm, bankName: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '14px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Bank Account Number</IonLabel>
                <IonInput
                  type="text"
                  placeholder="e.g. 50200012345678"
                  value={bankingForm.accountNumber}
                  onIonChange={(e) => setBankingForm({ ...bankingForm, accountNumber: e.detail.value! })}
                />
              </IonItem>

              <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '24px' }}>
                <IonLabel position="stacked" style={{ fontWeight: '600' }}>Bank IFSC Code</IonLabel>
                <IonInput
                  placeholder="e.g. HDFC0001234"
                  value={bankingForm.ifscCode}
                  onIonChange={(e) => setBankingForm({ ...bankingForm, ifscCode: e.detail.value! })}
                />
              </IonItem>

              <IonButton expand="block" type="submit" color="primary" style={{ height: '48px', fontWeight: 700 }}>
                Save Banking Details
              </IonButton>
            </form>
          </IonContent>
        </IonModal>

        {/* Manage Light Billing Modal */}
        <IonModal isOpen={lightBillingModalOpen} onDidDismiss={() => setLightBillingModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Manage Light Billing</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setLightBillingModalOpen(false)} style={{ color: '#ffffff', fontWeight: 800 }}>
                  <IonIcon icon={closeOutline} slot="start" style={{ fontSize: '20px' }} />
                  Cancel
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <form onSubmit={handleSaveLightBilling}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>Charge Light Bill Separately?</strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Collect electricity surcharge extra from tenants</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={lightBillingForm.chargeElectricitySeparately}
                    onChange={(e) => setLightBillingForm({ ...lightBillingForm, chargeElectricitySeparately: e.target.checked })}
                    style={{ width: '20px', height: '20px', accentColor: '#326d75', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {lightBillingForm.chargeElectricitySeparately && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    Billing Calculation Method
                  </label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <IonButton
                      fill={lightBillingForm.electricityBillingType === 'per_unit' ? 'solid' : 'outline'}
                      color="primary"
                      style={{ flex: 1 }}
                      onClick={() => setLightBillingForm({ ...lightBillingForm, electricityBillingType: 'per_unit' })}
                    >
                      Metered (Per Unit)
                    </IonButton>
                    <IonButton
                      fill={lightBillingForm.electricityBillingType === 'fixed_monthly' ? 'solid' : 'outline'}
                      color="primary"
                      style={{ flex: 1 }}
                      onClick={() => setLightBillingForm({ ...lightBillingForm, electricityBillingType: 'fixed_monthly' })}
                    >
                      Fixed Monthly
                    </IonButton>
                  </div>

                  {lightBillingForm.electricityBillingType === 'per_unit' ? (
                    <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '24px' }}>
                      <IonLabel position="stacked" style={{ fontWeight: '600' }}>Rate Per Electricity Unit (₹/kWh)</IonLabel>
                      <IonInput
                        type="number"
                        placeholder="10"
                        value={lightBillingForm.electricityRatePerUnit}
                        onIonChange={(e) => setLightBillingForm({ ...lightBillingForm, electricityRatePerUnit: Number(e.detail.value) })}
                      />
                    </IonItem>
                  ) : (
                    <IonItem lines="inset" style={{ '--padding-start': '0', marginBottom: '24px' }}>
                      <IonLabel position="stacked" style={{ fontWeight: '600' }}>Fixed Monthly Charge Per Tenant (₹)</IonLabel>
                      <IonInput
                        type="number"
                        placeholder="500"
                        value={lightBillingForm.electricityFixedMonthly}
                        onIonChange={(e) => setLightBillingForm({ ...lightBillingForm, electricityFixedMonthly: Number(e.detail.value) })}
                      />
                    </IonItem>
                  )}
                </div>
              )}

              <IonButton expand="block" type="submit" color="primary" style={{ height: '48px', fontWeight: 700 }}>
                Save Light Bill Settings
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
