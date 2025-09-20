import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

export async function GET() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(data);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error reading settings:', error);
    // Return default settings if file doesn't exist or is corrupted
    const defaultSettings = {
      operationTypes: [
        { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'بيع منتج' },
        { id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', name: 'تجديد باقة' }
      ]
    };
    return NextResponse.json(defaultSettings);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json();
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
