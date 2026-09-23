import React, { useState, useEffect } from 'react';
import { Search, Calendar, RefreshCw, MoreVertical, Coffee, AlertCircle, Plus } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import AddBreakModal from '../components/AddBreakModal';
import AddScheduleModal from '../components/AddScheduleModal';
import Modal from '../components/Modal';

const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-09-22');

  // Menu dropdown & modal states
  const [activeMenuDriverId, setActiveMenuDriverId] = useState(null);
  const [breakModalTarget, setBreakModalTarget] = useState(null); // { driverId, scheduleId }
  const [scheduleModalDriverId, setScheduleModalDriverId] = useState(null);

  // Add Driver Modal State
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [addDriverError, setAddDriverError] = useState(null);
  const [isSubmittingDriver, setIsSubmittingDriver] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [driversListRes, bookingsRes] = await Promise.all([
        axiosClient.get('/drivers'),
        axiosClient.get('/bookings'),
      ]);

      const driverSummaries = driversListRes.data;

      // Fetch detailed schedules for each driver
      const detailedDrivers = await Promise.all(
        driverSummaries.map(async (d) => {
          try {
            const detailRes = await axiosClient.get(`/drivers/${d.id}`);
            return detailRes.data;
          } catch (e) {
            return d;
          }
        })
      );

      setDrivers(detailedDrivers);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Error fetching driver timeline data:', err);
      setError(err.response?.data?.message || 'Failed to connect to backend service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const parseHour = (timeStr) => {
    if (!timeStr) return null;
    try {
      if (timeStr.includes('T')) {
        return new Date(timeStr).getHours();
      }
      return parseInt(timeStr.split(':')[0], 10);
    } catch (e) {
      return null;
    }
  };

  // Driver Status Toggle Handlers
  const handleStartDuty = (driver) => {
    setActiveMenuDriverId(null);
    const existingSchedule = driver.schedules && driver.schedules.length > 0 ? driver.schedules[0] : null;
    if (existingSchedule) {
      axiosClient.put(`/drivers/${driver.id}`, { status: 'ON_DUTY' })
        .then(() => fetchData())
        .catch((err) => alert(err.response?.data?.message || 'Failed to update driver status'));
    } else {
      setScheduleModalDriverId(driver.id);
    }
  };

  const handleEndDuty = (driver) => {
    setActiveMenuDriverId(null);
    axiosClient.put(`/drivers/${driver.id}`, { status: 'OFFLINE' })
      .then(() => fetchData())
      .catch((err) => alert(err.response?.data?.message || 'Failed to end duty'));
  };

  const handleOpenAddBreak = (driver) => {
    setActiveMenuDriverId(null);
    const existingSchedule = driver.schedules && driver.schedules.length > 0 ? driver.schedules[0] : null;
    if (!existingSchedule) {
      alert('Please start duty shift for this driver before adding breaks.');
      return;
    }
    setBreakModalTarget({ driverId: driver.id, scheduleId: existingSchedule.id });
  };

  // Add New Driver Handler with Validation
  const handleCreateDriver = async (e) => {
    e.preventDefault();
    setAddDriverError(null);

    if (!newDriverName.trim()) {
      setAddDriverError('Driver name is required.');
      return;
    }

    if (!newDriverPhone.trim()) {
      setAddDriverError('Phone number is required.');
      return;
    }

    setIsSubmittingDriver(true);
    try {
      const payload = {
        name: newDriverName.trim(),
        phone: newDriverPhone.trim(),
        rating: 5.0,
        status: 'ONLINE',
      };
      await axiosClient.post('/drivers', payload);
      setIsAddDriverOpen(false);
      setNewDriverName('');
      setNewDriverPhone('');
      fetchData();
    } catch (err) {
      setAddDriverError(err.response?.data?.message || 'Failed to add driver');
    } finally {
      setIsSubmittingDriver(false);
    }
  };

  const filteredDrivers = drivers.filter((d) =>
    searchTerm === '' || d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header Bar */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>Driver Management</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Driver Availability & Hourly Shift Timeline</p>
        </div>
        <div className="header-actions">
          <button
            onClick={fetchData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontWeight: '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} />
            Refresh Timeline
          </button>
          <button
            onClick={() => {
              setNewDriverName('');
              setNewDriverPhone('');
              setAddDriverError(null);
              setIsAddDriverOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            Add Driver
          </button>
        </div>
      </div>

      {/* Control Bar & Legend */}
      <div className="card control-bar" style={{ padding: '16px', marginBottom: '20px' }}>
        {/* Search & Date Filter */}
        <div style={{ display: 'flex', gap: '12px', flex: '1', minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: '1' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '38px',
                paddingRight: '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#64748b" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
              }}
            />
          </div>
        </div>

        {/* Legend Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8125rem', color: '#475569', background: '#f8fafc', padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3b82f6', display: 'inline-block' }} />
            <span>Duty</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b', display: 'inline-block' }} />
            <span>Break</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span>Pickup</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span>Drop</span>
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Horizontal Timeline Gantt Container */}
      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        {loading ? (
          <LoadingSpinner message="Loading driver availability timeline..." />
        ) : filteredDrivers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No drivers found</div>
        ) : (
          <div style={{ minWidth: '1000px' }}>
            {/* Timeline Header Row */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600', fontSize: '0.8125rem', color: '#475569' }}>
              <div style={{ width: '240px', padding: '12px 16px', borderRight: '1px solid #e2e8f0', flexShrink: 0 }}>
                Driver Info & Status
              </div>
              <div style={{ display: 'flex', flex: 1 }}>
                {HOURS.map((h) => (
                  <div key={h} style={{ flex: 1, padding: '12px 4px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                    {h < 10 ? `0${h}:00` : `${h}:00`}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Driver Rows */}
            {filteredDrivers.map((driver) => {
              const schedule = driver.schedules && driver.schedules.length > 0 ? driver.schedules[0] : null;
              const dutyStartH = schedule ? parseHour(schedule.dutyStart) : null;
              const dutyEndH = schedule ? parseHour(schedule.dutyEnd) : null;

              const breaks = schedule && schedule.breaks ? schedule.breaks : [];
              const driverBookings = bookings.filter((b) => b.driverId === driver.id);

              return (
                <div key={driver.id} style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', alignItems: 'stretch', minHeight: '64px' }}>
                  {/* Driver Column */}
                  <div style={{ width: '240px', padding: '12px 16px', borderRight: '1px solid #e2e8f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>{driver.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: driver.status === 'ONLINE' ? '#10b981' : driver.status === 'ON_DUTY' ? '#3b82f6' : '#94a3b8',
                          }}
                        />
                        <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748b' }}>{driver.status}</span>
                      </div>
                    </div>

                    {/* 3-Dots Action Menu */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setActiveMenuDriverId(activeMenuDriverId === driver.id ? null : driver.id)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenuDriverId === driver.id && (
                        <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: '24px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 50,
                            width: '140px',
                            padding: '4px 0',
                          }}
                        >
                          <button
                            onClick={() => handleStartDuty(driver)}
                            style={{ width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', fontSize: '0.8125rem', color: '#334155', cursor: 'pointer' }}
                          >
                            Start Duty
                          </button>
                          <button
                            onClick={() => handleEndDuty(driver)}
                            style={{ width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', fontSize: '0.8125rem', color: '#334155', cursor: 'pointer' }}
                          >
                            End Duty
                          </button>
                          <button
                            onClick={() => handleOpenAddBreak(driver)}
                            style={{ width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', fontSize: '0.8125rem', color: '#2563eb', cursor: 'pointer', fontWeight: '500' }}
                          >
                            + Add Break
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hourly Grid Track */}
                  <div style={{ display: 'flex', flex: 1, position: 'relative', background: '#ffffff' }}>
                    {HOURS.map((h) => {
                      const isOnDuty = dutyStartH !== null && dutyEndH !== null && h >= dutyStartH && h < dutyEndH;
                      
                      const isBreak = breaks.some((b) => {
                        const bStart = parseHour(b.breakStart);
                        const bEnd = parseHour(b.breakEnd);
                        return bStart !== null && bEnd !== null && h >= bStart && h < bEnd;
                      });

                      const pickupsCount = driverBookings.filter((b) => parseHour(b.requestedPickupTime) === h).length;
                      const dropsCount = driverBookings.filter((b) => parseHour(b.plannedDropTime) === h).length;

                      return (
                        <div
                          key={h}
                          style={{
                            flex: 1,
                            borderRight: '1px solid #f1f5f9',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isBreak ? '#fef3c7' : isOnDuty ? '#eff6ff' : 'transparent',
                            padding: '4px',
                            gap: '2px',
                          }}
                        >
                          {isBreak ? (
                            <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#d97706', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Coffee size={12} /> Break
                            </span>
                          ) : isOnDuty ? (
                            <span style={{ fontSize: '0.65rem', fontWeight: '500', color: '#3b82f6', opacity: 0.6 }}>Duty</span>
                          ) : null}

                          {/* Pickup & Drop Badges */}
                          {pickupsCount > 0 && (
                            <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '1px 5px', borderRadius: '8px', fontWeight: '600' }}>
                              {pickupsCount} Pickup
                            </span>
                          )}

                          {dropsCount > 0 && (
                            <span style={{ fontSize: '0.65rem', background: '#ffe4e6', color: '#be123c', border: '1px solid #fecdd3', padding: '1px 5px', borderRadius: '8px', fontWeight: '600' }}>
                              {dropsCount} Drop
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Driver Modal */}
      {isAddDriverOpen && (
        <Modal
          isOpen={isAddDriverOpen}
          onClose={() => setIsAddDriverOpen(false)}
          title="Add New Driver"
        >
          <form onSubmit={handleCreateDriver} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {addDriverError && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem' }}>
                {addDriverError}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                Driver Name *
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                Phone Number *
              </label>
              <input
                type="text"
                placeholder="e.g. +1-555-0192"
                value={newDriverPhone}
                onChange={(e) => setNewDriverPhone(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setIsAddDriverOpen(false)}
                disabled={isSubmittingDriver}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingDriver}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: isSubmittingDriver ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmittingDriver ? 'Saving...' : 'Add Driver'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Break Modal */}
      {breakModalTarget && (
        <AddBreakModal
          isOpen={!!breakModalTarget}
          onClose={() => setBreakModalTarget(null)}
          driverId={breakModalTarget.driverId}
          scheduleId={breakModalTarget.scheduleId}
          onBreakAdded={fetchData}
        />
      )}

      {/* Add Schedule / Start Duty Modal */}
      {scheduleModalDriverId && (
        <AddScheduleModal
          isOpen={!!scheduleModalDriverId}
          onClose={() => setScheduleModalDriverId(null)}
          driverId={scheduleModalDriverId}
          selectedDate={selectedDate}
          onScheduleAdded={fetchData}
        />
      )}
    </div>
  );
}
