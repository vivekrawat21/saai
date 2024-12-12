import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';


cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUNDINARY_API_KEY,
    api_secret: process.env.CLOUNDINARY_API_SECRET,
});

const prisma = new PrismaClient();

interface cludinaryUploadResult {
    public_id: string;
    bytes: number;
    duration?: number;
    [key: string]: unknown;
}

export async function POST(request: NextRequest) {


    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUNDINARY_API_KEY || !process.env.CLOUNDINARY_API_SECRET) {
            return NextResponse.json({ error: 'Cloudinary credentials configured' }, { status: 500 });
        }


        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string ;
        const originalSize = formData.get('originalSize') as string ;

        if (!file) {
            return NextResponse.json({ error: 'No file found' }, { status: 400 });
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await new Promise<cludinaryUploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "video",
                    folder: "video-uploads",
                    transformation: [
                        {quality:"auto", fetch_format:"mp4"},
                    ]
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result as cludinaryUploadResult);
                    }

                }

            )
            uploadStream.end(buffer);
        });
        const video = await prisma.video.create({
            data: {
                title: title,
                description: description,
                originalSize: originalSize,
                publicId: result.public_id,
                compressedSize: String(result.bytes),
                duration: result.duration || 0,
            }

        })
        return NextResponse.json({video }, { status: 200 });

    } catch (error) {
        console.error(`upload image failed ${error}`);
        return NextResponse.json({ error: 'Upload image failed' }, { status: 500 });
    }
    finally {
        await prisma.$disconnect();
    }
}
