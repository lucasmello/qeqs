import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './Calendar.module.css';

interface Visit {
  id: number;
  bar_id: number;
  bar_name: string;
  bar_address?: string;
  visit_date: string;
  notes?: string;
  created_by_username?: string;
}

interface Bar {
  id: number;
  name: string;
}

function Calendar() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [bars, setBars] = useState<Bar[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    barId: 0,
    notes: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [visitsRes, barsRes] = await Promise.all([
        axios.get('/api/visits'),
        axios.get('/api/bars'),
      ]);

      setVisits(visitsRes.data.visits);
      setBars(barsRes.data.bars);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVisitForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return visits.find((visit) => visit.visit_date.startsWith(dateStr));
  };

  const tileContent = ({ date }: { date: Date }) => {
    const visit = getVisitForDate(date);
    if (visit) {
      return <div className={styles.visitDot}>•</div>;
    }
    return null;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/visits', {
        barId: formData.barId,
        visitDate: selectedDate.toISOString().split('T')[0],
        notes: formData.notes,
      });

      setFormData({ barId: 0, notes: '' });
      setShowAddModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error adding visit');
    }
  };

  const handleDeleteVisit = async (id: number) => {
    if (!confirm('Are you sure you want to delete this visit?')) return;

    try {
      await axios.delete(`/api/visits/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting visit:', error);
    }
  };

  const selectedVisit = getVisitForDate(selectedDate);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.calendarPage}>
      <h1 className={styles.title}>Visit Calendar</h1>

      <div className={styles.grid}>
        <div className={styles.calendarContainer}>
          <ReactCalendar
            onChange={handleDateClick}
            value={selectedDate}
            tileContent={tileContent}
            className={styles.calendar}
          />
        </div>

        <div className={styles.sidebar}>
          <div className={styles.selectedDateInfo}>
            <h2 className={styles.dateTitle}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h2>

            {selectedVisit ? (
              <div className={styles.visitDetails}>
                <div className={styles.visitHeader}>
                  <h3 className={styles.visitBarName}>{selectedVisit.bar_name}</h3>
                  <button
                    onClick={() => handleDeleteVisit(selectedVisit.id)}
                    className={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>

                {selectedVisit.bar_address && (
                  <p className={styles.visitAddress}>📍 {selectedVisit.bar_address}</p>
                )}

                {selectedVisit.notes && (
                  <div className={styles.visitNotes}>
                    <strong>Notes:</strong>
                    <p>{selectedVisit.notes}</p>
                  </div>
                )}

                {selectedVisit.created_by_username && (
                  <p className={styles.visitCreator}>
                    Added by {selectedVisit.created_by_username}
                  </p>
                )}
              </div>
            ) : (
              <div className={styles.noVisit}>
                <p>No visit recorded for this date.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className={styles.addBtn}
                >
                  + Add Visit
                </button>
              </div>
            )}
          </div>

          {showAddModal && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <h3>Add Visit</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className={styles.closeBtn}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleAddVisit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Bar/Restaurant</label>
                    <select
                      value={formData.barId}
                      onChange={(e) =>
                        setFormData({ ...formData, barId: Number(e.target.value) })
                      }
                      className={styles.select}
                      required
                    >
                      <option value={0}>Select a bar...</option>
                      {bars.map((bar) => (
                        <option key={bar.id} value={bar.id}>
                          {bar.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Notes (optional)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className={styles.textarea}
                      rows={4}
                      placeholder="How was your visit?"
                    />
                  </div>

                  <button type="submit" className={styles.submitBtn}>
                    Add Visit
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.recentVisits}>
        <h2 className={styles.sectionTitle}>Recent Visits</h2>
        {visits.length === 0 ? (
          <p className={styles.empty}>No visits recorded yet!</p>
        ) : (
          <div className={styles.visitsList}>
            {visits.slice(0, 10).map((visit) => (
              <div key={visit.id} className={styles.visitCard}>
                <div className={styles.visitCardHeader}>
                  <h4>{visit.bar_name}</h4>
                  <span className={styles.visitDate}>
                    {new Date(visit.visit_date).toLocaleDateString()}
                  </span>
                </div>
                {visit.notes && <p className={styles.visitCardNotes}>{visit.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendar;

