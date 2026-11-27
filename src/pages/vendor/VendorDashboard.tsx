import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
  IonSearchbar,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonLoading,
} from '@ionic/react';
import {
  logOutOutline,
  businessOutline,
  cardOutline,
  peopleOutline,
  chatbubblesOutline,
  cashOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  alertCircleOutline,
  refreshOutline,
} from 'ionicons/icons';
import { vendorService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router-dom';

const VendorDashboard: React.FC = () => {
  const [tab, setTab] = useState<'overview' | 'customers' | 'subscriptions' | 'tickets'>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<any>(null); // For suspending / activating / extending
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { user, logout } = useAuth();
  const history = useHistory();

  const loadData = async () => {
    try {
      setLoading(true);
      const [ovRes, orgsRes, ticketsRes] = await Promise.all([
        vendorService.getOverview(),
        vendorService.getOrganizations({ search, status: statusFilter }),
        vendorService.getTickets(),
      ]);
      setMetrics(ovRes.metrics);
      setOrganizations(orgsRes || []);
      setTickets(ticketsRes || []);
    } catch (e: any) {
      console.error('Error loading vendor data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleAction = async (action: string, organizationId: string, extendDays?: number, planId?: string) => {
    try {
      await vendorService.updateOrganization({ organizationId, action, extendDays, planId });
      setToastMessage(`Action '${action}' applied successfully.`);
      setActionModal(null);
      loadData();
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || err.message);
    }
  };

  const handleTicketStatus = async (ticketId: string, status: string) => {
    try {
      await vendorService.updateTicket({ ticketId, status });
      setToastMessage(`Ticket marked as ${status}`);
      loadData();
    } catch (err: any) {
      setToastMessage(err.message);
    }
  };

  return (
    <IonPage className="vendor-dashboard">
      <IonHeader>
        <IonToolbar style={{ '--background': '#1e484f', '--color': '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '14px', gap: '8px' }}>
            <strong style={{ fontSize: '18px', font: "800 19px/1 'Manrope', sans-serif" }}>
              Host<span style={{ color: '#f2c982' }}>Tech</span>
            </strong>
            <span style={{ background: 'rgba(242, 201, 130, 0.2)', color: '#f2c982', padding: '3px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: 800 }}>
              VENDOR SaaS
            </span>
          </div>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={loadData}>
              <IonIcon icon={refreshOutline} slot="icon-only" />
            </IonButton>
            <IonButton
              fill="clear"
              onClick={() => {
                logout();
                history.replace('/login');
              }}
            >
              <IonIcon icon={logOutOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        <IonToolbar style={{ '--background': '#25565d', padding: '0 6px' }}>
          <IonSegment
            value={tab}
            onIonChange={(e: any) => setTab(e.detail.value)}
            style={{ '--background': 'transparent' }}
          >
            <IonSegmentButton value="overview">
              <IonLabel>Overview</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="customers">
              <IonLabel>Customers</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="subscriptions">
              <IonLabel>Plans</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="tickets">
              <IonLabel>
                Tickets {metrics?.openTicketsCount > 0 && `(${metrics?.openTicketsCount})`}
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="vendor-content">
        <style>{`
          .vendor-content { --background: #f7f5f0; }
          .vendor-main { max-width: 900px; margin: 0 auto; padding: 18px 14px 60px; font-family: var(--ion-font-family); }
          .metric-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 20px; }
          .metric-card {
            background: #fff; border-radius: 16px; padding: 14px; border: 1px solid #ece8df;
            box-shadow: 0 4px 14px rgba(37,86,93,.05);
          }
          .metric-card span { font-size: 10px; color: #7f8e8a; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; display: block; margin-bottom: 4px; }
          .metric-card strong { font-size: 22px; color: #25565d; font-family: 'Manrope', sans-serif; font-weight: 800; }
          .pg-card {
            background: #fff; border-radius: 16px; padding: 16px; border: 1px solid #ece8df; margin-bottom: 12px;
            box-shadow: 0 4px 12px rgba(37,86,93,.04); display: flex; flex-direction: column; gap: 8px;
          }
          .status-pill {
            display: inline-block; padding: 4px 8px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase;
          }
          .status-active { background: #e6f4ea; color: #137333; }
          .status-trial { background: #fef7e0; color: #b06000; }
          .status-suspended { background: #fce8e6; color: #c5221f; }
          .status-expired { background: #f1f3f4; color: #5f6368; }
        `}</style>

        <div className="vendor-main">
          {/* TAB 1: OVERVIEW */}
          {tab === 'overview' && (
            <div>
              <div className="metric-strip">
                <div className="metric-card">
                  <span>Total PGs</span>
                  <strong>{metrics?.totalOrganizations || 0}</strong>
                </div>
                <div className="metric-card">
                  <span>Active Subs</span>
                  <strong style={{ color: '#137333' }}>{metrics?.activeSubscriptions || 0}</strong>
                </div>
                <div className="metric-card">
                  <span>Trials</span>
                  <strong style={{ color: '#b06000' }}>{metrics?.trialOrganizations || 0}</strong>
                </div>
                <div className="metric-card">
                  <span>Platform MRR</span>
                  <strong style={{ color: '#25565d' }}>₹{(metrics?.mrr || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div className="metric-card">
                  <span>Open Tickets</span>
                  <strong style={{ color: '#c5221f' }}>{metrics?.openTicketsCount || 0}</strong>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#303b3c', margin: '0 0 12px' }}>
                Recent PG Registrations
              </h3>

              {organizations.slice(0, 5).map((org) => (
                <div key={org._id} className="pg-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#25565d' }}>{org.name}</strong>
                      <div style={{ fontSize: '11px', color: '#7c8e8a', marginTop: '2px' }}>
                        Code: <code>{org.code}</code> • {org.city || 'Bengaluru'} • Owner: {org.contactPerson} ({org.phone})
                      </div>
                    </div>
                    <span className={`status-pill status-${org.status}`}>{org.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#5f6f6c', marginTop: '4px' }}>
                    <span>Plan: <strong>{org.planId?.toUpperCase() || 'STARTER'}</strong></span>
                    <span>•</span>
                    <span>Properties: <strong>{org.propertiesCount || 1}</strong></span>
                    <span>•</span>
                    <span>Expires: {org.subscriptionEndDate ? new Date(org.subscriptionEndDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: CUSTOMERS */}
          {tab === 'customers' && (
            <div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <IonSearchbar
                  value={search}
                  placeholder="Search by name, owner, phone..."
                  onIonInput={(e: any) => setSearch(e.detail.value)}
                  style={{ padding: 0 }}
                />
                <IonSelect
                  value={statusFilter}
                  onIonChange={(e: any) => setStatusFilter(e.detail.value)}
                  style={{ background: '#fff', borderRadius: '12px', padding: '0 12px', minWidth: '110px' }}
                >
                  <IonSelectOption value="all">All Status</IonSelectOption>
                  <IonSelectOption value="active">Active</IonSelectOption>
                  <IonSelectOption value="trial">Trial</IonSelectOption>
                  <IonSelectOption value="suspended">Suspended</IonSelectOption>
                </IonSelect>
              </div>

              {organizations.map((org) => (
                <div key={org._id} className="pg-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '16px', color: '#25565d' }}>{org.name}</strong>
                      <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#687774' }}>
                        {org.contactPerson} • {org.email} • {org.phone}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#889895' }}>
                        {org.address}, {org.city}, {org.state} ({org.pincode})
                      </p>
                    </div>
                    <span className={`status-pill status-${org.status}`}>{org.status}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', borderTop: '1px solid #f0ede6', paddingTop: '10px' }}>
                    {org.status !== 'active' && (
                      <IonButton size="small" style={{ '--background': '#137333' }} onClick={() => handleAction('activate', org._id)}>
                        Activate Subscription
                      </IonButton>
                    )}
                    {org.status !== 'suspended' && (
                      <IonButton size="small" color="danger" fill="outline" onClick={() => handleAction('suspend', org._id)}>
                        Suspend Account
                      </IonButton>
                    )}
                    <IonButton size="small" fill="outline" style={{ '--border-color': '#326d75', '--color': '#326d75' }} onClick={() => handleAction('extend', org._id, 30)}>
                      +30 Days Extension
                    </IonButton>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SUBSCRIPTIONS & PLANS */}
          {tab === 'subscriptions' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#303b3c', margin: '0 0 14px' }}>
                Configurable SaaS Subscription Plans
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div className="pg-card" style={{ borderTop: '4px solid #326d75' }}>
                  <strong style={{ fontSize: '18px', color: '#326d75' }}>Starter Plan</strong>
                  <div style={{ font: "800 24px/1 'Manrope'", color: '#25565d', margin: '6px 0' }}>₹999 <span style={{ fontSize: '12px', color: '#7c8e8a' }}>/month</span></div>
                  <ul style={{ fontSize: '11px', color: '#5f6f6c', paddingLeft: '16px', margin: '4px 0' }}>
                    <li>Up to 15 Rooms</li>
                    <li>1 PG Property</li>
                    <li>Resident Mobile App Access</li>
                    <li>Rent Tracking & Due Reminders</li>
                  </ul>
                  <span style={{ fontSize: '11px', color: '#137333', fontWeight: 700 }}>14 Days Free Trial Included</span>
                </div>

                <div className="pg-card" style={{ borderTop: '4px solid #f2c982' }}>
                  <strong style={{ fontSize: '18px', color: '#326d75' }}>Growth Plan</strong>
                  <div style={{ font: "800 24px/1 'Manrope'", color: '#25565d', margin: '6px 0' }}>₹1,999 <span style={{ fontSize: '12px', color: '#7c8e8a' }}>/month</span></div>
                  <ul style={{ fontSize: '11px', color: '#5f6f6c', paddingLeft: '16px', margin: '4px 0' }}>
                    <li>Up to 50 Rooms</li>
                    <li>Up to 3 Properties</li>
                    <li>Automated WhatsApp / SMS Reminders</li>
                    <li>KYC Agreement & Document Vault</li>
                    <li>Staff Permission Management</li>
                  </ul>
                  <span style={{ fontSize: '11px', color: '#137333', fontWeight: 700 }}>14 Days Free Trial Included</span>
                </div>

                <div className="pg-card" style={{ borderTop: '4px solid #b96f5e' }}>
                  <strong style={{ fontSize: '18px', color: '#326d75' }}>Pro Enterprise</strong>
                  <div style={{ font: "800 24px/1 'Manrope'", color: '#25565d', margin: '6px 0' }}>₹3,499 <span style={{ fontSize: '12px', color: '#7c8e8a' }}>/month</span></div>
                  <ul style={{ fontSize: '11px', color: '#5f6f6c', paddingLeft: '16px', margin: '4px 0' }}>
                    <li>Up to 200 Rooms</li>
                    <li>Up to 10 Properties</li>
                    <li>Custom Branding & Receipt Template</li>
                    <li>Advance Analytics & Tax Reports</li>
                    <li>Dedicated Priority Support Line</li>
                  </ul>
                  <span style={{ fontSize: '11px', color: '#137333', fontWeight: 700 }}>14 Days Free Trial Included</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUPPORT TICKETS */}
          {tab === 'tickets' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#303b3c', margin: '0 0 14px' }}>
                PG Customer Support Tickets
              </h3>
              {tickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#889895' }}>
                  No open support tickets. Everything is running smoothly!
                </div>
              ) : (
                tickets.map((t) => (
                  <div key={t._id} className="pg-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '15px', color: '#25565d' }}>
                        [{t.ticketNumber}] {t.subject}
                      </strong>
                      <span className={`status-pill status-${t.status === 'Resolved' ? 'active' : 'suspended'}`}>
                        {t.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#5f6f6c' }}>{t.description}</div>
                    <div style={{ fontSize: '10px', color: '#889895', marginTop: '4px' }}>
                      PG: <strong>{t.organizationId?.name || 'N/A'}</strong> • Raised by: {t.raisedBy?.name} • Priority: {t.priority}
                    </div>
                    {t.status !== 'Resolved' && (
                      <div style={{ marginTop: '8px' }}>
                        <IonButton size="small" style={{ '--background': '#137333' }} onClick={() => handleTicketStatus(t._id, 'Resolved')}>
                          Mark Resolved
                        </IonButton>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || ''}
          duration={2500}
          onDidDismiss={() => setToastMessage(null)}
          color="dark"
        />
      </IonContent>
    </IonPage>
  );
};

export default VendorDashboard;
