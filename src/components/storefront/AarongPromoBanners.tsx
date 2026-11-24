/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  MoreVertical,
  Edit,
  Trash2,
  Link as LinkIcon,
  Plus,
  RotateCcw,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import { useSettings } from '@/components/SettingsProvider';
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

export interface PromoBannerItem {
  image: string;
  link: string;
  alt: string;
  isActive: boolean;
}

export interface PromoBannersData {
  left: PromoBannerItem;
  right: PromoBannerItem;
}

const DEFAULT_PROMO_BANNERS: PromoBannersData = {
  left: {
    image: '/assets/images/ArongSections/D-Left-Living-Box-Banner1_24-02-2026-SM.webp',
    link: '/shop?category=home-decor',
    alt: 'Bronze ballad',
    isActive: true,
  },
  right: {
    image: '/assets/images/ArongSections/D-Right-Dining-box-banner1-22-07-2025-SM.webp',
    link: '/shop?category=home-decor',
    alt: 'Tales in taupe',
    isActive: true,
  },
};

function normalizeBanners(raw?: any): PromoBannersData {
  return {
    left: {
      image: raw?.left?.image !== undefined ? raw.left.image : DEFAULT_PROMO_BANNERS.left.image,
      link: raw?.left?.link !== undefined ? raw.left.link : DEFAULT_PROMO_BANNERS.left.link,
      alt: raw?.left?.alt !== undefined ? raw.left.alt : DEFAULT_PROMO_BANNERS.left.alt,
      isActive: raw?.left?.isActive !== undefined ? Boolean(raw.left.isActive) : true,
    },
    right: {
      image: raw?.right?.image !== undefined ? raw.right.image : DEFAULT_PROMO_BANNERS.right.image,
      link: raw?.right?.link !== undefined ? raw.right.link : DEFAULT_PROMO_BANNERS.right.link,
      alt: raw?.right?.alt !== undefined ? raw.right.alt : DEFAULT_PROMO_BANNERS.right.alt,
      isActive: raw?.right?.isActive !== undefined ? Boolean(raw.right.isActive) : true,
    },
  };
}

