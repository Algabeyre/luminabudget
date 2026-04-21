import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  limit,
  setDoc,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { Transaction, Budget, Category } from '../types';

const TRANSACTIONS_COL = 'transactions';
const BUDGETS_COL = 'budgets';

export const subscribeToTransactions = (userId: string, callback: (transactions: Transaction[]) => void) => {
  const q = query(
    collection(db, TRANSACTIONS_COL), 
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaction));
    callback(transactions);
  }, (error) => {
    handleFirestoreError(error, 'list', TRANSACTIONS_COL);
  });
};

export const subscribeToBudgets = (userId: string, callback: (budgets: Budget[]) => void) => {
  const q = query(
    collection(db, BUDGETS_COL), 
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const budgets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Budget));
    callback(budgets);
  }, (error) => {
    handleFirestoreError(error, 'list', BUDGETS_COL);
  });
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, TRANSACTIONS_COL), transaction);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, 'create', TRANSACTIONS_COL);
  }
};

export const updateBudgetSpent = async (userId: string, category: Category, amount: number, type: 'income' | 'expense') => {
  if (type === 'income') return; // Don't update budgets for income

  try {
    const q = query(
      collection(db, BUDGETS_COL), 
      where('userId', '==', userId),
      where('category', '==', category)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const budgetDoc = snapshot.docs[0];
      const newSpent = budgetDoc.data().spent + amount;
      await updateDoc(doc(db, BUDGETS_COL, budgetDoc.id), { spent: newSpent });
    } else {
      // Create budget if not exists
      await addDoc(collection(db, BUDGETS_COL), {
        userId,
        category,
        limit: 500, // Default limit
        spent: amount
      });
    }
  } catch (error) {
    handleFirestoreError(error, 'update', BUDGETS_COL);
  }
};

export const initializeUserBudgets = async (userId: string) => {
  const q = query(collection(db, BUDGETS_COL), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    const defaultBudgets = [
      { category: 'Food', limit: 500, spent: 0, userId },
      { category: 'Transport', limit: 200, spent: 0, userId },
      { category: 'Entertainment', limit: 150, spent: 0, userId },
      { category: 'Shopping', limit: 300, spent: 0, userId },
    ];
    
    for (const b of defaultBudgets) {
      await addDoc(collection(db, BUDGETS_COL), b);
    }
  }
};
