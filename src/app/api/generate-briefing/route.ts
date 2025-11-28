import { aiBriefingForKetua, AIBriefingForKetuaInput } from '@/ai/flows/ai-briefing-for-ketua';
import { NextResponse } from 'next/server';
import { getFirestore, collection, query, where, getDocs } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// Initialize Firebase Admin SDK
let adminApp: App;
if (!getApps().length) {
    // In a deployed environment (like Cloud Run), service account credentials
    // are often automatically discovered. For local development, you might
    // need to set the GOOGLE_APPLICATION_CREDENTIALS environment variable.
    adminApp = initializeApp();
} else {
    adminApp = getApps()[0];
}

const db = getFirestore(adminApp);


async function getBriefingData() {
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


export async function POST(req: Request) {
  try {
    const realData = await getBriefingData();
    
    const input: AIBriefingForKetuaInput = realData;
    
    // Call the exported async function which wraps the flow
    const result = await aiBriefingForKetua(input);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("SERVER ERROR in /api/generate-briefing:", error); 
    // Ensure you're not leaking sensitive details in a production environment
    const errorMessage = error.message || 'Internal Server Error';
    // Add more specific error logging here if needed
    if (error.stack) {
        console.error(error.stack);
    }
    return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
    );
  }
}
