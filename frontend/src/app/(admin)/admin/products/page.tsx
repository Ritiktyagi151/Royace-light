'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Image as ImageIcon, X, Loader2, Search, GripVertical, Star, ExternalLink, Crop } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import Pagination from '@/components/Pagination';
import { getAssetUrl } from '@/lib/urls';

const EMPTY_FORM = {
  name: '', description: '', costPrice: '', sellingPrice: '', retailPrice: '',
  category: '', totalQuantity: '', colors: '', tags: '', material: '',
  size: '',
  dimension: { height: '', width: '', depth: '', raw: '' },
  weight: '', isActive: true,
  sku: '', slug: '', series: '', finish: '', lightSource: '', remark: '',
  watt: '', inputVoltage: '', lmPerW: '', fluxLumin: '', ra: '',
  chipBrand: '', pf: '', cutSize: '', beamAngle: '', ipRate: '',
};

const LIGHTING_SPEC_FIELDS = [
  { key: 'watt', label: 'Watt', placeholder: '12', type: 'number' },
  { key: 'inputVoltage', label: 'Input Voltage', placeholder: '220-240V', type: 'text' },
  { key: 'lmPerW', label: 'LM/W', placeholder: '100', type: 'number' },
  { key: 'fluxLumin', label: 'Flux Lumin', placeholder: '1200', type: 'number' },
  { key: 'ra', label: 'RA', placeholder: '80', type: 'number' },
  { key: 'chipBrand', label: 'Chip Brand', placeholder: 'CREE', type: 'text' },
  { key: 'pf', label: 'PF', placeholder: '0.95', type: 'number', step: '0.01' },
  { key: 'cutSize', label: 'Cut Size', placeholder: '75mm', type: 'text' },
  { key: 'beamAngle', label: 'Beam Angle', placeholder: '36', type: 'number' },
  { key: 'ipRate', label: 'IP Rate', placeholder: 'IP65', type: 'text' },
];

const CROP_ASPECTS = [
  { label: 'Square', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 },
];

type ImageItem = {
  id: string;
  src: string;
  file?: File;
  existing: boolean;
};

