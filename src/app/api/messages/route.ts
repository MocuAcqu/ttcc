import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/lib/models/Message';

// 取得所有留言 (給大螢幕輪播用)
export async function GET() {
  try {
    await dbConnect();
    // 抓取最新的 50 則留言，按時間排序
    const messages = await Message.find({}).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ success: true, data: messages }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: '讀取留言失敗' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { text } = await request.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ success: false, message: '留言內容不能為空' }, { status: 400 });
    }

    if (text.length > 60) {
      return NextResponse.json({ success: false, message: '留言長度不得超過 60 個字' }, { status: 400 });
    }

    const newMessage = await Message.create({ text });
    return NextResponse.json({ success: true, data: newMessage }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: '發布留言失敗' }, { status: 500 });
  }
}