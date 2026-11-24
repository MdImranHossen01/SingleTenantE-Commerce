/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  MoreVertical,
  Plus,
  Edit,
  Trash2,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import { HeroSelector } from '@/components/templates/Registry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface HeroBannerItem {
  _id?: string;
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
  primaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  order?: number;
  isActive?: boolean;
}

export function HeroSlider({
  style = 'v1',
  banners,
  layout,
}: {
  style?: string;
  banners: any[];
  layout?: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const isAdmin = Boolean(
    session?.user && ['admin', 'super_admin', 'manager'].includes((session.user as any)?.role)
  );

  const [localBanners, setLocalBanners] = useState<HeroBannerItem[]>(() => banners || []);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  useEffect(() => {
    setLocalBanners(banners || []);
  }, [banners]);

  const activeStyle = (style || 'v1').toLowerCase();
  const isAarong = activeStyle === 'aarong';
  const isV3 = activeStyle === 'v3';
  const isV4 = activeStyle === 'v4';
  const isV5 = activeStyle === 'v5';
  const isSingleBannerVersion = isV3 || isV5;
  const hasSubtitle = isV3 || isV5;
  const hasSecondaryBtn = !isAarong && !isV5;

  const safeIndex = isSingleBannerVersion
    ? 0
    : localBanners.length > 0
    ? Math.min(Math.max(0, activeSlideIndex), localBanners.length - 1)
    : 0;
  const currentBanner = localBanners[safeIndex] || null;
  const [pinnedBanner, setPinnedBanner] = useState<HeroBannerItem | null>(null);
  const targetBanner = pinnedBanner || currentBanner;

  // Dialog & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [focusLinkField, setFocusLinkField] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formImage, setFormImage] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formPrimaryBtnText, setFormPrimaryBtnText] = useState('Shop Now');
  const [formPrimaryBtnLink, setFormPrimaryBtnLink] = useState('/shop');
  const [formSecondaryBtnText, setFormSecondaryBtnText] = useState('');
  const [formSecondaryBtnLink, setFormSecondaryBtnLink] = useState('');
  const [formOrder, setFormOrder] = useState<number>(1);

  const primaryLinkRef = useRef<HTMLInputElement>(null);

  const populateFormForCreate = (focusLink = false) => {
    setEditingBannerId(null);
    setFocusLinkField(focusLink);
    setFormImage('');
    setFormTitle('');
    setFormSubtitle('');
    setFormPrimaryBtnText(isV3 ? 'Explore Selection' : isV5 ? 'Enter Atelier' : 'Shop Now');
    setFormPrimaryBtnLink('/shop');
    setFormSecondaryBtnText(isV3 ? 'Categories' : '');
    setFormSecondaryBtnLink(isV3 ? '/categories' : '');
    setFormOrder((localBanners?.length || 0) + 1);
    setIsModalOpen(true);

    if (focusLink) {
      setTimeout(() => {
        primaryLinkRef.current?.focus();
        primaryLinkRef.current?.select();
      }, 120);
    }
  };

  const populateFormForEdit = (banner: HeroBannerItem, focusLink = false) => {
    setEditingBannerId(banner._id || null);
    setFocusLinkField(focusLink);
    setFormImage(banner.image || '');
    setFormTitle(banner.title || '');
    setFormSubtitle(banner.subtitle || '');
    setFormPrimaryBtnText(
      banner.primaryBtnText || (isV3 ? 'Explore Selection' : isV5 ? 'Enter Atelier' : 'Shop Now')
    );
    setFormPrimaryBtnLink(banner.primaryBtnLink || banner.link || '/shop');
    setFormSecondaryBtnText(banner.secondaryBtnText || '');
    setFormSecondaryBtnLink(banner.secondaryBtnLink || '');
    setFormOrder(banner.order ?? 1);
    setIsModalOpen(true);

    if (focusLink) {
      setTimeout(() => {
        primaryLinkRef.current?.focus();
        primaryLinkRef.current?.select();
      }, 120);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formImage.trim()) {
      toast.error('Please upload a banner image first');
      return;
    }

    if (!isAarong && !isV4 && !formTitle.trim()) {
      toast.error('Please enter a banner title');
      return;
    }

    setSaving(true);
    try {
      const cleanPrimaryLink = formPrimaryBtnLink.trim() || '/shop';
      const payload = {
        title: formTitle.trim() || (isAarong ? 'Collection Banner' : 'Hero Banner'),
        subtitle: formSubtitle.trim(),
        image: formImage.trim(),
        link: cleanPrimaryLink,
        primaryBtnText: isAarong ? 'SHOP NOW' : formPrimaryBtnText.trim() || 'Shop Now',
        primaryBtnLink: cleanPrimaryLink,
        secondaryBtnText: hasSecondaryBtn ? formSecondaryBtnText.trim() : '',
        secondaryBtnLink: hasSecondaryBtn ? formSecondaryBtnLink.trim() : '',
        order: Number(formOrder) || 0,
        isActive: true,
      };

      const isUpdating = Boolean(editingBannerId);
      const url = isUpdating ? `/api/admin/banners/${editingBannerId}` : '/api/admin/banners';
      const method = isUpdating ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save banner');
      }

      const savedBanner = await response.json();

      setLocalBanners((prev) => {
        const next = isUpdating
          ? prev.map((b) => (b._id === editingBannerId ? savedBanner : b))
          : [...prev, savedBanner];
        return [...next].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      });

      toast.success(
        isUpdating
          ? 'Banner updated & Cloudflare cache purged!'
          : 'New banner added & Cloudflare cache purged!'
      );
      setPinnedBanner(null);
      setIsModalOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error('Error saving banner:', error);
      toast.error(error?.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (banner: HeroBannerItem) => {
    if (!banner._id) return;

    const result = await Swal.fire({
      title: 'Delete Banner?',
      text: banner.title
        ? `"${banner.title}" will be permanently removed and cache will be purged.`
        : 'This banner will be permanently removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/banners/${banner._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete banner');
      }

      setLocalBanners((prev) => prev.filter((b) => b._id !== banner._id));
      setPinnedBanner(null);
      if (editingBannerId === banner._id) {
        setIsModalOpen(false);
      }
      toast.success('Banner deleted & Cloudflare cache purged!');
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      toast.error(error?.message || 'Failed to delete banner');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative w-full group/hero-admin">
      {/* Top-Left 3-Dot Admin Action Button (No rounded background) */}
      {isAdmin && (
        <div className="absolute top-3 left-3 z-40">
          <DropdownMenu
            onOpenChange={(open) => {
              if (open) {
                setPinnedBanner(currentBanner);
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={saving}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 bg-transparent border-0 shadow-none text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] hover:opacity-80 transition-opacity outline-none cursor-pointer"
                aria-label="Manage Banner"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <MoreVertical className="h-5 w-5 stroke-[2.25]" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 rounded-xl z-50">
              {(!isSingleBannerVersion || localBanners.length === 0) && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      populateFormForCreate(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Banner
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (targetBanner) {
                    populateFormForEdit(targetBanner, false);
                  } else {
                    populateFormForCreate(false);
                  }
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Update Banner
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (targetBanner) {
                    populateFormForEdit(targetBanner, true);
                  } else {
                    populateFormForCreate(true);
                  }
                }}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                {isAarong ? 'Edit Direct Link' : 'Edit Link & Buttons'}
              </DropdownMenuItem>
              {targetBanner?._id && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBanner(targetBanner);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Banner
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Render Active Hero Template */}
      <HeroSelector
        style={style}
        banners={localBanners}
        layout={layout}
        onSlideChange={setActiveSlideIndex}
      />

      {/* Storefront Banner Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBannerId ? 'Update Banner' : 'Add New Banner'}
            </DialogTitle>
            <DialogDescription>
              {isAarong
                ? 'Upload a banner image and set its clickable direct link.'
                : 'Upload a banner image and configure the text and action buttons.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBanner} className="space-y-4">
            {/* 1. Banner Image */}
            <div className="space-y-2">
              <Label>
                Banner Image{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  ({activeStyle === 'v1' ? '21:9 / 2100×900px recommended' : 'WebP recommended'})
                </span>
              </Label>
              <ImageUpload
                value={formImage}
                onUpload={(url) => setFormImage(url)}
                folder="banners"
                className="aspect-[21/9] w-full"
              />
            </div>

            {/* 2. Title / Alt Text */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className={isSingleBannerVersion ? 'sm:col-span-4 space-y-1.5' : 'sm:col-span-3 space-y-1.5'}>
                <Label htmlFor="hero-banner-title">
                  {isAarong
                    ? 'Banner Alt Text / Name (Optional)'
                    : isV4
                    ? 'Banner Heading (Shown on Mobile)'
                    : 'Banner Heading (Title)'}
                </Label>
                <Input
                  id="hero-banner-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={
                    isAarong
                      ? 'e.g. Summer Collection'
                      : 'e.g. Fresh Healthy Food'
                  }
                />
              </div>

              {!isSingleBannerVersion && (
                <div className="sm:col-span-1 space-y-1.5">
                  <Label htmlFor="hero-banner-order">Order</Label>
                  <Input
                    id="hero-banner-order"
                    type="number"
                    min={0}
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                  />
                </div>
              )}
            </div>

            {/* 3. Subtitle (Only when needed) */}
            {hasSubtitle && (
              <div className="space-y-1.5">
                <Label htmlFor="hero-banner-subtitle">Banner Subtitle</Label>
                <Input
                  id="hero-banner-subtitle"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="e.g. CURATED SELECTIONS FOR EVERYDAY LIFE"
                />
              </div>
            )}

            {/* 4. Primary Button / Clickable Direct Link */}
            {isAarong ? (
              <div className="space-y-1.5">
                <Label htmlFor="hero-banner-direct-link">Clickable Direct Link (URL or Path)</Label>
                <Input
                  id="hero-banner-direct-link"
                  ref={primaryLinkRef}
                  value={formPrimaryBtnLink}
                  onChange={(e) => setFormPrimaryBtnLink(e.target.value)}
                  placeholder="/shop or /shop?category=organic-food or https://..."
                  autoFocus={focusLinkField}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="hero-primary-btn-text">
                    {isV4 ? 'Primary Button Text (Mobile)' : 'Primary Button Text'}
                  </Label>
                  <Input
                    id="hero-primary-btn-text"
                    value={formPrimaryBtnText}
                    onChange={(e) => setFormPrimaryBtnText(e.target.value)}
                    placeholder="e.g. Shop Now"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hero-primary-btn-link">
                    {isV4 ? 'Direct Banner & Button Link' : 'Primary Button Link'}
                  </Label>
                  <Input
                    id="hero-primary-btn-link"
                    ref={primaryLinkRef}
                    value={formPrimaryBtnLink}
                    onChange={(e) => setFormPrimaryBtnLink(e.target.value)}
                    placeholder="/shop or https://..."
                    autoFocus={focusLinkField}
                  />
                </div>
              </div>
            )}

            {/* 5. Secondary Button */}
            {hasSecondaryBtn && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/60">
                <div className="space-y-1.5">
                  <Label htmlFor="hero-secondary-btn-text">
                    Secondary Button Text (Optional)
                  </Label>
                  <Input
                    id="hero-secondary-btn-text"
                    value={formSecondaryBtnText}
                    onChange={(e) => setFormSecondaryBtnText(e.target.value)}
                    placeholder="e.g. WhatsApp Order (Leave empty to hide)"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hero-secondary-btn-link">
                    Secondary Button Link (Optional)
                  </Label>
                  <Input
                    id="hero-secondary-btn-link"
                    value={formSecondaryBtnLink}
                    onChange={(e) => setFormSecondaryBtnLink(e.target.value)}
                    placeholder="https://wa.me/... or /categories"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingBannerId ? 'Save Changes' : 'Add Banner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
