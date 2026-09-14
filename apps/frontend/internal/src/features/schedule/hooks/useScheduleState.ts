import { useState, useMemo } from 'react';
import {
  useAdminSchedules,
  scheduleService,
  safeAsync,
  ScheduleItemDto,
  CreateSchedulePayload,
  UpdateSchedulePayload,
} from '@edge/api';
import { useAuthContext } from '../../auth/context/AuthContext';
import { ScheduleFormData } from '../schemas/scheduleSchema';
import { ConfirmModalState, ScheduleConfirmActionType } from '../components/ConfirmScheduleActionModal';

export type ScheduleStatusFilter = 'ALL' | 'PUBLISHED' | 'DRAFT' | 'UPCOMING';

export interface ScheduleStats {
  total: number;
  publishedCount: number;
  draftCount: number;
  upcomingCount: number;
  totalSlots: number;
}

export function useScheduleState() {
  const { user } = useAuthContext();
  const currentTenantId = user?.tenantId ?? '';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ScheduleStatusFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItemDto | null>(null);
  const [viewingSchedule, setViewingSchedule] = useState<ScheduleItemDto | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    item: ScheduleItemDto | null;
  }>({
    visible: false,
    item: null,
  });
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    visible: false,
    type: 'update',
    schedule: null,
    pendingFormData: null,
  });

  const [toast, setToast] = useState<{
    message: string;
    variant: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  const showToast = (
    message: string,
    variant: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) => {
    setToast({ message, variant });
  };

  const hideToast = () => {
    setToast(null);
  };

  const { schedules, isLoading, isError, refetch } = useAdminSchedules({
    tenantId: currentTenantId,
    pageSize: 100,
  });

  // Calculate stats
  const stats: ScheduleStats = useMemo(() => {
    const now = new Date().getTime();
    let published = 0;
    let draft = 0;
    let upcoming = 0;
    let slots = 0;

    for (const s of schedules) {
      if (s.isPublished) {
        published++;
      } else {
        draft++;
      }

      const startTime = new Date(s.startDate).getTime();
      if (!isNaN(startTime) && startTime > now) {
        upcoming++;
      }

      if (typeof s.maximumSlots === 'number' && s.maximumSlots > 0) {
        slots += s.maximumSlots;
      }
    }

    return {
      total: schedules.length,
      publishedCount: published,
      draftCount: draft,
      upcomingCount: upcoming,
      totalSlots: slots,
    };
  }, [schedules]);

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    const now = new Date().getTime();
    const query = searchQuery.trim().toLowerCase();

    return schedules.filter((item) => {
      // Search filter
      const matchesSearch =
        query.length === 0 ||
        (item.venue?.toLowerCase().includes(query) ?? false) ||
        (item.serviceName?.toLowerCase().includes(query) ?? false) ||
        (item.serviceCode?.toLowerCase().includes(query) ?? false) ||
        (item.remarks?.toLowerCase().includes(query) ?? false);

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter === 'PUBLISHED') {
        return item.isPublished;
      }
      if (statusFilter === 'DRAFT') {
        return !item.isPublished;
      }
      if (statusFilter === 'UPCOMING') {
        const startTime = new Date(item.startDate).getTime();
        return !isNaN(startTime) && startTime > now;
      }

      return true;
    });
  }, [schedules, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSchedules.length / itemsPerPage));
  const paginatedSchedules = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredSchedules.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredSchedules, currentPage, itemsPerPage]);

  const handleOpenCreate = () => {
    setEditingSchedule(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (schedule: ScheduleItemDto) => {
    if (schedule.isPublished) {
      showToast('Published schedules cannot be edited. Please unpublish first.', 'warning');
      return;
    }
    setEditingSchedule(schedule);
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (schedule: ScheduleItemDto) => {
    setViewingSchedule(schedule);
  };

  const parseSlots = (slotsStr?: string): number | null => {
    if (typeof slotsStr !== 'string' || slotsStr.trim().length === 0) {
      return null;
    }
    const num = parseInt(slotsStr.trim(), 10);
    return isNaN(num) ? null : num;
  };

  const handleSaveSchedule = async (formData: ScheduleFormData) => {
    const tenantIdToUse = formData.tenantId || currentTenantId;
    const parsedSlots = parseSlots(formData.maximumSlots);

    if (editingSchedule !== null && editingSchedule !== undefined) {
      if (editingSchedule.isPublished) {
        showToast('Published schedules cannot be edited. Please unpublish first.', 'error');
        throw new Error('Published schedules cannot be edited. Please unpublish the schedule to draft status before making changes.');
      }

      // Prompt confirmation before modifying existing schedule
      setIsFormModalOpen(false);
      setConfirmModal({
        visible: true,
        type: 'update',
        schedule: editingSchedule,
        pendingFormData: formData,
      });
      return;
    }

    const createPayload: CreateSchedulePayload = {
      serviceId: formData.serviceId,
      tenantId: tenantIdToUse,
      venue: formData.venue.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      startApplication: formData.startApplication || null,
      endApplication: formData.endApplication || null,
      maximumSlots: parsedSlots,
      remarks: formData.remarks?.trim() || null,
      isPublished: formData.isPublished,
    };

    const [, err] = await safeAsync(
      scheduleService.createSchedule(createPayload)
    );

    if (err !== null) {
      showToast(err || 'Failed to create schedule.', 'error');
      throw new Error(err || 'Failed to create schedule.');
    }

    showToast('Examination schedule created successfully!', 'success');
    setIsFormModalOpen(false);
    setEditingSchedule(null);
    await refetch();
  };

  const handleTogglePublish = (schedule: ScheduleItemDto) => {
    const nextType: ScheduleConfirmActionType = schedule.isPublished ? 'unpublish' : 'publish';
    setConfirmModal({
      visible: true,
      type: nextType,
      schedule,
      pendingFormData: null,
    });
  };

  const handleConfirmAction = async () => {
    if (confirmModal.schedule === null || confirmModal.schedule === undefined) return;

    if (confirmModal.type === 'publish' || confirmModal.type === 'unpublish') {
      const newStatus = confirmModal.type === 'publish';
      const [, err] = await safeAsync(
        scheduleService.togglePublish(confirmModal.schedule.id, newStatus)
      );

      if (err !== null) {
        showToast(err || 'Failed to update schedule publication status.', 'error');
        console.error('Failed to toggle publish status:', err);
        return;
      }

      showToast(
        newStatus
          ? 'Examination schedule published to portal successfully!'
          : 'Examination schedule reverted to draft mode.',
        'success'
      );
    } else if (confirmModal.type === 'update') {
      if (confirmModal.pendingFormData !== null && confirmModal.pendingFormData !== undefined) {
        const parsedSlots = parseSlots(confirmModal.pendingFormData.maximumSlots);
        const updatePayload: UpdateSchedulePayload = {
          venue: confirmModal.pendingFormData.venue.trim(),
          startDate: confirmModal.pendingFormData.startDate,
          endDate: confirmModal.pendingFormData.endDate,
          startApplication: confirmModal.pendingFormData.startApplication || null,
          endApplication: confirmModal.pendingFormData.endApplication || null,
          maximumSlots: parsedSlots,
          remarks: confirmModal.pendingFormData.remarks?.trim() || null,
        };

        const [, err] = await safeAsync(
          scheduleService.updateSchedule(confirmModal.schedule.id, updatePayload)
        );

        if (err !== null) {
          showToast(err || 'Failed to update schedule.', 'error');
          console.error('Failed to update schedule:', err);
          return;
        }

        showToast('Examination schedule updated successfully!', 'success');
      }
    }

    setConfirmModal({ visible: false, type: 'update', schedule: null, pendingFormData: null });
    setEditingSchedule(null);
    await refetch();
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.item === null || deleteModal.item === undefined) return;

    if (deleteModal.item.isPublished) {
      showToast('Published schedules cannot be deleted. Please unpublish first.', 'error');
      console.error('Published schedules cannot be deleted. Please unpublish the schedule to draft status first.');
      return;
    }

    const [, err] = await safeAsync(
      scheduleService.deleteSchedule(deleteModal.item.id)
    );

    if (err !== null) {
      showToast(err || 'Failed to delete schedule.', 'error');
      console.error('Failed to delete schedule:', err);
      return;
    }

    showToast('Examination schedule deleted successfully!', 'success');
    setDeleteModal({ visible: false, item: null });
    await refetch();
  };

  return {
    schedules,
    paginatedSchedules,
    filteredCount: filteredSchedules.length,
    stats,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    isFormModalOpen,
    setIsFormModalOpen,
    editingSchedule,
    viewingSchedule,
    setViewingSchedule,
    deleteModal,
    setDeleteModal,
    confirmModal,
    setConfirmModal,
    toast,
    showToast,
    hideToast,
    currentTenantId,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDetail,
    handleSaveSchedule,
    handleTogglePublish,
    handleConfirmAction,
    handleDeleteConfirm,
    refetch,
  };
}

