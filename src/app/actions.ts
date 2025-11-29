'use server';

import { aiNotulenForSecretaries } from '@/ai/flows/ai-notulen-for-secretaries';
import { aiSuratResmiForSecretaries } from '@/ai/flows/ai-surat-resmi-for-secretaries';
import type { AiNotulenForSecretariesInput, AiSuratResmiForSecretariesInput, AIBriefingForKetuaInput } from '@/lib/types';
import { aiBriefingForKetua } from '@/ai/flows/ai-briefing-for-ketua';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';


export async function generateNotulenAction(input: AiNotulenForSecretariesInput) {
  try {
    const result = await aiNotulenForSecretaries(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate minutes.' };
  }
}

export async function generateSuratResmiAction(input: AiSuratResmiForSecretariesInput) {
    try {
      const result = await aiSuratResmiForSecretaries(input);
      return { success: true, data: result };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Failed to generate official letter.' };
    }
}

async function getBriefingData() {
    // Note: This now uses the client-side SDK on the server, which is fine for Server Actions.
    const { firestore: db } = initializeFirebase();

    // 1. Get Pending Fund Requests
    const fundRequestsQuery = query(collection(db, 'fundRequests'), where('status', '==', 'Pending'));
    const fundRequestsSnapshot = await getDocs(fundRequestsQuery);
    const pendingApprovalsCount = fundRequestsSnapshot.size;
    const pendingApprovalDetails = fundRequestsSnapshot.docs.map(doc => `- ${doc.data().item} dari ${doc.data().division}`).join('\n');
    const pendingApprovalsSummary = `${pendingApprovalsCount} permintaan dana menunggu persetujuan.\n${pendingApprovalDetails}`;

    // 2. Get Task Progress
    const tasksQuery = query(collection(db, 'tasks'));
    const tasksSnapshot = await getDocs(tasksQuery);
    const allTasks = tasksSnapshot.docs.map(doc => doc.data());
    const completedTasks = allTasks.filter(task => task.status === 'completed').length;
    const totalTasks = allTasks.length;
    const divisionProgressSummary = `Secara keseluruhan, ${completedTasks} dari ${totalTasks} tugas telah selesai (${totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 0}%).`;
    
    // 3. Mock Sentiment (can be replaced with real data source later)
    const sentimentAnalysis = 'Sentimen netral cenderung positif. Terdapat beberapa keluhan minor mengenai jadwal ekstrakurikuler yang bentrok.';

    return {
        pendingApprovals: pendingApprovalsSummary,
        divisionProgress: divisionProgressSummary,
        sentimentAnalysis: sentimentAnalysis,
    }
}

export async function generateBriefingAction() {
    try {
        const realData: AIBriefingForKetuaInput = await getBriefingData();
        const result = await aiBriefingForKetua(realData);
        return { success: true, data: result };
    } catch (error: any) {
        console.error("SERVER ERROR in generateBriefingAction:", error);
        const errorMessage = error.message || 'Internal Server Error';
        if (error.stack) {
            console.error(error.stack);
        }
        return { success: false, error: errorMessage };
    }
}
