import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Conversation, chatService, safeAsync, useUsers } from '@edge/api';
import { AlertToast, useTheme } from '@edge/ui';
import { useAuthContext } from '../../auth/context/AuthContext';
import { useChatConversations } from '../hooks/useChatConversations';
import { useChatMessages } from '../hooks/useChatMessages';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatActivePane } from '../components/ChatActivePane';
import { CreateGroupChatModal } from '../forms/CreateGroupChatModal';
import { CreateDirectChatModal } from '../forms/CreateDirectChatModal';
import { CreateGroupChatFormValues, CreateDirectChatFormValues } from '../schemas/chatSchemas';

export const ChatScreenContent: React.FC = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const { user } = useAuthContext();
  const { users } = useUsers();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState<boolean>(false);
  const [isDirectModalOpen, setIsDirectModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const {
    conversations,
    isLoading: isLoadingConversations,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    markAsRead,
    markAsUnread,
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
    refreshConversations,
  } = useChatConversations(user?.tenantId, user?.id);

  const {
    messages,
    isSending,
    sendMessage,
    retryMessage,
    editMessage,
    unsendMessage,
    reactToMessage,
    sendTypingNotification,
    typingUsers,
  } = useChatMessages(selectedConversation?.id, user?.name);

  // Automatically mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation && selectedConversation.unreadCount > 0) {
      void markAsRead(selectedConversation.id);
    }
  }, [selectedConversation, markAsRead]);

  const showToast = (message: string, variant: 'success' | 'error') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateDirectChat = async (values: CreateDirectChatFormValues) => {
    setIsSubmitting(true);
    const targetUser = users.find(
      (u) => u.id === values.recipientUserId || u.email.toLowerCase() === values.recipientUserId.trim().toLowerCase()
    );
    const targetUserId = targetUser ? targetUser.id : values.recipientUserId;

    const [newConv, err] = await safeAsync(
      chatService.createConversation({
        title: '',
        type: 'Direct',
        scope: values.scope,
        participantUserIds: targetUserId ? [targetUserId] : [],
      })
    );
    setIsSubmitting(false);
    if (err !== null) {
      showToast(err, 'error');
      return;
    }
    if (newConv !== null) {
      showToast('Direct message channel opened.', 'success');
      await refreshConversations();
      setSelectedConversation(newConv);
      if (values.initialMessage && values.initialMessage.trim().length > 0) {
        await safeAsync(
          chatService.sendMessage({
            conversationId: newConv.id,
            content: values.initialMessage.trim(),
          })
        );
      }
    }
  };

  const handleCreateGroup = async (values: CreateGroupChatFormValues) => {
    setIsSubmitting(true);
    const [newConv, err] = await safeAsync(
      chatService.createConversation({
        title: values.title,
        description: values.description,
        type: 'Group',
        scope: values.scope,
        participantUserIds: values.participantUserIds,
      })
    );
    setIsSubmitting(false);
    if (err !== null) {
      showToast(err, 'error');
      return;
    }
    if (newConv !== null) {
      showToast(`Group chat "${values.title}" created.`, 'success');
      await refreshConversations();
      setSelectedConversation(newConv);
    }
  };

  const handleSendMessage = async (content: string) => {
    const success = await sendMessage(content);
    if (!success) {
      showToast('Failed to send message. Please retry.', 'error');
    }
    return success;
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    if (selectedConversation?.id === id) {
      setSelectedConversation(null);
    }
    showToast('Conversation removed.', 'success');
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.bg }]}>
      {toast !== null && (
        <View style={styles.toastWrapper} pointerEvents="box-none">
          <AlertToast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />
        </View>
      )}

      <View
        style={[
          styles.mainLayout,
          { borderColor: colors.border, backgroundColor: colors.cardBg },
          isLargeScreen ? styles.rowLayout : styles.columnLayout,
        ]}
      >
        {(!selectedConversation || isLargeScreen) && (
          <View style={isLargeScreen ? styles.sidebarDesktop : styles.fullWidth}>
            <ChatSidebar
              conversations={conversations}
              currentUserId={user?.id}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
              onOpenCreateDirect={() => setIsDirectModalOpen(true)}
              onOpenCreateGroup={() => setIsGroupModalOpen(true)}
              isLoading={isLoadingConversations}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filter={filter}
              onFilterChange={setFilter}
              onMarkAsRead={markAsRead}
              onMarkAsUnread={markAsUnread}
              onArchive={archiveConversation}
              onUnarchive={unarchiveConversation}
              onDelete={handleDeleteConversation}
            />
          </View>
        )}

        {(selectedConversation || isLargeScreen) && (
          <View style={styles.activePaneContainer}>
            <ChatActivePane
              conversation={selectedConversation}
              messages={messages}
              currentUserId={user?.id}
              currentUserName={user?.name}
              showBackButton={!isLargeScreen}
              onBack={() => setSelectedConversation(null)}
              onSendMessage={handleSendMessage}
              onRetryMessage={retryMessage}
              onEditMessage={editMessage}
              onUnsendMessage={unsendMessage}
              onReactMessage={reactToMessage}
              onTyping={sendTypingNotification}
              typingUsers={typingUsers}
              isSending={isSending}
            />
          </View>
        )}
      </View>

      <CreateDirectChatModal
        visible={isDirectModalOpen}
        onClose={() => setIsDirectModalOpen(false)}
        onSubmit={handleCreateDirectChat}
        isSubmitting={isSubmitting}
      />

      <CreateGroupChatModal
        visible={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSubmit={handleCreateGroup}
        isSubmitting={isSubmitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    padding: 0,
    position: 'relative',
  },
  toastWrapper: {
    position: 'absolute',
    top: 12,
    zIndex: 9999,
    width: '90%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  mainLayout: {
    flex: 1,
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  rowLayout: {
    flexDirection: 'row',
  },
  columnLayout: {
    flexDirection: 'column',
  },
  sidebarDesktop: {
    width: 320,
    height: '100%',
  },
  fullWidth: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  activePaneContainer: {
    flex: 1,
    height: '100%',
  },
});
