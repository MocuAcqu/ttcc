import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vote from '@/lib/models/Vote';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { name, phone, reason, popularVote, innovationVote, impactVote } = body;

    if (!name || !phone || popularVote === undefined || innovationVote === undefined || impactVote === undefined) {
      return NextResponse.json({ success: false, message: '請確實完成三個獎項的投票與基本資料' }, { status: 400 });
    }

    const uniqueCheck = new Set([popularVote, innovationVote, impactVote]);
    if (uniqueCheck.size !== 3) {
      return NextResponse.json({ success: false, message: '三個獎項必須投給不同的組別' }, { status: 400 });
    }

    const existingVote = await Vote.findOne({ phone });
    if (existingVote) {
      return NextResponse.json({ success: false, message: '此電話號碼已經投過票囉！一人僅限一票。' }, { status: 400 });
    }

    const newVote = await Vote.create({
      name,
      phone,
      reason: reason || '',
      popularVote,
      innovationVote,
      impactVote,
    });

    return NextResponse.json({ success: true, data: newVote }, { status: 201 });
  } catch (error: any) {
    console.error('投票 API 錯誤:', error);
    return NextResponse.json({ success: false, message: '伺服器發生錯誤，請稍後再試' }, { status: 500 });
  }
}