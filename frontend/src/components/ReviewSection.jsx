import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

function StarRating({ value, onChange, readOnly = false, size = 'text-xl' }) {
  return (
    <div
      className={`flex items-center gap-1 ${size}`}
      role={readOnly ? 'img' : 'group'}
      aria-label={readOnly ? `${value} out of 5 stars` : 'Choose a star rating'}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`${star <= value ? 'text-[#A65D45]' : 'text-[#D9CABB]'} ${
            readOnly ? 'cursor-default' : 'transition hover:scale-110'
          }`}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ReviewSection({ productId, productSellerId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [eligibility, setEligibility] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  const refreshReviews = useCallback(async () => {
    const response = await API.get(`/reviews/${productId}`);
    setReviews(response.data.reviews || []);
    setAverageRating(response.data.averageRating || 0);
    setReviewCount(response.data.reviewCount || 0);
  }, [productId]);

  const refreshEligibility = useCallback(async () => {
    const token =
      localStorage.getItem('token') ||
      (() => {
        try {
          return JSON.parse(localStorage.getItem('user') || '{}')?.token;
        } catch {
          return '';
        }
      })();

    setIsLoggedIn(Boolean(token));

    if (!token) {
      setEligibility(null);
      return;
    }

    try {
      const response = await API.get(`/reviews/${productId}/eligibility`);
      setEligibility(response.data);
      const userReview = response.data.review;
      if (userReview) {
        setRating(userReview.rating);
        setComment(userReview.comment);
      } else {
        setRating(5);
        setComment('');
      }

      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUserId(String(storedUser?._id || storedUser?.id || storedUser?.user?._id || ''));
      } catch {
        setCurrentUserId('');
      }
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        setEligibility(null);
        setIsLoggedIn(false);
      } else {
        setEligibility({
          eligible: false,
          reason: requestError.response?.data?.message || 'Unable to check review eligibility.',
          review: null,
        });
      }
    }
  }, [productId]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([refreshReviews(), refreshEligibility()]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load reviews.');
    } finally {
      setLoading(false);
    }
  }, [refreshReviews, refreshEligibility]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const ownReview = eligibility?.review;
  const canEditReview = Boolean(ownReview?._id);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (canEditReview && editing) {
        await API.patch(`/reviews/${ownReview._id}`, { rating, comment });
        setMessage('Your review has been updated.');
      } else {
        await API.post(`/reviews/${productId}`, { rating, comment });
        setMessage('Thank you! Your review has been submitted.');
      }

      setEditing(false);
      await refreshAll();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save your review.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!ownReview?._id || !window.confirm('Delete your review?')) return;

    setDeleting(true);
    setError('');
    setMessage('');

    try {
      await API.delete(`/reviews/${ownReview._id}`);
      setMessage('Your review has been deleted.');
      setEditing(false);
      setRating(5);
      setComment('');
      await refreshAll();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete your review.');
    } finally {
      setDeleting(false);
    }
  };

  const beginEdit = () => {
    setRating(ownReview.rating);
    setComment(ownReview.comment);
    setEditing(true);
    setMessage('');
    setError('');
  };

  const isOwnProduct =
    Boolean(productSellerId && currentUserId) &&
    String(productSellerId) === String(currentUserId);

  return (
    <section className="mt-12 border-t border-[#E5D9CA] pt-9 sm:mt-16 sm:pt-12">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A65D45]">
            Buyer feedback
          </p>
          <h2 className="mt-2 font-headline text-2xl sm:text-3xl">
            Reviews & ratings
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-headline text-3xl">{averageRating.toFixed(1)}</span>
          <div>
            <StarRating value={Math.round(averageRating)} readOnly size="text-lg" />
            <p className="mt-1 text-xs text-[#827366]">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mb-4 rounded bg-[#F0E6D8] p-3 text-sm text-[#38291F]">
          {message}
        </p>
      )}

      {!loading && !isLoggedIn && (
        <div className="mb-8 border border-[#E5D9CA] p-5">
          <p className="text-sm text-[#766A5E]">
            Sign in and purchase this item to leave a verified review after delivery.
          </p>
          <Link
            to="/login"
            className="mt-3 inline-flex text-sm font-semibold text-[#8E4B35] underline underline-offset-4"
          >
            Sign in to CraftLocal
          </Link>
        </div>
      )}

      {!loading && isLoggedIn && !isOwnProduct && eligibility?.eligible && (
        <form onSubmit={handleSubmit} className="mb-8 border border-[#E5D9CA] bg-white/50 p-5 sm:p-6">
          <h3 className="font-headline text-xl">
            {canEditReview && !editing ? 'Your review' : editing ? 'Edit your review' : 'Share your experience'}
          </h3>

          {canEditReview && !editing ? (
            <div className="mt-3">
              <StarRating value={ownReview.rating} readOnly />
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#766A5E]">
                {ownReview.comment}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={beginEdit} className="border border-[#A65D45] px-4 py-2 text-sm text-[#8E4B35] hover:bg-[#F0E6D8]">
                  Edit review
                </button>
                <button type="button" disabled={deleting} onClick={handleDelete} className="px-4 py-2 text-sm text-red-700 disabled:opacity-50">
                  {deleting ? 'Deleting…' : 'Delete review'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-3">
                <StarRating value={rating} onChange={setRating} />
              </div>
              <label htmlFor={`review-comment-${productId}`} className="mt-4 block text-sm font-medium">
                Your review
              </label>
              <textarea
                id={`review-comment-${productId}`}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                minLength={3}
                maxLength={1000}
                required
                rows={4}
                placeholder="What did you think of this handcrafted piece?"
                className="mt-2 w-full resize-y border border-[#D9CABB] bg-white p-3 text-sm outline-none focus:border-[#A65D45]"
              />
              <p className="mt-1 text-right text-xs text-[#827366]">{comment.length}/1000</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="submit" disabled={saving} className="bg-[#A65D45] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#874832] disabled:cursor-not-allowed disabled:opacity-50">
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Submit review'}
                </button>
                {editing && (
                  <button type="button" onClick={() => { setEditing(false); setRating(ownReview.rating); setComment(ownReview.comment); }} className="border border-[#D9CABB] px-5 py-3 text-sm">
                    Cancel
                  </button>
                )}
              </div>
            </>
          )}
        </form>
      )}

      {!loading && isLoggedIn && !isOwnProduct && eligibility && !eligibility.eligible && !canEditReview && (
        <p className="mb-8 border border-[#E5D9CA] p-5 text-sm leading-6 text-[#766A5E]">
          {eligibility.reason || 'Reviews are available after your purchase has been delivered.'}
        </p>
      )}

      {!loading && isOwnProduct && (
        <p className="mb-8 border border-[#E5D9CA] p-5 text-sm text-[#766A5E]">
          You can’t review a product from your own store.
        </p>
      )}

      <div className="space-y-5">
        {loading ? (
          <p className="text-sm text-[#827366]">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <div className="border border-dashed border-[#D9CABB] p-6 text-center">
            <p className="font-headline text-xl">No reviews yet</p>
            <p className="mt-2 text-sm text-[#827366]">Be the first buyer to share feedback once your order is delivered.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <article key={review._id} className="border-b border-[#E5D9CA] pb-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{review.reviewerName}</p>
                  <p className="mt-1 text-xs text-[#827366]">{formatDate(review.createdAt)}</p>
                </div>
                <StarRating value={review.rating} readOnly size="text-base" />
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#766A5E]">
                {review.comment}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
