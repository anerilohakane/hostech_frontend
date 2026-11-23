import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonBadge,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonButtons,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/react';
import { businessOutline, personOutline, peopleOutline, closeOutline } from 'ionicons/icons';
import { propertyService, roomService } from '../../services';
import { useHistory } from 'react-router-dom';

const AdminRooms: React.FC = () => {
  const history = useHistory();
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [propModalOpen, setPropModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Property Form
  const [propForm, setPropForm] = useState({
    name: '',
    pgType: 'Coliving',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    contactPerson: '',
    contactNumber: '',
  });

  // New Flexible Room Form
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    floor: 1,
    roomType: 'AC',
    rentalType: 'Sharing',
    maxCapacity: 2,
    defaultRent: 8500,
  });

  const loadProperties = async () => {
    try {
      const data = await propertyService.getAll();
      setProperties(data);
      if (data.length > 0 && !selectedProperty) {
        setSelectedProperty(data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadRooms = async () => {
    if (!selectedProperty) return;
    try {
      const r = await roomService.getRooms(selectedProperty);
      setRooms(r);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    loadRooms();
  }, [selectedProperty]);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await propertyService.create(propForm);
      setToastMessage('PG Property created successfully!');
      setPropModalOpen(false);
      await loadProperties();
      setSelectedProperty(created._id);
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to create PG property');
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await roomService.createRoom({
        ...roomForm,
        propertyId: selectedProperty,
      });
      setToastMessage(`Room ${roomForm.roomNumber} created with custom rental configuration!`);
      setRoomModalOpen(false);
      await loadRooms();
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || 'Failed to create room');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Rooms & Allocations</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setPropModalOpen(true)}>+ New PG</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ flex: 1, marginRight: '8px' }}>
            <IonSelect
              value={selectedProperty}
              placeholder="Select Property"
              onIonChange={(e) => setSelectedProperty(e.detail.value)}
              style={{ background: '#fff', borderRadius: '10px', padding: '6px 12px', border: '1px solid #cbd5e1' }}
            >
              {properties.map((p) => (
                <IonSelectOption key={p._id} value={p._id}>
                  {p.name} ({p.city})
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          <IonButton size="small" color="secondary" onClick={() => setRoomModalOpen(true)}>
            + Add Room
          </IonButton>
        </div>

        <div style={{ marginBottom: '12px', fontSize: '13px', color: '#64748b' }}>
          Total Rooms: <strong>{rooms.length}</strong> (Flexible Single Tenant or Sharing)
        </div>

        {rooms.map((r) => (
          <IonCard
            key={r._id}
            button
            onClick={() => history.push(`/admin/rooms/${r._id}`)}
            style={{
              margin: '0 0 16px 0',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
            }}
          >
            <IonCardContent style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                      Room {r.roomNumber}
                    </h3>
                    <IonBadge color={r.rentalType === 'Full Room (Single Tenant)' ? 'tertiary' : 'primary'}>
                      {r.rentalType}
                    </IonBadge>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                    Floor {r.floor} • {r.roomType} • Base Reference: ₹{r.defaultRent?.toLocaleString('en-IN')}/mo
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={r.isFull ? 'badge-tag badge-overdue' : 'badge-tag badge-paid'}>
                    {r.isFull ? 'Occupied' : `${r.availableSlots} Available`}
                  </span>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    {r.currentOccupants} / {r.rentalType === 'Full Room (Single Tenant)' ? 1 : r.maxCapacity} Tenants
                  </div>
                </div>
              </div>

              {/* Current Occupants list with custom rent */}
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
                    Occupants ({r.occupants?.length || 0})
                  </span>
                  <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 700 }}>
                    View Room Details →
                  </span>
                </div>
                {r.occupants?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {r.occupants.map((occ: any) => (
                      <div
                        key={occ._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          history.push(`/admin/residents/${occ._id}`);
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '10px',
                          border: '1px solid #bbf7d0',
                          background: '#f0fdf4',
                          fontSize: '13px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <div>
                          <strong style={{ color: '#0f172a' }}>{occ.fullName}</strong> ({occ.phone})
                        </div>
                        <div style={{ fontWeight: '700', color: '#16a34a' }}>
                          ₹{occ.monthlyRent?.toLocaleString('en-IN')}/mo
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                    No occupants yet. Ready to allocate for Full Room or Sharing.
                  </div>
                )}
              </div>
            </IonCardContent>
          </IonCard>
        ))}

        {/* Add Room Modal */}
        <IonModal isOpen={roomModalOpen} onDidDismiss={() => setRoomModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Add Flexible Room</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setRoomModalOpen(false)} style={{ color: '#ffffff', fontWeight: 800 }}>
                  <IonIcon icon={closeOutline} slot="start" style={{ fontSize: '20px' }} />
                  Cancel
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding" style={{ '--padding-bottom': 'calc(env(safe-area-inset-bottom, 24px) + 50px)' }}>
            <form onSubmit={handleCreateRoom} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 50px)' }}>
              <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                <IonLabel position="stacked">Room Number *</IonLabel>
                <IonInput
                  required
                  value={roomForm.roomNumber}
                  placeholder="e.g. 101, 102, 201"
                  onIonChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.detail.value! })}
                />
              </IonItem>
              <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                <IonLabel position="stacked">Floor Number</IonLabel>
                <IonInput
                  type="number"
                  value={roomForm.floor}
                  onIonChange={(e) => setRoomForm({ ...roomForm, floor: Number(e.detail.value!) })}
                />
              </IonItem>
              <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                <IonLabel position="stacked">AC / Non-AC</IonLabel>
                <IonSelect
                  value={roomForm.roomType}
                  onIonChange={(e) => setRoomForm({ ...roomForm, roomType: e.detail.value })}
                >
                  <IonSelectOption value="AC">AC</IonSelectOption>
                  <IonSelectOption value="Non-AC">Non-AC</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                <IonLabel position="stacked">Rental Plan Type</IonLabel>
                <IonSelect
                  value={roomForm.rentalType}
                  onIonChange={(e) =>
                    setRoomForm({
                      ...roomForm,
                      rentalType: e.detail.value,
                      maxCapacity: e.detail.value === 'Full Room (Single Tenant)' ? 1 : 2,
                    })
                  }
                >
                  <IonSelectOption value="Full Room (Single Tenant)">
                    Full Room (Single Tenant - Entire Room)
                  </IonSelectOption>
                  <IonSelectOption value="Sharing">Sharing (Multiple Tenants)</IonSelectOption>
                </IonSelect>
              </IonItem>
              {roomForm.rentalType === 'Sharing' && (
                <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                  <IonLabel position="stacked">Maximum Sharing Capacity</IonLabel>
                  <IonInput
                    type="number"
                    value={roomForm.maxCapacity}
                    onIonChange={(e) => setRoomForm({ ...roomForm, maxCapacity: Number(e.detail.value!) })}
                  />
                </IonItem>
              )}
              <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                <IonLabel position="stacked">Default / Reference Rent (INR)</IonLabel>
                <IonInput
                  type="number"
                  value={roomForm.defaultRent}
                  onIonChange={(e) => setRoomForm({ ...roomForm, defaultRent: Number(e.detail.value!) })}
                />
              </IonItem>
              <IonButton expand="block" type="submit" color="primary" style={{ marginTop: '20px', height: '48px' }}>
                Save Room
              </IonButton>
            </form>
          </IonContent>
        </IonModal>

        {/* Add PG Property Modal */}
        <IonModal isOpen={propModalOpen} onDidDismiss={() => setPropModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Add PG Property</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setPropModalOpen(false)} style={{ color: '#ffffff', fontWeight: 800 }}>
                  <IonIcon icon={closeOutline} slot="start" style={{ fontSize: '20px' }} />
                  Cancel
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding" style={{ '--padding-bottom': 'calc(env(safe-area-inset-bottom, 24px) + 50px)' }}>
            <form onSubmit={handleCreateProperty} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 50px)' }}>
              <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                <IonLabel position="stacked">PG Property Name *</IonLabel>
                <IonInput
                  required
                  value={propForm.name}
                  onIonChange={(e) => setPropForm({ ...propForm, name: e.detail.value! })}
                />
              </IonItem>
              <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                <IonLabel position="stacked">Address *</IonLabel>
                <IonInput
                  required
                  value={propForm.address}
                  onIonChange={(e) => setPropForm({ ...propForm, address: e.detail.value! })}
                />
              </IonItem>
              <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                <IonLabel position="stacked">Contact Person *</IonLabel>
                <IonInput
                  required
                  value={propForm.contactPerson}
                  onIonChange={(e) => setPropForm({ ...propForm, contactPerson: e.detail.value! })}
                />
              </IonItem>
              <IonItem lines="inset" style={{ '--padding-start': '0' }}>
                <IonLabel position="stacked">Contact Number *</IonLabel>
                <IonInput
                  required
                  value={propForm.contactNumber}
                  onIonChange={(e) => setPropForm({ ...propForm, contactNumber: e.detail.value! })}
                />
              </IonItem>
              <IonButton expand="block" type="submit" color="primary" style={{ marginTop: '20px', height: '48px' }}>
                Save Property
              </IonButton>
            </form>
          </IonContent>
        </IonModal>

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

export default AdminRooms;
