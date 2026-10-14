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

    const popularRaw = await Vote.aggregate([{ $group: { _id: '$popularVote', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    const innovationRaw = await Vote.aggregate([{ $group: { _id: '$innovationVote', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    const impactRaw = await Vote.aggregate([{ $group: { _id: '$impactVote', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);

    let assignedWinners = new Set<number>();

    let popularWinner = null;
    let tiedForPopular: number[] = [];
    if (popularRaw.length > 0) {
      const highestPopularCount = popularRaw[0].count;
      tiedForPopular = popularRaw.filter((v: any) => v.count === highestPopularCount).map((v: any) => v._id);
      
      popularWinner = popularRaw[0];
      assignedWinners.add(popularWinner._id);
    }

    let innovationWinner = null;
    
    // 檢查平手名單中有沒有還沒被分配到獎項的人
    const remainingTied = tiedForPopular.filter(id => !assignedWinners.has(id));

    if (remainingTied.length > 0) {
      innovationWinner = innovationRaw.find((v: any) => v._id === remainingTied[0]) || { _id: remainingTied[0], count: 0 };
    } else {
      const availableForInnovation = innovationRaw.filter((v: any) => !assignedWinners.has(v._id));
      innovationWinner = availableForInnovation.length > 0 ? availableForInnovation[0] : null;
    }

    if (innovationWinner) assignedWinners.add(innovationWinner._id);

    const availableForImpact = impactRaw.filter((v: any) => !assignedWinners.has(v._id));
    const impactWinner = availableForImpact.length > 0 ? availableForImpact[0] : null;
    if (impactWinner) assignedWinners.add(impactWinner._id);


    return NextResponse.json({
      success: true,
      data: {
        totalProjects: 14,
        totalVotes,
        totalMessages,
        messages: formattedMessages,
        awards: {
          popular: popularRaw,
          innovation: innovationRaw,
          impact: impactRaw,
        },
        // 額外回傳最終遞補後的得獎名單供結算畫面使用
        settlementWinners: {
          popular: popularWinner ? popularWinner._id : null,
          innovation: innovationWinner ? innovationWinner._id : null,
          impact: impactWinner ? impactWinner._id : null,
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: '讀取數據失敗' }, { status: 500 });
  }
}