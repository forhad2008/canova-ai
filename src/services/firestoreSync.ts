import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Task, StudyMaterial, WorkToolItem, TaskReminder } from '../types';

/**
 * Real-time listener for tasks
 */
export const subscribeToTasks = (onUpdate: (tasks: Task[]) => void) => {
  const tasksCol = collection(db, 'tasks');
  return onSnapshot(
    tasksCol,
    (snapshot) => {
      const items: Task[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Task[];
      onUpdate(items);
    },
    (error) => {
      console.warn('Tasks subscription error, falling back:', error.message);
    }
  );
};

export const saveTaskToFirestore = async (task: Task) => {
  try {
    const taskRef = doc(db, 'tasks', task.id);
    await setDoc(taskRef, task, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `tasks/${task.id}`);
  }
};

export const deleteTaskFromFirestore = async (taskId: string) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `tasks/${taskId}`);
  }
};

/**
 * Real-time listener for study materials
 */
export const subscribeToStudyMaterials = (onUpdate: (items: StudyMaterial[]) => void) => {
  const materialsCol = collection(db, 'study_materials');
  return onSnapshot(
    materialsCol,
    (snapshot) => {
      const items: StudyMaterial[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as StudyMaterial[];
      onUpdate(items);
    },
    (error) => {
      console.warn('Study materials subscription error:', error.message);
    }
  );
};

export const saveStudyMaterialToFirestore = async (item: StudyMaterial) => {
  try {
    const ref = doc(db, 'study_materials', item.id);
    await setDoc(ref, item, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `study_materials/${item.id}`);
  }
};

export const deleteStudyMaterialFromFirestore = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'study_materials', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `study_materials/${id}`);
  }
};

/**
 * Real-time listener for work tools
 */
export const subscribeToWorkTools = (onUpdate: (items: WorkToolItem[]) => void) => {
  const toolsCol = collection(db, 'work_tools');
  return onSnapshot(
    toolsCol,
    (snapshot) => {
      const items: WorkToolItem[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as WorkToolItem[];
      onUpdate(items);
    },
    (error) => {
      console.warn('Work tools subscription error:', error.message);
    }
  );
};

export const saveWorkToolToFirestore = async (item: WorkToolItem) => {
  try {
    const ref = doc(db, 'work_tools', item.id);
    await setDoc(ref, item, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `work_tools/${item.id}`);
  }
};

export const deleteWorkToolFromFirestore = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'work_tools', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `work_tools/${id}`);
  }
};

/**
 * Real-time listener for task reminders
 */
export const subscribeToReminders = (onUpdate: (items: TaskReminder[]) => void) => {
  const col = collection(db, 'reminders');
  return onSnapshot(
    col,
    (snapshot) => {
      const items: TaskReminder[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as TaskReminder[];
      onUpdate(items);
    },
    (error) => {
      console.warn('Reminders subscription error:', error.message);
    }
  );
};

export const saveReminderToFirestore = async (reminder: TaskReminder) => {
  try {
    const ref = doc(db, 'reminders', reminder.id);
    await setDoc(ref, reminder, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `reminders/${reminder.id}`);
  }
};

export const deleteReminderFromFirestore = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'reminders', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `reminders/${id}`);
  }
};
