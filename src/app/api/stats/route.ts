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

    const votesPerProject = await Vote.aggregate([
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalProjects: 14,
        totalVotes,
        totalMessages,
        messages: formattedMessages,
        votesPerProject,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: '讀取數據失敗' }, { status: 500 });
  }
}