type CropState = {
  item?: ImageItem;
  file?: File;
  fileName: string;
  src: string;
  revokeSrc: boolean;
  naturalWidth: number;
  naturalHeight: number;
  aspect: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
  isSaving: boolean;
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const cropDragRef = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState('');
  const [enableCompression, setEnableCompression] = useState(true);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [cropState, setCropState] = useState<CropState | null>(null);
  const [pendingCropFiles, setPendingCropFiles] = useState<File[]>([]);

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  useEffect(() => {
    if (imageItems.length && !imageItems.some((item) => item.id === primaryImageId)) {
      setPrimaryImageId(imageItems[0].id);
    }
    if (!imageItems.length && primaryImageId) {
      setPrimaryImageId('');
    }
  }, [imageItems, primaryImageId]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, category, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      const res = await adminApi.get(`/products/admin/all?${params.toString()}`);
      return res.data.data;
    },
  });

  // categories for select
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await adminApi.get('/categories/admin/all');
      return res.data.data;
    },
  });

  const saveProduct = useMutation({
    mutationFn: async (fd: FormData) => {
      if (editingProduct) {
        return adminApi.put(`/products/${editingProduct._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return adminApi.post('/products', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      closeModal();
    },
    onError: (error: any) => {
      setFormError(error?.response?.data?.message || 'Unable to save product. Please check the fields and try again.');
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM });
    setImageItems([]);
    setPrimaryImageId('');
    setEnableCompression(true);
    setFormError('');
    setModalOpen(true);
  };

  const getProductImages = (product: any) => {
    if (Array.isArray(product.imageAssets) && product.imageAssets.length) {
      return [...product.imageAssets]
        .sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0))
        .map((asset: any) => asset.webpUrl || asset.url)
        .filter(Boolean);
    }
    const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    const primary = product.primaryImage || product.image;
    return images.length ? [...new Set([primary, ...images].filter(Boolean))] : primary ? [primary] : [];
  };

  const getImageSrc = (image?: string) => {
    return getAssetUrl(image);
  };

  const getProductWebsiteUrl = (product: any) => {
    const publicId = product?.slug || product?._id;
    if (!publicId) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/product/${publicId}`;
  };

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const openNextPendingCrop = (files: File[]) => {
    const [nextFile, ...rest] = files;
    setPendingCropFiles(rest);
    if (nextFile) {
      openCrop({ file: nextFile });
    }
  };

  const openCrop = async ({ item, file }: { item?: ImageItem; file?: File }) => {
    setFormError('');
    try {
      let cropSrc = '';
      let revokeSrc = false;
      let fileName = 'product-image';

      if (file) {
        cropSrc = URL.createObjectURL(file);
        revokeSrc = true;
        fileName = file.name;
      } else if (item) {
        const displaySrc = getImageSrc(item.src);
        const isBlob = displaySrc.startsWith('blob:');
        cropSrc = displaySrc;
        fileName = item.file?.name || item.src.split('/').pop() || 'product-image';

        if (!isBlob) {
          const response = await fetch(displaySrc);
          if (!response.ok) throw new Error('Unable to load image');
          cropSrc = URL.createObjectURL(await response.blob());
          revokeSrc = true;
        }
      }

      const image = await loadImage(cropSrc);
      setCropState({
        item,
        file,
        fileName,
        src: cropSrc,
        revokeSrc,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        aspect: 1,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        isSaving: false,
      });
    } catch {
      setFormError('Unable to open this image for cropping. Try uploading it again.');
    }
  };

  const closeCrop = (discardPending = false) => {
    if (discardPending) setPendingCropFiles([]);
    cropDragRef.current = null;
    setCropState((current) => {
      if (current?.revokeSrc) URL.revokeObjectURL(current.src);
      return null;
    });
  };

  const getCropBox = (state: CropState) => {
    const imageAspect = state.naturalWidth / state.naturalHeight;
    let cropWidth = state.naturalWidth;
    let cropHeight = state.naturalHeight;

    if (imageAspect > state.aspect) {
      cropHeight = state.naturalHeight;
      cropWidth = cropHeight * state.aspect;
    } else {
      cropWidth = state.naturalWidth;
      cropHeight = cropWidth / state.aspect;
    }

    cropWidth /= state.zoom;
    cropHeight /= state.zoom;

    const maxX = Math.max(0, (state.naturalWidth - cropWidth) / 2);
    const maxY = Math.max(0, (state.naturalHeight - cropHeight) / 2);
    const x = (state.naturalWidth - cropWidth) / 2 - (state.offsetX / 100) * maxX;
    const y = (state.naturalHeight - cropHeight) / 2 - (state.offsetY / 100) * maxY;

    return { x, y, width: cropWidth, height: cropHeight };
  };

  const clampCropOffset = (value: number) => Math.max(-100, Math.min(100, value));

  const startCropDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cropState) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    cropDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: cropState.offsetX,
      offsetY: cropState.offsetY,
    };
  };

  const moveCropDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = cropDragRef.current;
    if (!drag) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nextOffsetX = drag.offsetX - ((e.clientX - drag.startX) / rect.width) * 200;
    const nextOffsetY = drag.offsetY - ((e.clientY - drag.startY) / rect.height) * 200;
    setCropState((current) => current ? {
      ...current,
      offsetX: clampCropOffset(nextOffsetX),
      offsetY: clampCropOffset(nextOffsetY),
    } : current);
  };

  const endCropDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    cropDragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const getCropOverlayStyle = (state: CropState) => {
    const cropBox = getCropBox(state);
    return {
      left: `${(cropBox.x / state.naturalWidth) * 100}%`,
      top: `${(cropBox.y / state.naturalHeight) * 100}%`,
      width: `${(cropBox.width / state.naturalWidth) * 100}%`,
      height: `${(cropBox.height / state.naturalHeight) * 100}%`,
    };
  };

  const applyCrop = async () => {
    if (!cropState) return;
    setCropState({ ...cropState, isSaving: true });

    try {
      const image = await loadImage(cropState.src);
      const cropBox = getCropBox(cropState);
      const maxOutputSize = 1600;
      const outputWidth = cropState.aspect >= 1
        ? Math.min(maxOutputSize, Math.round(cropBox.width))
        : Math.min(maxOutputSize, Math.round(cropBox.height * cropState.aspect));
      const outputHeight = Math.round(outputWidth / cropState.aspect);
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Unable to crop image');

      context.drawImage(
        image,
        cropBox.x,
        cropBox.y,
        cropBox.width,
        cropBox.height,
        0,
        0,
        outputWidth,
        outputHeight,
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((nextBlob) => {
          if (nextBlob) resolve(nextBlob);
          else reject(new Error('Unable to create cropped image'));
        }, 'image/webp', 0.92);
      });

      const fileName = cropState.fileName.replace(/\.[^.]+$/, '') + '-cropped.webp';
      const file = new File([blob], fileName, { type: 'image/webp' });
      const nextSrc = URL.createObjectURL(blob);
      const targetId = cropState.item?.id;

      if (targetId) {
        setImageItems((items) => items.map((item) => {
          if (item.id !== targetId) return item;
          if (!item.existing && item.src.startsWith('blob:')) URL.revokeObjectURL(item.src);
          return { ...item, src: nextSrc, file, existing: false };
        }));
      } else {
        const nextItem = {
          id: `cropped:${Date.now()}:${fileName}`,
          src: nextSrc,
          file,
          existing: false,
        };
        setImageItems((items) => [...items, nextItem].slice(0, 8));
        if (!primaryImageId) setPrimaryImageId(nextItem.id);
      }
      closeCrop();
      openNextPendingCrop(pendingCropFiles);
    } catch {
      setCropState((current) => current ? { ...current, isSaving: false } : current);
      setFormError('Unable to apply the crop. Please try a different image.');
    }
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product.name, description: product.description,
      costPrice: product.costPrice, sellingPrice: product.sellingPrice,
      retailPrice: product.retailPrice, category: product.category?._id || product.category || '',
      totalQuantity: product.totalQuantity,
      colors: product.colors?.join(', ') || '',
      tags: product.tags?.join(', ') || '',
      material: product.material?.join(', ') || product.materialUsed?.join(', ') || '',
      size: product.size || product.dimension?.raw || '',
      dimension: {
        height: product.dimension?.height || '',
        width: product.dimension?.width || '',
        depth: product.dimension?.depth || '',
        raw: product.dimension?.raw || product.size || '',
      },
      weight: product.weight || '', isActive: product.isActive,
      sku: product.sku || product.productId || '',
      slug: product.slug || '',
      series: product.series || '',
      finish: product.finish || product.Fineshed || '',
      lightSource: product.lightSource || product.LightSource || '',
      remark: product.remark || product.Remark || '',
      watt: product.watt ?? '',
      inputVoltage: product.inputVoltage || '',
      lmPerW: product.lmPerW ?? '',
      fluxLumin: product.fluxLumin ?? '',
      ra: product.ra ?? '',
      chipBrand: product.chipBrand || '',
      pf: product.pf ?? '',
      cutSize: product.cutSize || '',
      beamAngle: product.beamAngle ?? '',
      ipRate: product.ipRate || '',
    });
    const nextImages = getProductImages(product).map((src: string) => ({
      id: src,
      src,
      existing: true,
    }));
    setImageItems(nextImages);
    setPrimaryImageId(
      nextImages.find((item) => item.src === (product.primaryImage || product.image))?.id ||
      nextImages[0]?.id ||
      '',
    );
    setEnableCompression(true);
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    imageItems.forEach((item) => {
      if (!item.existing && item.src.startsWith('blob:')) URL.revokeObjectURL(item.src);
    });
    closeCrop(true);
    setModalOpen(false);
    setEditingProduct(null);
    setFormError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    openNextPendingCrop(files.slice(0, Math.max(0, 8 - imageItems.length)));
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    setImageItems((items) => {
      const removed = items.find((item) => item.id === id);
      if (removed && !removed.existing && removed.src.startsWith('blob:')) URL.revokeObjectURL(removed.src);
      const next = items.filter((item) => item.id !== id);
      if (primaryImageId === id) setPrimaryImageId(next[0]?.id || '');
      return next;
    });
  };

  const moveImage = (fromId: string, toId: string) => {
    setImageItems((items) => {
      const fromIndex = items.findIndex((item) => item.id === fromId);
      const toIndex = items.findIndex((item) => item.id === toId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items;
      const next = [...items];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.category) {
      setFormError('Please select a category.');
      return;
    }
    if (!form.sku.trim()) {
      setFormError('Please enter a SKU.');
      return;
    }
    if (!editingProduct && imageItems.length === 0) {
      setFormError('Please add at least one product image.');
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'colors' || k === 'tags' || k === 'material') {
        fd.append(k, JSON.stringify(String(v).split(',').map((s) => s.trim()).filter(Boolean)));
      } else if (k === 'dimension') {
        const dimension = v as typeof EMPTY_FORM.dimension;
        fd.append('dimension', JSON.stringify({
          ...dimension,
          raw: dimension.raw || form.size,
        }));
      } else {
        fd.append(k, String(v));
      }
    });
    const newItems = imageItems.filter((item) => !item.existing && item.file);
    const imageOrder = imageItems.map((item) => (
      item.existing ? item.src : `new:${newItems.findIndex((newItem) => newItem.id === item.id)}`
    ));
    const primaryItem = imageItems.find((item) => item.id === primaryImageId) || imageItems[0];
    const primaryImage = primaryItem
      ? primaryItem.existing
        ? primaryItem.src
        : `new:${newItems.findIndex((newItem) => newItem.id === primaryItem.id)}`
      : '';

    fd.append('enableCompression', String(enableCompression));
    fd.append('existingImages', JSON.stringify(imageItems.filter((item) => item.existing).map((item) => item.src)));
    fd.append('imageOrder', JSON.stringify(imageOrder));
    fd.append('primaryImage', primaryImage);
    newItems.forEach((item) => item.file && fd.append('images', item.file));
    saveProduct.mutate(fd);
  };

  const editingProductUrl = editingProduct ? getProductWebsiteUrl(editingProduct) : '';

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-500 text-sm">{data?.total || 0} products</p>
        </div>
        <button onClick={openAdd} className="btn-admin flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
          <option value="">All Categories</option>
          {categoriesData?.map((c: any) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products table */}
      <div className="admin-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Product', 'Category', 'Price', 'Stock', 'Status', 'Vendor', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-3 bg-gray-100 rounded animate-pulse w-20" /></td>
                    ))}
                  </tr>
                ))
              : data?.products?.map((p: any) => {
                  const productImages = getProductImages(p);
                  const imgSrc = getImageSrc(productImages[0]);
                  return (
                    <tr key={p._id} className="table-row">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {productImages.length
                              ? <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={16} /></div>
                            }
                          </div>
                          <div className="min-w-0">
                            <span className="block text-sm font-medium text-gray-900 max-w-[160px] truncate">{p.name}</span>
                            {p.sku && (
                              <span className="block text-xs text-gray-400 max-w-[160px] truncate">{p.sku}</span>
                            )}
                            {productImages.length > 1 && (
                              <span className="text-xs text-gray-400">{productImages.length} images</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 capitalize">{p.category?.name || p.category}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">₹{p.sellingPrice}</p>
                        {p.retailPrice > p.sellingPrice && (
                          <p className="text-xs text-gray-400 line-through">₹{p.retailPrice}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-medium ${p.totalQuantity <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                          {p.totalQuantity}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {p.vendorId ? p.vendorId.shopName || p.vendorId.name : 'Admin'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => { if (confirm('Delete this product?')) deleteProduct.mutate(p._id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
        {!isLoading && !data?.products?.length && (
          <p className="text-center text-gray-400 py-16">No products found</p>
        )}
        {!isLoading && data?.total > 0 && (
          <Pagination
            page={data.page || page}
            pages={data.pages || 1}
            total={data.total}
            pageSize={limit}
            itemLabel="products"
            onPageChange={setPage}
            onPageSizeChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {editingProductUrl && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Live product page</p>
                      <a
                        href={editingProductUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block truncate text-sm font-medium text-gray-900 hover:underline"
                      >
                        {editingProductUrl}
                      </a>
                    </div>
                    <a
                      href={editingProductUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                    >
                      <ExternalLink size={15} />
                      Open
                    </a>
                  </div>
                </div>
              )}

              {/* Image upload */}
              <div>
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="block text-sm font-medium text-gray-700">Product Images</label>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-600">
                    <input
                      type="checkbox"
                      checked={enableCompression}
                      onChange={(e) => setEnableCompression(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    Enable Automatic Compression
                  </label>
                </div>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  {imageItems.length ? (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {imageItems.map((item, index) => (
                        <div
                          key={item.id}
                          draggable
                          onClick={(e) => e.stopPropagation()}
                          onDragStart={() => setDraggedImageId(item.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedImageId) moveImage(draggedImageId, item.id);
                            setDraggedImageId(null);
                          }}
                          className={`group relative aspect-square rounded-lg bg-gray-100 overflow-hidden border ${primaryImageId === item.id ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-gray-200'}`}
                        >
                          <img src={getImageSrc(item.src)} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => openCrop({ item })}
                            className="absolute inset-0 m-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-gray-700 opacity-0 shadow-sm transition-opacity hover:text-gray-900 group-hover:opacity-100"
                            title="Crop image"
                          >
                            <Crop size={15} />
                          </button>
                          <button
                            type="button"
                            className="absolute left-1 top-1 rounded-md bg-white/90 p-1 text-gray-500 shadow-sm cursor-grab"
                            title="Drag to reorder"
                          >
                            <GripVertical size={13} />
                          </button>
                          {primaryImageId === item.id && (
                            <span className="absolute left-1.5 bottom-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                              Primary
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setPrimaryImageId(item.id)}
                            className={`absolute right-1 top-1 rounded-md p-1 shadow-sm ${primaryImageId === item.id ? 'bg-amber-400 text-white' : 'bg-white/90 text-gray-500 hover:text-amber-500'}`}
                            title="Set as primary image"
                          >
                            <Star size={13} fill={primaryImageId === item.id ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(item.id)}
                            className="absolute right-1 bottom-1 rounded-md bg-white/90 p-1 text-gray-500 opacity-0 shadow-sm transition-opacity hover:text-red-600 group-hover:opacity-100"
                            title="Remove image"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <ImageIcon size={32} className="mx-auto mb-2" />
                      <p className="text-sm">Click to upload images</p>
                      <p className="text-xs mt-1">PNG, JPG, WEBP up to 10MB each</p>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-500">
                  <span>Drag images to reorder. Use the star to choose the featured image.</span>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    Add images
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </div>

              {formError && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="e.g. Handcrafted Pearl Earrings" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                    placeholder="Describe the product..." />
                </div>

                {[
                  { key: 'costPrice', label: 'Cost Price (₹) *' },
                  { key: 'sellingPrice', label: 'Selling Price (₹) *' },
                  { key: 'retailPrice', label: 'Retail Price (₹) *' },
                  { key: 'totalQuantity', label: 'Stock Quantity *' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <input required type="number" min="0" value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                    <option value="">Select category</option>
                    {categoriesData?.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Raw Size</label>
                  <input
                    value={form.size}
                    onChange={(e) => setForm({
                      ...form,
                      size: e.target.value,
                      dimension: { ...form.dimension, raw: e.target.value },
                    })}
                    placeholder="e.g. 1200*180*H290"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div className="col-span-2 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Height</label>
                    <input value={form.dimension.height} onChange={(e) => setForm({ ...form, dimension: { ...form.dimension, height: e.target.value } })}
                      placeholder="e.g. 290mm"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Width</label>
                    <input value={form.dimension.width} onChange={(e) => setForm({ ...form, dimension: { ...form.dimension, width: e.target.value } })}
                      placeholder="e.g. 1200mm"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Depth</label>
                    <input value={form.dimension.depth} onChange={(e) => setForm({ ...form, dimension: { ...form.dimension, depth: e.target.value } })}
                      placeholder="e.g. 180mm"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                </div>

                {[
                  { key: 'colors', label: 'Colors (comma-separated)', placeholder: '#ff0000, #00ff00, blue' },
                  { key: 'tags', label: 'Tags (comma-separated)', placeholder: 'handmade, pearl, gift' },
                  { key: 'material', label: 'Materials (comma-separated)', placeholder: 'stainless steel, acrylic, crystal' },
                  { key: 'weight', label: 'Weight (g)', placeholder: '500' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className={key === 'colors' || key === 'tags' || key === 'material' ? 'col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <input type={key === 'weight' ? 'number' : 'text'} min={key === 'weight' ? '0' : undefined} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder={placeholder} />
                  </div>
                ))}

                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU *</label>
                    <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      placeholder="e.g. RL188093-600D"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                    <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="Auto-generated from SKU"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Series</label>
                    <input value={form.series} onChange={(e) => setForm({ ...form, series: e.target.value })}
                      placeholder="e.g. RL188093"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Finish</label>
                    <input value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })}
                      placeholder="e.g. CHROME+PINK"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Light Source</label>
                    <input value={form.lightSource} onChange={(e) => setForm({ ...form, lightSource: e.target.value })}
                      placeholder="e.g. LED 3IN1 3K/4K/6K"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Remark</label>
                    <input value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })}
                      placeholder="Any remarks"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                </div>

                <div className="col-span-2">
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Lighting Specifications</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {LIGHTING_SPEC_FIELDS.map(({ key, label, placeholder, type, step }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                        <input
                          type={type}
                          min={type === 'number' ? '0' : undefined}
                          step={step}
                          value={(form as any)[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          placeholder={placeholder}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 border border-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saveProduct.isPending}
                  className="flex-1 btn-admin flex items-center justify-center gap-2">
                  {saveProduct.isPending && <Loader2 size={15} className="animate-spin" />}
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cropState && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => closeCrop(true)} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="font-semibold text-gray-900">Crop Product Image</h3>
              <button
                type="button"
                onClick={() => closeCrop(true)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div
                className="relative mx-auto w-full max-w-lg touch-none select-none overflow-hidden rounded-xl bg-gray-100"
                style={{ aspectRatio: cropState.naturalWidth / cropState.naturalHeight }}
                onPointerDown={startCropDrag}
                onPointerMove={moveCropDrag}
                onPointerUp={endCropDrag}
                onPointerCancel={endCropDrag}
              >
                <img
                  src={cropState.src}
                  alt="Crop preview"
                  draggable={false}
                  className="h-full w-full object-contain"
                />
                <div className="absolute inset-0 bg-black/35" />
                <div
                  className="absolute cursor-grab border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] active:cursor-grabbing"
                  style={getCropOverlayStyle(cropState)}
                >
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }).map((_, index) => (
                      <span key={index} className="border border-white/30" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Aspect Ratio</label>
                  <select
                    value={cropState.aspect}
                    onChange={(e) => setCropState({ ...cropState, aspect: Number(e.target.value), offsetX: 0, offsetY: 0 })}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    {CROP_ASPECTS.map((aspect) => (
                      <option key={aspect.label} value={aspect.value}>{aspect.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Zoom</label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={cropState.zoom}
                    onChange={(e) => setCropState({ ...cropState, zoom: Number(e.target.value) })}
                    className="w-full accent-gray-900"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => closeCrop(true)}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCrop}
                  disabled={cropState.isSaving}
                  className="btn-admin flex flex-1 items-center justify-center gap-2"
                >
                  {cropState.isSaving && <Loader2 size={15} className="animate-spin" />}
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
