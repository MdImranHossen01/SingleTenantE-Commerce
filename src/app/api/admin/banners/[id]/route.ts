import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Banner from '@/models/Banner';
import { auth } from '@/auth';
import mongoose from 'mongoose';
import { purgeCloudflareCache } from '@/lib/cloudflareCache';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !(['admin', 'super_admin', 'manager'].includes((session?.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid Banner ID' }, { status: 400 });
    }

    const body = await req.json();
    await connectToDatabase();

    const updateData = {
      title: body.title ?? '',
      subtitle: body.subtitle ?? '',
      image: body.image,
      link: body.link || body.primaryBtnLink || '/shop',
      primaryBtnText: body.primaryBtnText,
      primaryBtnLink: body.primaryBtnLink || body.link || '/shop',
      secondaryBtnText: body.secondaryBtnText,
      secondaryBtnLink: body.secondaryBtnLink,
      order: body.order ?? 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    const banner = await Banner.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true }
    );
    
    if (!banner) {
      return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
    }

    revalidateTag('banners', 'max');
    revalidatePath('/', 'layout');
    revalidatePath('/', 'page');
    await purgeCloudflareCache().catch(() => {});

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Update Banner Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !(['admin', 'super_admin', 'manager'].includes((session?.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid Banner ID' }, { status: 400 });
    }

    await connectToDatabase();
    
    const banner = await Banner.findOneAndDelete({ _id: id });

    if (!banner) {
      return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
    }

    revalidateTag('banners', 'max');
    revalidatePath('/', 'layout');
    revalidatePath('/', 'page');
    await purgeCloudflareCache().catch(() => {});

    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Delete Banner Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
