import { NextRequest, NextResponse } from 'next/server'
import { updateEmployee } from '@/lib/data-access'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const AVATARS_DIR = path.join(process.cwd(), 'data/storage/buckets/avatars')

// Ensure avatars directory exists
async function ensureAvatarsDir() {
  await fs.mkdir(AVATARS_DIR, { recursive: true })
}

// Validate image file type and size
function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 5MB.' }
  }

  return { valid: true }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate the file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    await ensureAvatarsDir()

    // Generate unique filename
    const fileExtension = path.extname(file.name) || '.jpg'
    const fileName = `${employeeId}-${uuidv4()}${fileExtension}`
    const filePath = path.join(AVATARS_DIR, fileName)

    // Save the file
    const bytes = await file.arrayBuffer()
    await fs.writeFile(filePath, Buffer.from(bytes))

    // Update employee avatar path
    const avatarPath = `/avatars/${fileName}`
    const updatedEmployee = await updateEmployee(employeeId, {
      avatar: avatarPath
    })

    if (!updatedEmployee) {
      // Clean up the uploaded file if employee update fails
      try {
        await fs.unlink(filePath)
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError)
      }
      
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Profile picture uploaded successfully',
      employee: updatedEmployee,
      avatarPath
    })

  } catch (error) {
    console.error('Error uploading profile picture:', error)
    return NextResponse.json(
      { error: 'Failed to upload profile picture' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    // Reset employee avatar to default
    const updatedEmployee = await updateEmployee(employeeId, {
      avatar: '/avatars/default-1.png'
    })

    if (!updatedEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Profile picture removed successfully',
      employee: updatedEmployee
    })

  } catch (error) {
    console.error('Error removing profile picture:', error)
    return NextResponse.json(
      { error: 'Failed to remove profile picture' },
      { status: 500 }
    )
  }
}
