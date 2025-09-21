import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const AVATARS_DIR = path.join(process.cwd(), 'data/storage/buckets/avatars')

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      )
    }

    // Security check: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      )
    }

    const filePath = path.join(AVATARS_DIR, filename)
    
    try {
      const fileBuffer = await fs.readFile(filePath)
      
      // Determine content type based on file extension
      const ext = path.extname(filename).toLowerCase()
      let contentType = 'image/jpeg' // default
      
      switch (ext) {
        case '.png':
          contentType = 'image/png'
          break
        case '.gif':
          contentType = 'image/gif'
          break
        case '.webp':
          contentType = 'image/webp'
          break
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg'
          break
      }

      // Get file stats for better ETag generation
      const stats = await fs.stat(filePath)
      const etag = `"${filename}-${stats.mtime.getTime()}"`
      
      // Check if client has cached version
      const ifNoneMatch = request.headers.get('if-none-match')
      if (ifNoneMatch === etag) {
        return new NextResponse(null, { status: 304 })
      }

      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=0, must-revalidate', // Always revalidate to ensure fresh content
          'ETag': etag,
          'Last-Modified': stats.mtime.toUTCString(),
        },
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error serving avatar:', error)
    return NextResponse.json(
      { error: 'Failed to serve avatar' },
      { status: 500 }
    )
  }
}
