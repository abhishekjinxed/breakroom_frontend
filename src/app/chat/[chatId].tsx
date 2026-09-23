import { useEffect, useRef, useState } from "react";

import { router, useLocalSearchParams } from "expo-router";
import {
  FlatList,
  Alert,
  Image,
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
import { getChatMessages } from "../../api/chat";
import { ChatConnection, ConversationPrompt, deleteDirectConversation, getDirectConversation, offerConversationPrompt, respondToConversationPrompt, updateChatPhotoSharing, updateFriendshipLevel, updateProfileSharing } from "../../api/inbox";
import { Brand } from "../../constants/brand";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { reportContent } from "../../api/safety";
import { PublicAvatar, PublicFlair, PublicIdentity } from "../../components/PublicIdentity";

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  isUnavailable?: boolean;
}

export default function ChatScreen() {
  const { token, user } = useAuth();
  const { colors } = useTheme();
  const { chatId, direct } = useLocalSearchParams<{
    chatId: string;
    direct?: string;
  }>();
  const isDirect = true;

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
  const [reportTarget, setReportTarget] = useState<Message | null>(null);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportNotice, setReportNotice] = useState<string | null>(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [connection, setConnection] = useState<ChatConnection | null>(null);
  const [connectionBusy, setConnectionBusy] = useState(false);
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null);
  const [promptAnswer, setPromptAnswer] = useState("");
  const [otherMember, setOtherMember] = useState<PublicIdentity | null>(null);
  const [profileSharing, setProfileSharing] = useState({ isSharingMyProfile: false, canViewMemberProfile: false, memberId: null as string | null, photos: [] as Array<{ id: string; url: string; visibility: "PRIVATE" | "PUBLIC"; createdAt: string; sharedWithMember: boolean }> });

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
            setOtherMember(conversation.otherMember);
            setConnection(conversation.connection);
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
        if (!cancelled) { setProfileSharing(conversation.profileSharing); setConnection(conversation.connection); }
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

  function handleLeaveChat() { router.back(); }

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

  async function toggleChatPhoto(photoId: string, share: boolean) {
    if (!token || !chatId || profileBusy) return;
    try {
      setProfileBusy(true);
      await updateChatPhotoSharing(token, chatId, photoId, share);
      setProfileSharing((current) => ({ ...current, photos: current.photos.map((photo) => photo.id === photoId ? { ...photo, sharedWithMember: share } : photo) }));
    } catch (error: any) {
      Alert.alert("Photo sharing", error?.response?.data?.message ?? "We could not update photo sharing. Please try again.");
    } finally { setProfileBusy(false); }
  }

  async function refreshConnection() {
    if (!token || !chatId) return;
    const conversation = await getDirectConversation(token, chatId);
    setConnection(conversation.connection);
  }

  async function changeFriendship(action: "REQUEST" | "ACCEPT") {
    if (!token || !chatId || connectionBusy) return;
    try {
      setConnectionBusy(true); setConnectionNotice(null);
      const result = await updateFriendshipLevel(token, chatId, action);
      setConnection(result.connection);
      setConnectionNotice(action === "ACCEPT" ? "Friendship level updated together." : "Your chat partner can choose whether to accept this step.");
    } catch (error: any) { setConnectionNotice(error?.response?.data?.message ?? "Could not update this friendship step."); }
    finally { setConnectionBusy(false); }
  }

  async function offerPrompt() {
    if (!token || !chatId || connectionBusy) return;
    try { setConnectionBusy(true); setConnectionNotice(null); await offerConversationPrompt(token, chatId); await refreshConnection(); setConnectionNotice("A private shared question is waiting for both of you."); }
    catch (error: any) { setConnectionNotice(error?.response?.data?.message ?? "Could not open a shared question."); }
    finally { setConnectionBusy(false); }
  }

  async function respondToPrompt(prompt: ConversationPrompt, action: "ACCEPT" | "DECLINE" | "ANSWER") {
    if (!token || !chatId || connectionBusy || (action === "ANSWER" && !promptAnswer.trim())) return;
    try {
      setConnectionBusy(true); setConnectionNotice(null);
      await respondToConversationPrompt(token, chatId, prompt.id, action, action === "ANSWER" ? promptAnswer.trim() : undefined);
      setPromptAnswer(""); await refreshConnection();
      if (action === "DECLINE") setConnectionNotice("No problem — the question was passed without sharing an answer.");
    } catch (error: any) { setConnectionNotice(error?.response?.data?.message ?? "Could not update this shared question."); }
    finally { setConnectionBusy(false); }
  }

  function reportMessage(message: Message) {
    if (!token || message.senderId === user?.id || message.isUnavailable) return;
    setReportNotice(null);
    setReportTarget(message);
  }
  async function confirmReportMessage() { if (!token || !reportTarget || reportBusy) return; try { setReportBusy(true); await reportContent(token, "MESSAGE", reportTarget.id, "Inappropriate chat message"); setReportNotice("Report received. A moderator will review it."); } catch (error: any) { setReportNotice(error?.response?.data?.message ?? "Couldn’t report message. Please try again."); } finally { setReportBusy(false); } }

  function renderMessage({ item }: { item: Message }) {
    const isOwnMessage = item.senderId === user?.id;
    const unavailable = !!item.isUnavailable;

    return (
      <View
        style={[
          styles.messageRow,
          unavailable ? styles.unavailableMessageRow : isOwnMessage ? styles.ownMessageRow : styles.otherMessageRow,
        ]}
      >
        <TouchableOpacity
          activeOpacity={isOwnMessage || unavailable ? 1 : 0.78}
          onLongPress={() => !unavailable && reportMessage(item)}
          delayLongPress={450}
          style={[
            styles.messageBubble,
            unavailable ? styles.unavailableMessageBubble : isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              unavailable ? styles.unavailableMessageText : isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}
          >
            {item.text}
          </Text>
        </TouchableOpacity>
        {!unavailable && !isOwnMessage && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Report message" onPress={() => reportMessage(item)} style={[styles.messageReport, { borderColor: colors.border }]}><Text style={[styles.messageReportText, { color: colors.muted }]}>•••</Text></TouchableOpacity>}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.canvas }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* HEADER */}

      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleLeaveChat}
          style={styles.backButton}
        >
          <Text style={[styles.leaveText, { color: colors.teal }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity disabled={!isDirect || !profileSharing.canViewMemberProfile} onPress={openMemberProfile} style={styles.headerCenter}>
          {otherMember ? <View style={styles.chatIdentity}><PublicAvatar member={otherMember} size={26} backgroundColor={colors.violetSoft} color={colors.violet} /><PublicFlair member={otherMember} nameColor={colors.navy} flairColor={colors.muted} compact /></View> : <Text style={[styles.username, { color: colors.navy }]}>Breakroom chat</Text>}

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

        <TouchableOpacity onPress={() => setOptionsOpen(true)} style={styles.circleLink}><Text style={styles.circleLinkText}>•••</Text></TouchableOpacity>
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
        ListHeaderComponent={isDirect && connection ? <View style={[styles.connectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.connectionEyebrow, { color: colors.teal }]}>PRIVATE FRIENDSHIP</Text>
          <Text style={[styles.connectionTitle, { color: colors.navy }]}>{connection.levelLabel}</Text>
          <Text style={[styles.connectionCopy, { color: colors.muted }]}>This connection grows only when both people choose it.</Text>
          {connection.pendingLevel && <View style={[styles.connectionCallout, { backgroundColor: colors.tealSoft }]}><Text style={[styles.connectionCopy, { color: colors.text }]}>{connection.requestedByMe ? `You asked to become ${connection.nextLevelLabel ?? connection.pendingLevel}.` : `Your chat partner would like to become ${connection.nextLevelLabel ?? connection.pendingLevel}s.`}</Text>{connection.canAcceptLevel && <TouchableOpacity disabled={connectionBusy} onPress={() => changeFriendship("ACCEPT")} style={[styles.connectionButton, { backgroundColor: colors.teal }]}><Text style={styles.connectionButtonText}>{connectionBusy ? "Saving…" : "Accept together"}</Text></TouchableOpacity>}</View>}
          {!connection.pendingLevel && connection.canRequestLevel && <TouchableOpacity disabled={connectionBusy} onPress={() => changeFriendship("REQUEST")} style={[styles.connectionButton, { backgroundColor: colors.teal }]}><Text style={styles.connectionButtonText}>{connectionBusy ? "Saving…" : `Ask to become ${connection.nextLevelLabel}s`}</Text></TouchableOpacity>}
          {connection.prompt?.status === "OFFERED" && <View style={[styles.promptCard, { borderColor: colors.border }]}><Text style={[styles.promptLabel, { color: colors.teal }]}>OPTIONAL SHARED QUESTION · {connection.prompt.targetLabel.toUpperCase()}</Text><Text style={[styles.promptQuestion, { color: colors.text }]}>{connection.prompt.question}</Text><Text style={[styles.connectionCopy, { color: colors.muted }]}>Answer only if you both want to. Nothing is revealed until both agree.</Text>{!connection.prompt.hasAnswered && <View style={styles.promptActions}><TouchableOpacity disabled={connectionBusy} onPress={() => respondToPrompt(connection.prompt!, "DECLINE")} style={[styles.promptPass, { borderColor: colors.border }]}><Text style={[styles.promptPassText, { color: colors.muted }]}>Pass</Text></TouchableOpacity><TouchableOpacity disabled={connectionBusy} onPress={() => respondToPrompt(connection.prompt!, "ACCEPT")} style={[styles.connectionButton, { backgroundColor: colors.teal, flex: 1, marginTop: 0 }]}><Text style={styles.connectionButtonText}>{connectionBusy ? "Saving…" : "I'm in"}</Text></TouchableOpacity></View>}</View>}
          {connection.prompt?.status === "ACTIVE" && <View style={[styles.promptCard, { borderColor: colors.border }]}><Text style={[styles.promptLabel, { color: colors.teal }]}>SHARED QUESTION · {connection.prompt.targetLabel.toUpperCase()}</Text><Text style={[styles.promptQuestion, { color: colors.text }]}>{connection.prompt.question}</Text>{connection.prompt.hasAnswered ? <Text style={[styles.connectionCopy, { color: colors.muted }]}>Your answer is safely held until they answer too.</Text> : <><TextInput value={promptAnswer} onChangeText={setPromptAnswer} maxLength={600} multiline placeholder="Write only what feels comfortable" placeholderTextColor={colors.muted} style={[styles.promptInput, { color: colors.text, borderColor: colors.border }]} /><TouchableOpacity disabled={connectionBusy || !promptAnswer.trim()} onPress={() => respondToPrompt(connection.prompt!, "ANSWER")} style={[styles.connectionButton, { backgroundColor: colors.teal }]}><Text style={styles.connectionButtonText}>{connectionBusy ? "Sharing…" : "Answer privately"}</Text></TouchableOpacity></>}</View>}
          {connection.prompt?.status === "COMPLETED" && <View style={[styles.promptCard, { borderColor: colors.border }]}><Text style={[styles.promptLabel, { color: colors.teal }]}>SHARED ANSWERS · {connection.prompt.targetLabel.toUpperCase()}</Text><Text style={[styles.promptQuestion, { color: colors.text }]}>{connection.prompt.question}</Text><Text style={[styles.answerLabel, { color: colors.muted }]}>Your answer</Text><Text style={[styles.answerText, { color: colors.text }]}>{connection.prompt.myAnswer}</Text><Text style={[styles.answerLabel, { color: colors.muted }]}>Their answer</Text><Text style={[styles.answerText, { color: colors.text }]}>{connection.prompt.memberAnswer}</Text></View>}
          {!connection.prompt && connection.canOfferPrompt && <TouchableOpacity disabled={connectionBusy} onPress={offerPrompt} style={[styles.promptInvite, { borderColor: colors.border }]}><Text style={[styles.promptLabel, { color: colors.teal }]}>CONVERSATION SPARK</Text><Text style={[styles.connectionCopy, { color: colors.muted }]}>Open an optional question one step beyond your current friendship level.</Text><Text style={[styles.promptInviteText, { color: colors.teal }]}>{connectionBusy ? "Opening…" : "Open a shared question"}</Text></TouchableOpacity>}
          {!!connectionNotice && <Text style={[styles.connectionNotice, { color: connectionNotice.startsWith("Could") || connectionNotice.startsWith("Keep") ? colors.danger : colors.teal }]}>{connectionNotice}</Text>}
        </View> : null}
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
      <Modal transparent visible={!!reportTarget} animationType="fade" onRequestClose={() => !reportBusy && setReportTarget(null)}><View style={styles.deleteBackdrop}><View style={[styles.deleteCard, { backgroundColor: colors.surface }]}><Text style={[styles.deleteTitle, { color: colors.navy }]}>Report message?</Text><Text style={[styles.deleteCopy, { color: colors.muted }]}>This message and its sender will be sent to the moderation team for review.</Text>{reportNotice && <Text style={[styles.deleteError, { color: reportNotice.startsWith("Report received") ? colors.teal : colors.danger }]}>{reportNotice}</Text>}<View style={styles.deleteActions}><TouchableOpacity disabled={reportBusy} onPress={() => setReportTarget(null)} style={[styles.cancelDelete, { borderColor: colors.border }]}><Text style={[styles.cancelDeleteText, { color: colors.muted }]}>Cancel</Text></TouchableOpacity><TouchableOpacity disabled={reportBusy || reportNotice?.startsWith("Report received")} onPress={confirmReportMessage} style={styles.confirmDelete}><Text style={styles.confirmDeleteText}>{reportBusy ? "Reporting…" : "Report"}</Text></TouchableOpacity></View></View></View></Modal>
      <Modal transparent visible={optionsOpen} animationType="fade" onRequestClose={() => setOptionsOpen(false)}><View style={styles.deleteBackdrop}><View style={[styles.deleteCard, { backgroundColor: colors.surface }]}><Text style={[styles.deleteTitle, { color: colors.navy }]}>Conversation options</Text><Text style={[styles.deleteCopy, { color: colors.muted }]}>Profiles are private unless each person chooses to share theirs in this chat.</Text><TouchableOpacity disabled={profileBusy} onPress={toggleProfileSharing} style={[styles.optionAction, { borderColor: colors.border }]}><Text style={[styles.optionActionText, { color: colors.text }]}>{profileBusy ? "Saving…" : profileSharing.isSharingMyProfile ? "Stop sharing my profile" : "Share my profile"}</Text><Text style={[styles.optionHint, { color: colors.muted }]}>{profileSharing.isSharingMyProfile ? "The other person can now open your profile." : "Only the other person in this chat can view it."}</Text></TouchableOpacity>{profileSharing.photos.length > 0 && <View style={[styles.photoShareSection, { borderColor: colors.border }]}><Text style={[styles.photoShareTitle, { color: colors.text }]}>Share photos with this person</Text><Text style={[styles.optionHint, { color: colors.muted }]}>Public photos are visible to everyone. Turn on a private photo to share only here.</Text><View style={styles.chatPhotos}>{profileSharing.photos.map((photo) => <TouchableOpacity key={photo.id} disabled={profileBusy} onPress={() => toggleChatPhoto(photo.id, !photo.sharedWithMember)} style={[styles.chatPhotoTile, { borderColor: photo.sharedWithMember ? colors.teal : colors.border }]}><Image source={{ uri: photo.url }} style={styles.chatPhoto} /><Text style={[styles.chatPhotoLabel, { color: photo.sharedWithMember ? colors.teal : colors.muted }]}>{photo.visibility === "PUBLIC" ? "Public" : photo.sharedWithMember ? "Shared here" : "Private"}</Text></TouchableOpacity>)}</View></View>}{profileSharing.canViewMemberProfile && <TouchableOpacity onPress={() => { setOptionsOpen(false); openMemberProfile(); }} style={[styles.optionAction, { borderColor: colors.border }]}><Text style={[styles.optionActionText, { color: colors.teal }]}>View their profile</Text></TouchableOpacity>}<TouchableOpacity onPress={() => { setOptionsOpen(false); confirmDeleteConversation(); }} style={[styles.optionAction, { borderColor: colors.border }]}><Text style={styles.deleteLinkText}>Delete conversation</Text></TouchableOpacity><TouchableOpacity onPress={() => setOptionsOpen(false)} style={styles.closeOptions}><Text style={[styles.cancelDeleteText, { color: colors.muted }]}>Cancel</Text></TouchableOpacity></View></View></Modal>
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
  chatIdentity: { flexDirection: "row", alignItems: "center", gap: 7, maxWidth: "100%" },

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
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  connectionCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 16 }, connectionEyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1 }, connectionTitle: { fontSize: 18, fontWeight: "900", marginTop: 4 }, connectionCopy: { fontSize: 12, lineHeight: 18, marginTop: 4 }, connectionCallout: { borderRadius: 12, padding: 11, marginTop: 12 }, connectionButton: { minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: 10, paddingHorizontal: 12, marginTop: 11 }, connectionButtonText: { color: "#FFF", fontWeight: "900", fontSize: 12 }, promptCard: { borderTopWidth: 1, marginTop: 13, paddingTop: 13 }, promptInvite: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 13 }, promptInviteText: { fontWeight: "900", fontSize: 12, marginTop: 9 }, promptLabel: { fontSize: 10, fontWeight: "900", letterSpacing: .8 }, promptQuestion: { fontSize: 15, fontWeight: "800", lineHeight: 21, marginTop: 7 }, promptActions: { flexDirection: "row", gap: 8, marginTop: 12 }, promptPass: { minHeight: 42, minWidth: 80, borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" }, promptPassText: { fontWeight: "800", fontSize: 12 }, promptInput: { minHeight: 70, maxHeight: 130, borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 12, textAlignVertical: "top", fontSize: 13 }, answerLabel: { fontWeight: "900", fontSize: 10, marginTop: 12 }, answerText: { fontSize: 13, lineHeight: 19, marginTop: 3 }, connectionNotice: { fontSize: 11, lineHeight: 16, fontWeight: "700", marginTop: 10 },

  ownMessageRow: {
    alignItems: "flex-end",
  },

  otherMessageRow: {
    alignItems: "flex-start",
  },
  messageReport: { width: 34, height: 32, borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  messageReportText: { fontSize: 14, fontWeight: "900", marginTop: -4 },

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
  unavailableMessageRow: { alignItems: "center" },
  unavailableMessageBubble: { backgroundColor: Brand.colors.tealSoft, borderWidth: 1, borderColor: Brand.colors.border, paddingVertical: 8 },
  unavailableMessageText: { color: Brand.colors.muted, fontSize: 13, fontStyle: "italic" },

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
  optionAction: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 13 }, optionActionText: { fontWeight: "900", fontSize: 14 }, optionHint: { fontSize: 12, lineHeight: 17, marginTop: 4 }, photoShareSection: { borderTopWidth: 1, marginTop: 15, paddingTop: 15 }, photoShareTitle: { fontWeight: "900", fontSize: 14 }, chatPhotos: { flexDirection: "row", gap: 10, marginTop: 10 }, chatPhotoTile: { width: 78, borderWidth: 2, borderRadius: 10, overflow: "hidden", paddingBottom: 6 }, chatPhoto: { width: 74, height: 72, backgroundColor: Brand.colors.border }, chatPhotoLabel: { fontSize: 10, fontWeight: "900", textAlign: "center", marginTop: 5 }, closeOptions: { alignItems: "center", padding: 14, marginTop: 4 },
  deleteBackdrop: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(42, 28, 21, .56)" }, deleteCard: { borderRadius: 20, padding: 22 }, deleteTitle: { fontSize: 21, fontWeight: "900" }, deleteCopy: { fontSize: 14, lineHeight: 20, marginTop: 9 }, deleteError: { color: Brand.colors.danger, fontSize: 12, lineHeight: 18, marginTop: 12 }, deleteActions: { flexDirection: "row", gap: 10, marginTop: 22 }, cancelDelete: { flex: 1, minHeight: 46, borderWidth: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" }, cancelDeleteText: { fontWeight: "800" }, confirmDelete: { flex: 1, minHeight: 46, borderRadius: 12, backgroundColor: Brand.colors.danger, alignItems: "center", justifyContent: "center" }, confirmDeleteText: { color: "#FFF", fontWeight: "900" },
});
