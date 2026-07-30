import { useState, useMemo } from 'react';
import { useAdminFeedback, apiClient } from '@edge/api';

export type RatingFilterType = 'all' | '5' | '4' | 'anon';

export interface DeleteModalState {
  visible: boolean;
  id: string;
  sender: string;
}

export function useFeedbackState() {
  const { feedback, isLoading, isError, refetch } = useAdminFeedback();

  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<RatingFilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    visible: false,
    id: '',
    sender: '',
  });

  // Filtered & Paginated Feedbacks
  const filteredFeedback = useMemo(() => {
    return feedback.filter((item) => {
      // Rating / Anonymous filter
      if (ratingFilter === '5' && item.rating !== 5) return false;
      if (ratingFilter === '4' && item.rating < 4) return false;
      if (ratingFilter === 'anon' && !item.isAnonymous) return false;

      // Search filter
      if (searchQuery.trim() === '') return true;
      const lower = searchQuery.toLowerCase();
      return (
        item.senderName.toLowerCase().includes(lower) ||
        item.senderEmail.toLowerCase().includes(lower) ||
        item.subject.toLowerCase().includes(lower) ||
        item.message.toLowerCase().includes(lower)
      );
    });
  }, [feedback, searchQuery, ratingFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredFeedback.length / pageSize));
  const paginatedFeedback = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFeedback.slice(start, start + pageSize);
  }, [filteredFeedback, currentPage, pageSize]);

  // Derived Stats
  const stats = useMemo(() => {
    const total = feedback.length;
    const anonCount = feedback.filter((f) => f.isAnonymous).length;
    const avgRating =
      total > 0
        ? (feedback.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1)
        : '5.0';
    const pendingCount = feedback.filter((f) => f.status === 'Pending').length;

    return { total, anonCount, avgRating, pendingCount };
  }, [feedback]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    try {
      await apiClient.delete(`/api/v2/feedback/${deleteModal.id}`);
      setDeleteModal((prev) => ({ ...prev, visible: false }));
      await refetch();
    } catch (err) {
      console.error('Failed to delete feedback:', err);
    }
  };

  return {
    feedback,
    isLoading,
    isError,
    refetch,
    searchQuery,
    setSearchQuery,
    ratingFilter,
    setRatingFilter,
    expandedId,
    toggleExpand,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredFeedback,
    paginatedFeedback,
    stats,
    deleteModal,
    setDeleteModal,
    handleDeleteConfirm,
  };
}