export function AarongPromoBanners({ settings: propSettings }: { settings?: any }) {
  const contextSettings = useSettings();
  const effectiveSettings = propSettings || contextSettings;
  const router = useRouter();
  const { data: session } = useSession();

  const isAdmin = Boolean(
    session?.user && ['admin', 'super_admin', 'manager'].includes((session.user as any)?.role)
  );

  const [banners, setBanners] = useState<PromoBannersData>(() =>
    normalizeBanners(effectiveSettings?.promoBanners)
  );

  // Sync when server-rendered cached prop updates
  useEffect(() => {
    if (effectiveSettings?.promoBanners) {
      setBanners(normalizeBanners(effectiveSettings.promoBanners));
    }
  }, [effectiveSettings?.promoBanners]);

  // Edit Dialog State
  const [editingSlot, setEditingSlot] = useState<'left' | 'right' | null>(null);
  const [focusLinkOnly, setFocusLinkOnly] = useState(false);
  const [formImage, setFormImage] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formAlt, setFormAlt] = useState('');
  const [saving, setSaving] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const openEditModal = (slot: 'left' | 'right', focusLink = false) => {
    const current = banners[slot];
    setEditingSlot(slot);
    setFocusLinkOnly(focusLink);
    setFormImage(current.image || '');
    setFormLink(current.link || '/shop');
    setFormAlt(current.alt || (slot === 'left' ? 'Left Promo Banner' : 'Right Promo Banner'));
    if (focusLink) {
      setTimeout(() => {
        linkInputRef.current?.focus();
        linkInputRef.current?.select();
      }, 120);
    }
  };

  const persistBanners = async (nextBanners: PromoBannersData, successMessage: string) => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoBanners: nextBanners }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update promotional banner');
      }

      setBanners(nextBanners);
      toast.success(successMessage);
      router.refresh();
      return true;
    } catch (error: any) {
      console.error('Failed to update promoBanners:', error);
      toast.error(error?.message || 'Could not update banner');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    if (!formImage.trim()) {
      toast.error('Please upload a banner image first');
      return;
    }

    const updatedSlot: PromoBannerItem = {
      image: formImage.trim(),
      link: formLink.trim() || '/shop',
      alt: formAlt.trim() || (editingSlot === 'left' ? 'Promo Banner 1' : 'Promo Banner 2'),
      isActive: true,
    };

    const nextBanners: PromoBannersData = {
      ...banners,
      [editingSlot]: updatedSlot,
    };

    const ok = await persistBanners(
      nextBanners,
      'Promo banner updated & Cloudflare cache purged!'
    );
    if (ok) {
      setEditingSlot(null);
    }
  };

  const handleDeleteSlot = async (slot: 'left' | 'right') => {
    const result = await Swal.fire({
      title: 'Delete Promo Banner?',
      text: 'This banner will be hidden from the storefront until you upload a new one or restore it.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
    });

    if (!result.isConfirmed) return;

    const nextBanners: PromoBannersData = {
      ...banners,
      [slot]: {
        ...banners[slot],
        image: '',
        isActive: false,
      },
    };

    await persistBanners(nextBanners, 'Promo banner deleted & cache purged!');
  };

  const handleResetSlot = async (slot: 'left' | 'right') => {
    const nextBanners: PromoBannersData = {
      ...banners,
      [slot]: { ...DEFAULT_PROMO_BANNERS[slot] },
    };
    await persistBanners(nextBanners, 'Default promo banner restored!');
  };

  const leftActive = Boolean(banners.left.isActive && banners.left.image);
  const rightActive = Boolean(banners.right.isActive && banners.right.image);

  // If neither banner is active and user is not admin, hide the section completely
  if (!isAdmin && !leftActive && !rightActive) {
    return null;
  }

  const slots: Array<{ key: 'left' | 'right'; label: string; item: PromoBannerItem; active: boolean }> = [
    { key: 'left', label: 'Left Promo Banner', item: banners.left, active: leftActive },
    { key: 'right', label: 'Right Promo Banner', item: banners.right, active: rightActive },
  ];

  const visibleSlots = isAdmin ? slots : slots.filter((s) => s.active);

  return (
    <section className="w-full bg-background py-1">
      <div className="w-full px-4 lg:px-6">
        <div
          className={`grid grid-cols-1 ${
            visibleSlots.length > 1 ? 'md:grid-cols-2' : 'md:grid-cols-1'
          } gap-2 lg:gap-3`}
        >
          {visibleSlots.map(({ key, label, item, active }) => (
            <div
              key={key}
              className="group relative block aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/3] lg:aspect-[16/11] xl:aspect-[16/10] overflow-hidden bg-muted"
            >
              {/* Top-Left 3-Dot Admin Action Button */}
              {isAdmin && (
                <div className="absolute top-3 left-3 z-30">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 bg-transparent border-0 shadow-none text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] hover:opacity-80 transition-opacity outline-none cursor-pointer"
                        aria-label={`Manage ${label}`}
                      >
                        {saving ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <MoreVertical className="h-5 w-5 stroke-[2.25]" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52 rounded-xl z-50">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(key, false);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        {active ? 'Update Image & Banner' : 'Add Banner Image'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(key, true);
                        }}
                      >
                        <LinkIcon className="mr-2 h-4 w-4" />
                        {item.link ? 'Edit Direct Link' : 'Add Direct Link'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetSlot(key);
                        }}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset to Default
                      </DropdownMenuItem>
                      {active && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlot(key);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Banner
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {active ? (
                <Link
                  href={item.link || '/shop'}
                  className="relative block w-full h-full"
                >
                  <Image
                    src={item.image}
                    alt={item.alt || label}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
                    priority
                  />
                </Link>
              ) : (
                /* Admin Placeholder when banner is deleted */
                <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-border bg-muted/40 p-6 text-center gap-3">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/60" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">{label} (Hidden)</p>
                    <p className="text-xs text-muted-foreground">
                      This banner slot is currently deleted and invisible to visitors.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(key, false)}
                    className="gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    Add Banner Image & Link
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Admin Edit / Add Modal */}
      <Dialog open={editingSlot !== null} onOpenChange={(open) => !open && setEditingSlot(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSlot === 'left' ? 'Update Left Promo Banner' : 'Update Right Promo Banner'}
            </DialogTitle>
            <DialogDescription>
              Upload a new banner image and configure the clickable direct link. Saving will immediately revalidate Next.js cache and purge Cloudflare cache.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveModal} className="space-y-4">
            <div className="space-y-2">
              <Label>Banner Image</Label>
              <ImageUpload
                value={formImage}
                onUpload={(url) => setFormImage(url)}
                folder="banners"
                className="aspect-[16/10] w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo-banner-link">Clickable Direct Link (URL or Path)</Label>
              <Input
                id="promo-banner-link"
                ref={linkInputRef}
                value={formLink}
                onChange={(e) => setFormLink(e.target.value)}
                placeholder="/shop?category=home-decor or https://..."
                autoFocus={focusLinkOnly}
              />
              <p className="text-[11px] text-muted-foreground">
                Example: <code>/shop?category=home-decor</code>, <code>/product/item-slug</code>, or any full URL.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo-banner-alt">Banner Title / Alt Text</Label>
              <Input
                id="promo-banner-alt"
                value={formAlt}
                onChange={(e) => setFormAlt(e.target.value)}
                placeholder="e.g. Bronze ballad"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingSlot(null)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Purge Cache
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
