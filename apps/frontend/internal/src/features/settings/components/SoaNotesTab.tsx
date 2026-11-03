import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import {
  COLORS,
  Icon as Lucide,
  useTheme,
  toast,
} from '@edge/ui';
import { SoaNote, soaNoteService, useSoaNotes } from '@edge/api';

interface SoaNotesTabProps {
  tenantId?: string;
  tenantName?: string;
}

export function SoaNotesTab({ tenantId, tenantName }: SoaNotesTabProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch regional SOA notes with SWR
  const { notes, isLoading, isError, mutate } = useSoaNotes({
    tenantId: tenantId ?? undefined,
    pageSize: 100,
    enabled: true,
  });

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SoaNote | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation State
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [deleteNoteTitle, setDeleteNoteTitle] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter notes
  const filteredNotes = useMemo(() => {
    if (searchQuery.trim().length === 0) return notes;
    const lower = searchQuery.toLowerCase();
    return notes.filter((n) => {
      const codeMatch = typeof n.code === 'string' && n.code.toLowerCase().includes(lower);
      const titleMatch = typeof n.title === 'string' && n.title.toLowerCase().includes(lower);
      const notesMatch = typeof n.notes === 'string' && n.notes.toLowerCase().includes(lower);
      return codeMatch || titleMatch || notesMatch;
    });
  }, [notes, searchQuery]);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setFormCode('DEFAULT');
    setFormTitle('Official Regional Assessment Notes');
    setFormNotes(
      '1) Use additional sheets, if necessary to show detailed computation.\n' +
      '2) Payment should be in cash or checks in the form of manager\'s/cashier\'s check, demand draft check, or postal money order payable to National Telecommunications Commission, FAO Bureau of the Treasury.'
    );
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: SoaNote) => {
    setEditingNote(note);
    setFormCode(note.code ?? '');
    setFormTitle(note.title ?? '');
    setFormNotes(note.notes ?? '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const handleSave = async () => {
    const trimmedNotes = formNotes.trim();
    if (trimmedNotes.length === 0) {
      toast.error('Notes / Instructions content cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingNote !== null) {
        const result = await soaNoteService.updateNote(editingNote.id, {
          id: editingNote.id,
          code: formCode.trim() || null,
          title: formTitle.trim() || null,
          notes: trimmedNotes,
          tenantId: tenantId ?? null,
        });

        if (result !== null) {
          toast.success('Regional SOA note updated successfully.');
          await mutate();
          setIsModalOpen(false);
          setEditingNote(null);
        } else {
          toast.error('Failed to update SOA note template.');
        }
      } else {
        const result = await soaNoteService.createNote({
          code: formCode.trim() || null,
          title: formTitle.trim() || null,
          notes: trimmedNotes,
          tenantId: tenantId ?? null,
        });

        if (result !== null) {
          toast.success('New regional SOA note template created.');
          await mutate();
          setIsModalOpen(false);
          setEditingNote(null);
        } else {
          toast.error('Failed to create SOA note template.');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving SOA note template.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteNoteId === null) return;
    setIsDeleting(true);
    try {
      const success = await soaNoteService.deleteNote(deleteNoteId);
      if (success) {
        toast.success('SOA note template removed.');
        await mutate();
        setDeleteNoteId(null);
      } else {
        toast.error('Failed to delete SOA note.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting SOA note template.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Regional Baseline Advisory Banner ── */}
      <View style={[styles.advisoryCard, { backgroundColor: isDark ? colors.brand[900] : '#F0F9FF', borderColor: isDark ? colors.brand[800] : '#BAE6FD' }]}>
        <View style={styles.advisoryHeader}>
          <Lucide name="shield" size={18} color={isDark ? colors.brand[400] : '#0284C7'} />
          <Text style={[styles.advisoryTitle, { color: isDark ? colors.brand[300] : '#0369A1' }]}>
            Regional SOA Baseline &amp; Snapshot Architecture
          </Text>
        </View>
        <Text style={[styles.advisoryBody, { color: isDark ? colors.neutral[300] : '#0C4A6E' }]}>
          These templates serve as the region&apos;s baseline assessment remarks and payment instructions for {tenantName ?? 'this Region'}. When an evaluator generates an SOA, the selected template is copied directly onto the billing record as an immutable string snapshot. Any subsequent changes to templates in this regional registry will not alter previously issued billing documents.
        </Text>
      </View>

      {/* ── Control Bar: Search & Add Button ── */}
      <View style={[styles.controlBar, !isDesktop && styles.controlBarMobile]}>
        <View style={[styles.searchBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral.white, borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}>
          <Lucide name="search" size={16} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}
            placeholder="Search regional SOA notes & instructions..."
            placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Lucide name="x" size={16} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
            </Pressable>
          )}
        </View>

        <Pressable
          style={[styles.addBtn, { backgroundColor: isDark ? colors.brand[600] : colors.brand[700] }]}
          onPress={handleOpenCreate}
        >
          <Lucide name="plus" size={16} color={colors.neutral.white} />
          <Text style={styles.addBtnText}>New SOA Note Template</Text>
        </Pressable>
      </View>

      {/* ── Notes List ── */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.brand[600]} />
          <Text style={[styles.loaderText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
            Loading regional SOA note templates...
          </Text>
        </View>
      ) : isError ? (
        <View style={[styles.emptyCard, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
          <Lucide name="alert-triangle" size={32} color={COLORS.semantic.error} />
          <Text style={[styles.emptyTitle, { color: isDark ? colors.neutral[200] : colors.neutral[800] }]}>
            Failed to load SOA note templates
          </Text>
          <Pressable style={styles.retryBtn} onPress={() => void mutate()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : filteredNotes.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: isDark ? colors.neutral[800] : colors.neutral[200] }]}>
          <Lucide name="file-text" size={36} color={isDark ? colors.neutral[600] : colors.neutral[400]} />
          <Text style={[styles.emptyTitle, { color: isDark ? colors.neutral[200] : colors.neutral[800] }]}>
            {searchQuery ? 'No templates match your query' : 'No Regional SOA Note Templates Yet'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
            {searchQuery
              ? 'Try using different search keywords or clearing the search box.'
              : 'Create a default template so evaluators have standard regional bank and payment guidelines prefilled on Statements of Account.'}
          </Text>
          {!searchQuery && (
            <Pressable style={[styles.addBtn, { marginTop: 12 }]} onPress={handleOpenCreate}>
              <Lucide name="plus" size={16} color={colors.neutral.white} />
              <Text style={styles.addBtnText}>Create Initial Template</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.notesGrid}>
          {filteredNotes.map((note) => {
            const isDefault = note.code === 'DEFAULT' || (typeof note.title === 'string' && note.title.toLowerCase().includes('default'));

            return (
              <View
                key={note.id}
                style={[
                  styles.noteCard,
                  {
                    backgroundColor: isDark ? colors.neutral[900] : colors.neutral.white,
                    borderColor: isDefault
                      ? (isDark ? colors.brand[700] : colors.brand[300])
                      : (isDark ? colors.neutral[800] : colors.neutral[200]),
                  },
                ]}
              >
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.noteTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                        {note.title || 'Untitled Note'}
                      </Text>
                      {isDefault && (
                        <View style={[styles.defaultBadge, { backgroundColor: isDark ? colors.brand[900] : colors.brand[100] }]}>
                          <Text style={[styles.defaultBadgeText, { color: isDark ? colors.brand[300] : colors.brand[700] }]}>
                            DEFAULT
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.codeRow}>
                      <Text style={[styles.codeLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                        Code:
                      </Text>
                      <Text style={[styles.codeValue, { color: isDark ? colors.brand[400] : colors.brand[600] }]}>
                        {note.code || 'None'}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.cardActions}>
                    <Pressable
                      style={[styles.iconBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
                      onPress={() => handleOpenEdit(note)}
                      accessibilityLabel="Edit Template"
                    >
                      <Lucide name="edit-2" size={15} color={isDark ? colors.neutral[200] : colors.neutral[700]} />
                    </Pressable>
                    <Pressable
                      style={[styles.iconBtn, styles.deleteIconBtn]}
                      onPress={() => {
                        setDeleteNoteId(note.id);
                        setDeleteNoteTitle(note.title || note.code || 'this template');
                      }}
                      accessibilityLabel="Delete Template"
                    >
                      <Lucide name="trash-2" size={15} color={COLORS.semantic.error} />
                    </Pressable>
                  </View>
                </View>

                {/* Instruction / Assessment Remarks Content */}
                <View style={[styles.notesContentBox, { backgroundColor: isDark ? '#020617' : '#F8FAFC', borderColor: isDark ? colors.neutral[800] : '#E2E8F0' }]}>
                  <Text style={[styles.notesContentHeader, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    SOA ASSESSMENT REMARKS &amp; PAYMENT INSTRUCTIONS:
                  </Text>
                  <Text style={[styles.notesContentText, { color: isDark ? colors.neutral[200] : colors.neutral[800] }]}>
                    {note.notes}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal visible={isModalOpen} transparent animationType="fade" onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxWidth: 620, backgroundColor: isDark ? colors.neutral[900] : colors.neutral.white }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200] }]}>
              <View style={styles.modalTitleBlock}>
                <Lucide name="file-text" size={20} color={isDark ? colors.brand[400] : colors.brand[600]} />
                <Text style={[styles.modalTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                  {editingNote !== null ? 'Edit SOA Note Template' : 'New Regional SOA Note Template'}
                </Text>
              </View>
              <Pressable onPress={handleCloseModal} disabled={isSaving}>
                <Lucide name="x" size={20} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
              </Pressable>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  TEMPLATE CODE (E.G. DEFAULT, WIRE, OVER-THE-COUNTER)
                </Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral.white, borderColor: isDark ? colors.neutral[700] : colors.neutral[300], color: isDark ? colors.neutral[100] : colors.neutral[900] }]}
                  placeholder="DEFAULT"
                  placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                  value={formCode}
                  onChangeText={setFormCode}
                  editable={!isSaving}
                />
                <Text style={[styles.fieldHelper, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                  Use &apos;DEFAULT&apos; to automatically prefill this template when evaluators open Generate SOA.
                </Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  TEMPLATE TITLE / DISPLAY LABEL
                </Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral.white, borderColor: isDark ? colors.neutral[700] : colors.neutral[300], color: isDark ? colors.neutral[100] : colors.neutral[900] }]}
                  placeholder="Official Regional Payment Guidelines"
                  placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                  value={formTitle}
                  onChangeText={setFormTitle}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                  SOA NOTES &amp; PAYMENT INSTRUCTIONS CONTENT *
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    styles.modalTextArea,
                    { backgroundColor: isDark ? colors.neutral[800] : colors.neutral.white, borderColor: isDark ? colors.neutral[700] : colors.neutral[300], color: isDark ? colors.neutral[100] : colors.neutral[900] },
                  ]}
                  placeholder="Enter detailed payment instructions, authorized bank branches, manager's check payee names..."
                  placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                  value={formNotes}
                  onChangeText={setFormNotes}
                  multiline={true}
                  numberOfLines={6}
                  editable={!isSaving}
                  textAlignVertical="top"
                />
              </View>

              {/* Live Preview Box */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                  LIVE SOA PREVIEW (HOW IT APPEARS ON ISSUED STATEMENT OF ACCOUNT)
                </Text>
                <View style={[styles.previewBox, { backgroundColor: isDark ? '#020617' : '#F8FAFC', borderColor: isDark ? colors.neutral[700] : '#CBD5E1' }]}>
                  <Text style={[styles.previewBoxHeader, { color: isDark ? colors.neutral[400] : '#475569' }]}>
                    NOTES / REMARKS:
                  </Text>
                  <Text style={[styles.previewBoxText, { color: isDark ? colors.neutral[200] : '#1E293B' }]}>
                    {formNotes.trim() || 'No remarks text provided yet.'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={[styles.modalFooter, { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[200] }]}>
              <Pressable style={[styles.cancelBtn, { borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]} onPress={handleCloseModal} disabled={isSaving}>
                <Text style={[styles.cancelBtnText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, { backgroundColor: isDark ? colors.brand[600] : colors.brand[700], opacity: isSaving ? 0.7 : 1 }]}
                onPress={() => void handleSave()}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.neutral.white} />
                ) : (
                  <>
                    <Lucide name="save" size={16} color={colors.neutral.white} />
                    <Text style={styles.saveBtnText}>
                      {editingNote !== null ? 'Save Changes' : 'Create Template'}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal visible={deleteNoteId !== null} transparent animationType="fade" onRequestClose={() => setDeleteNoteId(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxWidth: 440, backgroundColor: isDark ? colors.neutral[900] : colors.neutral.white }]}>
            <View style={styles.deleteModalHeader}>
              <View style={styles.deleteIconCircle}>
                <Lucide name="alert-triangle" size={24} color={COLORS.semantic.error} />
              </View>
              <Text style={[styles.deleteModalTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                Delete SOA Note Template?
              </Text>
              <Text style={[styles.deleteModalBody, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                Are you sure you want to delete &quot;{deleteNoteTitle}&quot;? Previously issued Statements of Account that saved this note will remain unchanged, but it will no longer be available for newly issued SOAs.
              </Text>
            </View>

            <View style={styles.deleteModalFooter}>
              <Pressable style={styles.cancelBtn} onPress={() => setDeleteNoteId(null)} disabled={isDeleting}>
                <Text style={[styles.cancelBtnText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>Keep</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmDeleteBtn, { opacity: isDeleting ? 0.7 : 1 }]}
                onPress={() => void handleConfirmDelete()}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.neutral.white} />
                ) : (
                  <Text style={styles.confirmDeleteBtnText}>Delete Template</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
  },
  advisoryCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  advisoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  advisoryBody: {
    fontSize: 11.5,
    lineHeight: 17,
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  controlBarMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addBtnText: {
    color: COLORS.neutral.white,
    fontSize: 13,
    fontWeight: '600',
  },
  loaderContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 13,
  },
  emptyCard: {
    padding: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 440,
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.brand.indigoHover,
    borderRadius: 6,
  },
  retryBtnText: {
    color: COLORS.neutral.white,
    fontSize: 12,
    fontWeight: '600',
  },
  notesGrid: {
    gap: 14,
  },
  noteCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  defaultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  codeLabel: {
    fontSize: 11,
  },
  codeValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIconBtn: {
    backgroundColor: '#FEE2E2',
  },
  notesContentBox: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
  },
  notesContentHeader: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  notesContentText: {
    fontSize: 12,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
  modalTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalBody: {
    padding: 14,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  fieldHelper: {
    fontSize: 10.5,
    marginTop: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 13,
  },
  modalTextArea: {
    height: 120,
    paddingVertical: 8,
  },
  previewBox: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
  },
  previewBoxHeader: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewBoxText: {
    fontSize: 11.5,
    lineHeight: 17,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
  },
  saveBtnText: {
    color: COLORS.neutral.white,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteModalHeader: {
    alignItems: 'center',
    padding: 20,
  },
  deleteIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  deleteModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteModalBody: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  deleteModalFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  confirmDeleteBtn: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 6,
    backgroundColor: COLORS.semantic.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteBtnText: {
    color: COLORS.neutral.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
