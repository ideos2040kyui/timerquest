import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function GET() {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'データ取得エラー' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { users } = await request.json();
    const { error } = await supabase.from('users').upsert(users);
    if (error) throw new Error(error.message);
    return NextResponse.json({ message: 'Data updated successfully' });
  } catch {
    return NextResponse.json({ error: 'データ保存エラー' }, { status: 500 });
  }
}
