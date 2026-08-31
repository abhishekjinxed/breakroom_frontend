import { useEffect, useRef, useState } from "react";

import { router, useLocalSearchParams } from "expo-router";
import {
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getSocket } from "../../services/socket";
import { leaveBored } from "../../api/bored";
import { getChatMessages } from "../../api/chat";
import { requestWorkCircleFromChat } from "../../api/work-circle";
import { deleteDirectConversation, getDirectConversation, updateProfileSharing } from "../../api/inbox";
import { Brand } from "../../constants/brand";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export default function ChatScreen() {
  const { token, user } = useAuth();
  const { colors } = useTheme();
  const { chatId, direct } = useLocalSearchParams<{
    chatId: string;
    direct?: string;
  }>();
  const isDirect = direct === "1";

  const [messages, setMessages] = useState<Message[]>([]);

  const [text, setText] = useState("");

  const [connected, setConnected] = useState(false);

  const [joined, setJoined] = useState(false);

  const [chatError, setChatError] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileSharing, setProfileSharing] = useState({ isSharingMyProfile: false, canViewMemberProfile: false, memberId: null as string | null });

  const inputRef = useRef<TextInput>(null);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!chatId) {
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      if (!token) return;
      try {
        if (isDirect) {
          const conversation = await getDirectConversation(token, chatId);
          if (!cancelled) {
            setMessages(conversation.messages.map((message) => ({ ...message, chatId: message.chatId ?? chatId })));
            setProfileSharing(conversation.profileSharing);
          }
        } else {
          const history = await getChatMessages(token, chatId);
          if (!cancelled) setMessages(history.map((message) => ({ ...message, chatId: message.chatId ?? chatId })));
        }
      } catch (error) {
        console.error("CHAT HISTORY ERROR:", error);
        if (!cancelled) setChatError("Unable to load chat history");
      }
    }
    loadHistory();

    const socket = getSocket();

    if (!socket) {
      console.error("❌ No Socket.IO connection");

      return;
    }

    console.log("Joining chat:", chatId);

    setConnected(socket.connected);
    setJoined(false);
    setChatError(null);

    // Join the Socket.IO chat room
    socket.emit("chat:join", chatId);

    const handleConnect = () => {
      setConnected(true);

      socket.emit("chat:join", chatId);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleJoined = (data: { chatId: string }) => {
      console.log("✅ Joined chat:", data.chatId);

      if (data.chatId === chatId) {
        setJoined(true);
      }
    };

    const handleMessage = (message: Message) => {
      console.log("💬 Message received:", message);

      setMessages((current) => {
        // Prevent duplicate messages
        if (current.some((item) => item.id === message.id)) {
          return current;
        }

        return [...current, message];
      });
    };

    const handleError = (error: { message: string }) => {
      console.error("CHAT SOCKET ERROR:", error.message);
      setJoined(false);
      setChatError(error.message);
    };

    const handlePartnerLeft = (data: { chatId: string }) => {
      if (data.chatId === chatId) {
        router.replace("/");
      }
    };

    const handleInboxUpdated = async (data: { chatId: string }) => {
      if (!isDirect || data.chatId !== chatId || !token) return;
      try {
        const conversation = await getDirectConversation(token, chatId);
        if (!cancelled) setProfileSharing(conversation.profileSharing);
      } catch {
        // The conversation may have been removed while the update was in flight.
      }
    };

    socket.on("connect", handleConnect);

    socket.on("disconnect", handleDisconnect);

    socket.on("chat:joined", handleJoined);

    socket.on("chat:message", handleMessage);

    socket.on("chat:error", handleError);

    socket.on("chat:partner-left", handlePartnerLeft);

    socket.on("inbox:updated", handleInboxUpdated);

    return () => {
      cancelled = true;
      socket.off("connect", handleConnect);

      socket.off("disconnect", handleDisconnect);

      socket.off("chat:joined", handleJoined);

      socket.off("chat:message", handleMessage);

      socket.off("chat:error", handleError);

      socket.off("chat:partner-left", handlePartnerLeft);

      socket.off("inbox:updated", handleInboxUpdated);
    };
  }, [chatId, token, isDirect]);

  function sendMessage() {
    const message = text.trim();

    if (!message) {
      return;
    }

    if (!chatId) {
      return;
    }

    const socket = getSocket();

    if (!socket) {
      console.error("Socket not available");

      return;
    }

    if (!socket.connected) {
      console.error("Socket is disconnected");

      return;
    }

    setSending(true);

    socket.emit("chat:message", {
      chatId,
      text: message,
    });

    setText("");

    setSending(false);

    inputRef.current?.focus();
  }

  async function handleLeaveChat() {
    if (isDirect) {
      router.back();
      return;
    }
    try {
      if (token) {
        await leaveBored(token);
      }
    } catch (error) {
      console.error("LEAVE CHAT ERROR:", error);
    } finally {
      router.replace("/");
    }
  }

  async function addToWorkCircle() {
    if (!token || !chatId || isDirect) return;
    try { const result = await requestWorkCircleFromChat(token, chatId); Alert.alert("Work Circle", result.message ?? "Connection request sent."); }
    catch (error: any) { Alert.alert("Work Circle", error?.response?.data?.message ?? "We could not send the request."); }
  }

  function confirmDeleteConversation() {
    if (!token || !chatId) return;
    setDeleteError(null);
    setDeleteOpen(true);
  }

  async function deleteConversation() {
    if (!token || !chatId || deleting) return;
    try { setDeleting(true); const result = await deleteDirectConversation(token, chatId); if (!result.removed) throw new Error("Conversation is no longer available"); setDeleteOpen(false); router.replace("/inbox" as any); }
    catch (error: any) { setDeleteError(error?.response?.data?.message || "Could not delete this conversation. Please try again."); }
    finally { setDeleting(false); }
  }

  async function toggleProfileSharing() {
    if (!token || !chatId || !isDirect || profileBusy) return;
    try {
      setProfileBusy(true);
      const result = await updateProfileSharing(token, chatId, !profileSharing.isSharingMyProfile);
      setProfileSharing((current) => ({ ...current, isSharingMyProfile: result.isSharingMyProfile }));
    } catch (error: any) {
      Alert.alert("Profile sharing", error?.response?.data?.message ?? "We could not update profile sharing. Please try again.");
    } finally {
      setProfileBusy(false);
    }
  }

  function openMemberProfile() {
    if (!profileSharing.canViewMemberProfile || !profileSharing.memberId) return;
    router.push(`/profile/${profileSharing.memberId}?fromChat=1` as any);
  }

  function renderMessage({ item }: { item: Message }) {
    const isOwnMessage = item.senderId === user?.id;

    return (
      <View
        style={[
          styles.messageRow,
          isOwnMessage ? styles.ownMessageRow : styles.otherMessageRow,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.canvas }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {/* HEADER */}

      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleLeaveChat}
          style={styles.backButton}
        >
          <Text style={[styles.leaveText, { color: isDirect ? colors.teal : Brand.colors.danger }]}>{isDirect ? "Back" : "Leave chat"}</Text>
        </TouchableOpacity>

        <TouchableOpacity disabled={!isDirect || !profileSharing.canViewMemberProfile} onPress={openMemberProfile} style={styles.headerCenter}>
          <Text style={[styles.username, { color: colors.navy }]}>{isDirect ? profileSharing.canViewMemberProfile ? "Work Circle ›" : "Work Circle" : "Breakroom chat"}</Text>

          <Text
            style={[
              styles.status,
              {
                color: chatError
                  ? Brand.colors.danger
                  : joined && connected
                    ? Brand.colors.green
                    : Brand.colors.muted,
              },
            ]}
          >
            {chatError
              ? chatError
              : joined
                ? "● Connected"
                : "○ Joining chat..."}
          </Text>
        </TouchableOpacity>

        {isDirect ? <TouchableOpacity onPress={() => setOptionsOpen(true)} style={styles.circleLink}><Text style={styles.circleLinkText}>•••</Text></TouchableOpacity> : <TouchableOpacity onPress={addToWorkCircle} style={styles.circleLink}><Text style={styles.circleLinkText}>Add</Text></TouchableOpacity>}
      </View>

      {/* MESSAGES */}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={
          messages.length === 0 ? styles.emptyList : styles.messageList
        }
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({
            animated: true,
          })
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emoji}>👋</Text>

            <Text style={styles.emptyTitle}>You're connected!</Text>

            <Text style={styles.emptyText}>
              Say hi and start the conversation.
            </Text>
          </View>
        }
      />

      {/* INPUT */}

      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { backgroundColor: colors.tealSoft, color: colors.text }]}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          submitBehavior="submit"
          maxLength={2000}
          editable={connected && joined}
          onKeyPress={(event) => {
            if (
              Platform.OS === "web" &&
              event.nativeEvent.key === "Enter"
            ) {
              event.preventDefault();
              sendMessage();
            }
          }}
          onSubmitEditing={() => {
            sendMessage();
          }}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!text.trim() || !connected || !joined || sending) &&
              styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!text.trim() || !connected || !joined || sending}
        >
          <Text style={styles.sendText}>↑</Text>
        </TouchableOpacity>
      </View>
      <Modal transparent visible={deleteOpen} animationType="fade" onRequestClose={() => setDeleteOpen(false)}><View style={styles.deleteBackdrop}><View style={[styles.deleteCard, { backgroundColor: colors.surface }]}><Text style={[styles.deleteTitle, { color: colors.navy }]}>Delete conversation?</Text><Text style={[styles.deleteCopy, { color: colors.muted }]}>This removes the private chat for both people and ends the Work Circle connection.</Text>{deleteError && <Text style={styles.deleteError}>{deleteError}</Text>}<View style={styles.deleteActions}><TouchableOpacity disabled={deleting} onPress={() => setDeleteOpen(false)} style={[styles.cancelDelete, { borderColor: colors.border }]}><Text style={[styles.cancelDeleteText, { color: colors.muted }]}>Cancel</Text></TouchableOpacity><TouchableOpacity disabled={deleting} onPress={deleteConversation} style={styles.confirmDelete}><Text style={styles.confirmDeleteText}>{deleting ? "Deleting…" : "Delete"}</Text></TouchableOpacity></View></View></View></Modal>
      <Modal transparent visible={optionsOpen} animationType="fade" onRequestClose={() => setOptionsOpen(false)}><View style={styles.deleteBackdrop}><View style={[styles.deleteCard, { backgroundColor: colors.surface }]}><Text style={[styles.deleteTitle, { color: colors.navy }]}>Conversation options</Text><Text style={[styles.deleteCopy, { color: colors.muted }]}>Profiles are private unless each person chooses to share theirs in this chat.</Text><TouchableOpacity disabled={profileBusy} onPress={toggleProfileSharing} style={[styles.optionAction, { borderColor: colors.border }]}><Text style={[styles.optionActionText, { color: colors.text }]}>{profileBusy ? "Saving…" : profileSharing.isSharingMyProfile ? "Stop sharing my profile" : "Share my profile"}</Text><Text style={[styles.optionHint, { color: colors.muted }]}>{profileSharing.isSharingMyProfile ? "The other person can now open your profile." : "Only the other person in this chat can view it."}</Text></TouchableOpacity>{profileSharing.canViewMemberProfile && <TouchableOpacity onPress={() => { setOptionsOpen(false); openMemberProfile(); }} style={[styles.optionAction, { borderColor: colors.border }]}><Text style={[styles.optionActionText, { color: colors.teal }]}>View their profile</Text></TouchableOpacity>}<TouchableOpacity onPress={() => { setOptionsOpen(false); confirmDeleteConversation(); }} style={[styles.optionAction, { borderColor: colors.border }]}><Text style={styles.deleteLinkText}>Delete conversation</Text></TouchableOpacity><TouchableOpacity onPress={() => setOptionsOpen(false)} style={styles.closeOptions}><Text style={[styles.cancelDeleteText, { color: colors.muted }]}>Cancel</Text></TouchableOpacity></View></View></Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.colors.canvas,
  },

  header: {
    height: 82,
    paddingTop: 24,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Brand.colors.border,
  },

  backButton: {
    width: 82,
    paddingVertical: 8,
  },

  leaveText: {
    fontSize: 14,
    fontWeight: "700",
    color: Brand.colors.danger,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerSpacer: {
    width: 82,
  },
  circleLink: { width: 82, alignItems: "flex-end", paddingVertical: 8 },
  circleLinkText: { color: Brand.colors.teal, fontSize: 13, fontWeight: "800" },
  deleteLinkText: { color: Brand.colors.danger, fontSize: 13, fontWeight: "800" },

  username: {
    fontSize: 17,
    fontWeight: "700",
    color: Brand.colors.navy,
  },

  status: {
    fontSize: 12,
    marginTop: 3,
  },

  messageList: {
    padding: 20,
    paddingBottom: 20,
  },

  messageRow: {
    marginBottom: 10,
  },

  ownMessageRow: {
    alignItems: "flex-end",
  },

  otherMessageRow: {
    alignItems: "flex-start",
  },

  messageBubble: {
    maxWidth: "80%",
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  ownMessageBubble: {
    backgroundColor: Brand.colors.bubbleOwn,
    borderBottomRightRadius: 5,
  },

  otherMessageBubble: {
    backgroundColor: Brand.colors.bubbleOther,
    borderBottomLeftRadius: 5,
  },

  messageText: {
    fontSize: 16,
    lineHeight: 21,
  },

  ownMessageText: {
    color: "#FFFFFF",
  },

  otherMessageText: {
    color: Brand.colors.text,
  },

  emptyList: {
    flexGrow: 1,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },

  emoji: {
    fontSize: 45,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 15,
    color: Brand.colors.navy,
  },

  emptyText: {
    textAlign: "center",
    color: Brand.colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: Brand.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Brand.colors.border,
    gap: 10,
  },

  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: Brand.radius.control,
    backgroundColor: "#EEF3F7",
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: Brand.colors.text,
  },

  sendButton: {
    width: 48,
    height: 48,
    borderRadius: Brand.radius.control,
    backgroundColor: Brand.colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },

  sendButtonDisabled: {
    opacity: 0.35,
  },

  sendText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  optionAction: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 13 }, optionActionText: { fontWeight: "900", fontSize: 14 }, optionHint: { fontSize: 12, lineHeight: 17, marginTop: 4 }, closeOptions: { alignItems: "center", padding: 14, marginTop: 4 },
  deleteBackdrop: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(42, 28, 21, .56)" }, deleteCard: { borderRadius: 20, padding: 22 }, deleteTitle: { fontSize: 21, fontWeight: "900" }, deleteCopy: { fontSize: 14, lineHeight: 20, marginTop: 9 }, deleteError: { color: Brand.colors.danger, fontSize: 12, lineHeight: 18, marginTop: 12 }, deleteActions: { flexDirection: "row", gap: 10, marginTop: 22 }, cancelDelete: { flex: 1, minHeight: 46, borderWidth: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" }, cancelDeleteText: { fontWeight: "800" }, confirmDelete: { flex: 1, minHeight: 46, borderRadius: 12, backgroundColor: Brand.colors.danger, alignItems: "center", justifyContent: "center" }, confirmDeleteText: { color: "#FFF", fontWeight: "900" },
});
