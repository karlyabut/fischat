import { doc, setDoc, getDoc, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface ChatMessage {
  id?: string;
  userId: string;
  userEmail: string;
  question: string;
  answer: string;
  symbol?: string;
  stockData?: any;
  dataTypes?: {
    hasEarningsCalls: boolean;
    hasFinancialData: boolean;
    hasCompanyInfo: boolean;
    hasBasicData: boolean;
  };
  model?: string;
  usage?: any;
  createdAt: Date;
  timestamp?: any;
  dataPoints?: Array<{
    label: string;
    value: number;
    unit: string;
    type: 'revenue' | 'growth' | 'percentage' | 'ratio' | 'metric' | 'other';
    year?: number;
    period?: string;
  }>;
  visualizationData?: {
    operatingExpenses?: Array<{label: string; value: number}>;
    costAndExpenses?: Array<{label: string; value: number}>;
    interestIncome?: Array<{label: string; value: number}>;
    interestExpense?: Array<{label: string; value: number}>;
    netIncome?: Array<{label: string; value: number}>;
  };
}

export interface ChatSession {
  id?: string;
  userId: string;
  userEmail: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
  title?: string;
}

export async function saveChatMessage(message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<string> {
  try {
    const chatRef = collection(db, "chat_history");
    const docRef = await addDoc(chatRef, {
      ...message,
      timestamp: serverTimestamp(),
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving chat message:", error);
    throw error;
  }
}

export async function getUserChatHistory(userEmail: string, limit: number = 50): Promise<ChatMessage[]> {
  try {
    const chatRef = collection(db, "chat_history");
    const q = query(
      chatRef,
      where("userEmail", "==", userEmail),
      orderBy("timestamp", "desc"),
      // Note: Firestore requires a composite index for this query
      // You may need to create one in the Firebase console
    );
    
    const querySnapshot = await getDocs(q);
    const messages: ChatMessage[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        createdAt: data.timestamp?.toDate?.() || data.createdAt || new Date(),
      } as ChatMessage);
    });
    
    return messages.slice(0, limit);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}

export async function getChatMessage(messageId: string): Promise<ChatMessage | null> {
  try {
    const chatRef = doc(db, "chat_history", messageId);
    const chatDoc = await getDoc(chatRef);
    
    if (chatDoc.exists()) {
      const data = chatDoc.data();
      return {
        id: chatDoc.id,
        ...data,
        createdAt: data.timestamp?.toDate?.() || data.createdAt || new Date(),
      } as ChatMessage;
    }
    return null;
  } catch (error) {
    console.error("Error fetching chat message:", error);
    return null;
  }
}

export async function deleteChatMessage(messageId: string): Promise<boolean> {
  try {
    const chatRef = doc(db, "chat_history", messageId);
    await deleteDoc(chatRef);
    return true;
  } catch (error) {
    console.error("Error deleting chat message:", error);
    return false;
  }
}

export async function getUserChatStats(userEmail: string): Promise<{
  totalMessages: number;
  totalQuestions: number;
  firstMessageDate: Date | null;
  lastMessageDate: Date | null;
  symbolsAsked: string[];
}> {
  try {
    const messages = await getUserChatHistory(userEmail, 1000); // Get all messages for stats
    
    const symbols = [...new Set(messages.map(m => m.symbol).filter((symbol): symbol is string => Boolean(symbol)))];
    const dates = messages.map(m => m.createdAt).sort((a, b) => a.getTime() - b.getTime());
    
    return {
      totalMessages: messages.length,
      totalQuestions: messages.length,
      firstMessageDate: dates.length > 0 ? dates[0] : null,
      lastMessageDate: dates.length > 0 ? dates[dates.length - 1] : null,
      symbolsAsked: symbols,
    };
  } catch (error) {
    console.error("Error getting chat stats:", error);
    return {
      totalMessages: 0,
      totalQuestions: 0,
      firstMessageDate: null,
      lastMessageDate: null,
      symbolsAsked: [],
    };
  }
} 