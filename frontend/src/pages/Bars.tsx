import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import styles from './Bars.module.css';

interface Bar {
  id: number;
  name: string;
  address?: string;
  description?: string;
  created_by_username?: string;
  current_votes: number;
}

function Bars() {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
  });

  useEffect(() => {
    fetchBars();
  }, []);

  const fetchBars = async () => {
    try {
      const response = await axios.get('/api/bars');
      setBars(response.data.bars);
    } catch (error) {
      console.error('Error fetching bars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/bars', formData);
      setFormData({ name: '', address: '', description: '' });
      setShowForm(false);
      fetchBars();
    } catch (error) {
      console.error('Error creating bar:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this bar?')) return;
    
    try {
      await axios.delete(`/api/bars/${id}`);
      fetchBars();
    } catch (error) {
      console.error('Error deleting bar:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.bars}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bars & Restaurants</h1>
        <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}>
          {showForm ? 'Cancel' : '+ Add Bar'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={styles.textarea}
              rows={3}
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Add Bar
          </button>
        </form>
      )}

      {bars.length === 0 ? (
        <div className={styles.empty}>
          <p>No bars added yet. Add your first bar to get started!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {bars.map((bar) => (
            <div key={bar.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.barName}>{bar.name}</h3>
                <button
                  onClick={() => handleDelete(bar.id)}
                  className={styles.deleteBtn}
                >
                  ×
                </button>
              </div>

              {bar.address && (
                <p className={styles.address}>📍 {bar.address}</p>
              )}

              {bar.description && (
                <p className={styles.description}>{bar.description}</p>
              )}

              <div className={styles.cardFooter}>
                {bar.created_by_username && (
                  <span className={styles.creator}>
                    Added by {bar.created_by_username}
                  </span>
                )}
                {bar.current_votes > 0 && (
                  <span className={styles.votes}>
                    🗳️ {bar.current_votes} votes today
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bars;

