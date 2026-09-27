import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vote from '@/lib/models/Vote';
import Message from '@/lib/models/Message';

export async function GET() {
  try {
    await dbConnect();

    const totalVotes = await Vote.countDocuments();
    const totalMessages = await Message.countDocuments();

    const recentMessages = await Message.find({}).sort({ createdAt: -1 }).limit(20);
    const formattedMessages = recentMessages.map((msg: any) => ({
      id: msg._id.toString(),
      text: msg.text,
      time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    // 分別統計三個獎項的得票數
    const popularVotes = await Vote.aggregate([
      { $group: { _id: '$popularVote', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const innovationVotes = await Vote.aggregate([
      { $group: { _id: '$innovationVote', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const impactVotes = await Vote.aggregate([
      { $group: { _id: '$impactVote', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalProjects: 14,
        totalVotes,
        totalMessages,
        messages: formattedMessages,
        awards: {
          popular: popularVotes,
          innovation: innovationVotes,
          impact: impactVotes,
        }
      }
    });
  } catch (error) {
    console.error('取得統計與結算 API 錯誤:', error);
    return NextResponse.json({ success: false, message: '讀取數據失敗' }, { status: 500 });
  }
}