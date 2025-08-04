import React, { useState, useEffect } from 'react';
import { createReview, fetchMachineReviews } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface ReviewsProps {
  machineId: string;
  machineName: string;
}

function Reviews({ machineId, machineName }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [machineId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchMachineReviews(machineId);
      setReviews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.comment.trim()) {
      setError('Please write a comment');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      await createReview(machineId, {
        rating: formData.rating,
        comment: formData.comment.trim()
      });

      setFormData({ rating: 5, comment: '' });
      setShowForm(false);
      fetchReviews();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return <div className="reviews-section">Loading reviews...</div>;
  }

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h3>Reviews ({reviews.length})</h3>
        {averageRating > 0 && (
          <div className="average-rating">
            <span className="stars">
              {'★'.repeat(Math.round(averageRating))}
              {'☆'.repeat(5 - Math.round(averageRating))}
            </span>
            <span className="rating-text">
              {averageRating.toFixed(1)} out of 5
            </span>
          </div>
        )}
        {user && (
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="write-review-button"
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && user && (
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label htmlFor="rating">Rating</label>
            <select
              id="rating"
              value={formData.rating}
              onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Very Good</option>
              <option value={3}>3 - Good</option>
              <option value={2}>2 - Fair</option>
              <option value={1}>1 - Poor</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Comment *</label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your experience with this vending machine..."
              rows={4}
              required
            />
          </div>

          <button type="submit" disabled={submitting} className="submit-review-button">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review this vending machine!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div className="review-rating">
                  <span className="stars">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </span>
                  <span className="rating-number">{review.rating}/5</span>
                </div>
                <div className="review-meta">
                  <span className="reviewer-name">{review.user.name}</span>
                  <span className="review-date">{formatDate(review.createdAt)}</span>
                </div>
              </div>
              <div className="review-comment">{review.comment}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Reviews; 