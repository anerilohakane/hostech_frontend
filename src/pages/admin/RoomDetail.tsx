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
  IonIcon,
  IonBadge,
  IonList,
  IonItem,
  IonLabel,
  IonBackButton,
  IonButtons,
  IonLoading,
} from '@ionic/react';
import {
  businessOutline,
  bedOutline,
  cashOutline,
  peopleOutline,
  thermometerOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  arrowForwardOutline,
  callOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { roomService } from '../../services';

const RoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    loadRoom();
  }, [id]);

  const loadRoom = async () => {
    try {
      const data = await roomService.getRoomById(id);
      setRoom(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <IonLoading isOpen={true} message="Loading room details..." />;
  }

  if (!room) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/admin/rooms" />
            </IonButtons>
            <IonTitle>Room Details</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ textAlign: 'center', paddingTop: '60px' }}>
          <h3>Room not found</h3>
          <IonButton fill="outline" onClick={() => history.push('/admin/rooms')}>
            Back to Rooms
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  const isFull = room.availableSlots === 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/rooms" />
          </IonButtons>
          <IonTitle>Room {room.roomNumber}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f8fafc' }}>
        {/* Room Header Hero Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
            borderRadius: '24px',
            padding: '24px',
            color: '#fff',
            marginBottom: '20px',
            boxShadow: '0 12px 30px -4px rgba(49, 46, 129, 0.35)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  background: isFull ? '#ef4444' : '#10b981',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                }}
              >
                {isFull ? 'Fully Occupied' : `${room.availableSlots} Slot(s) Available`}
              </span>
              <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '8px 0 2px 0', letterSpacing: '-0.02em' }}>
                Room {room.roomNumber}
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#c7d2fe' }}>
                {room.propertyId?.name} • Floor {room.floor} • {room.roomType}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>RENTAL PLAN</div>
              <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '2px' }}>
                {room.rentalType === 'Full Room (Single Tenant)' ? 'Single (1 Tenant)' : `Sharing (${room.maxCapacity} Capacity)`}
              </div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>REFERENCE RENT</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#86efac' }}>
                ₹{room.defaultRent?.toLocaleString('en-IN')}/mo
              </div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>OCCUPANTS</div>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>
                {room.occupants?.length || 0} / {room.rentalType === 'Full Room (Single Tenant)' ? 1 : room.maxCapacity}
              </div>
            </div>
          </div>
        </div>

        {/* Current Occupants Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Current Occupants ({room.occupants?.length || 0})
            </h3>
            {room.availableSlots > 0 && (
              <IonButton
                size="small"
                color="primary"
                onClick={() => history.push('/admin/residents')}
                style={{ fontWeight: 700 }}
              >
                + Allocate Tenant
              </IonButton>
            )}
          </div>

          {room.occupants?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {room.occupants.map((occ: any) => (
                <IonCard
                  key={occ._id}
                  button
                  onClick={() => history.push(`/admin/residents/${occ._id}`)}
                  style={{ margin: 0, borderRadius: '18px', border: '1px solid #e2e8f0' }}
                >
                  <IonCardContent style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '16px', color: '#0f172a' }}>{occ.fullName}</strong>
                          <IonBadge color="success">{occ.occupancyType}</IonBadge>
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                          Phone: <strong>{occ.phone}</strong> • Joined: {new Date(occ.joiningDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '16px', color: '#10b981' }}>
                          ₹{occ.monthlyRent?.toLocaleString('en-IN')}/mo
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                          View Profile <IonIcon icon={arrowForwardOutline} />
                        </div>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          ) : (
            <IonCard style={{ margin: 0, borderRadius: '18px', border: '1px dashed #cbd5e1', background: '#ffffff' }}>
              <IonCardContent style={{ textAlign: 'center', padding: '30px' }}>
                <IonIcon icon={bedOutline} style={{ fontSize: '42px', color: '#94a3b8' }} />
                <h4 style={{ fontWeight: 700, margin: '8px 0 4px 0', color: '#0f172a' }}>No Tenants Allocated</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                  This room currently has {room.availableSlots} available slot(s).
                </p>
                <IonButton size="small" color="primary" onClick={() => history.push('/admin/residents')}>
                  Onboard Resident to this Room
                </IonButton>
              </IonCardContent>
            </IonCard>
          )}
        </div>

        {/* Room Specifications Card */}
        <IonCard style={{ margin: 0, borderRadius: '20px' }}>
          <IonCardContent style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
              Room Specifications & Amenities
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>Property Name</span>
                <strong style={{ color: '#0f172a' }}>{room.propertyId?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>Floor Number</span>
                <strong style={{ color: '#0f172a' }}>Floor {room.floor}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>Air Conditioning</span>
                <strong style={{ color: '#0f172a' }}>{room.roomType}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>Maximum Capacity</span>
                <strong style={{ color: '#0f172a' }}>{room.rentalType === 'Full Room (Single Tenant)' ? 1 : room.maxCapacity} Tenant(s)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>Agreed Standard Rent</span>
                <strong style={{ color: '#16a34a' }}>₹{room.defaultRent?.toLocaleString('en-IN')}/month</strong>
              </div>
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default RoomDetail;

