import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vote from '@/lib/models/Vote';

export async function GET() {
  try {
    await dbConnect();

    const uniqueVoters = await Vote.aggregate([
      { 
        $group: { 
          _id: "$phone", 
          name: { $first: "$name" } 
        } 
      }
    ]);

    const formattedVoters = uniqueVoters.map(v => ({
      phone: v._id,
      name: v.name
    }));

    return NextResponse.json({ success: true, data: formattedVoters });
  } catch (error) {
    return NextResponse.json({ success: false, message: '讀取抽獎名單失敗' }, { status: 500 });
  }
}