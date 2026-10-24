
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';

const getSavedAddress = (user) => {
  const savedAddresses = user?.savedAddresses;

  if (Array.isArray(savedAddresses) && savedAddresses.length > 0) {
    const address = savedAddresses[0] || {};
    return {
      fullName: address.fullName || address.name || user?.name || '',
      phone: address.phone || user?.phone || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
    };
  }

  const legacy = user?.address || {};
  return {
    fullName: legacy.fullName || user?.name || '',
    phone: legacy.phone || user?.phone || '',
    street: legacy.street || '',
    city: legacy.city || '',
    state: legacy.state || '',
    zipCode: legacy.zipCode || legacy.zip || '',
  };
};

const formatAddress = (address) =>
  [address?.street, address?.city, address?.state, address?.zipCode]
    .filter(Boolean)
    .join(', ');

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const emptyProductForm = () => ({
  name: '',
  description: '',
  price: '',
  image: '',
  category: 'Art & Gifts',
  stock: '1',
  city: '',
  district: '',
  state: '',
  postalCode: '',
  latitude: '',
  longitude: '',
});

const productCategories = [
  'Art & Gifts',
  'Handmade & Lifestyle',
  'Home & Decor',
  'Jewelry & Accessories',
  'Kitchen & Dining',
  'Pottery',
  'Textiles',
  'Woodwork',
];

const Profile = () => {
  const authContext = useContext(AuthContext) || {};
  const { user, setUser, updateUserProfile, logout } = authContext;
  const navigate = useNavigate();

  const isCreator = ['creator', 'seller', 'artisan'].includes(
    String(user?.role || '').toLowerCase()
  );

  const [activeTab, setActiveTab] = useState('buyer');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [orders, setOrders] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [productSaving, setProductSaving] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm);

  const [sellerOrders, setSellerOrders] = useState([]);
  const [sellerOrdersLoading, setSellerOrdersLoading] = useState(false);
  const [sellerOrdersError, setSellerOrdersError] = useState('');
  const [sellerOrderUpdating, setSellerOrderUpdating] = useState('');
  const [sellerOrdersMessage, setSellerOrdersMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
    address: getSavedAddress(user),
  });

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
      bio: user?.bio || '',
      address: getSavedAddress(user),
    });
  }, [user]);

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      if (!user) {
        setOrders([]);
        setOrdersLoading(false);
        return;
      }

      setOrdersLoading(true);
      setOrdersError('');

      try {
        const response = await API.get('/orders/my-orders');
        const payload = response?.data;
        const orderList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.orders)
            ? payload.orders
            : Array.isArray(payload?.data)
              ? payload.data
              : [];

        if (active) setOrders(orderList);
      } catch (error) {
        if (active) {
          setOrdersError(
            error?.response?.data?.message ||
              'We could not load your order history right now.'
          );
        }
      } finally {
        if (active) setOrdersLoading(false);
      }
    };

    fetchOrders();
    return () => {
      active = false;
    };
  }, [user]);

  const fetchMyProducts = async () => {
    setProductsLoading(true);
    setProductsError('');

    try {
      const response = await API.get('/products/my-products');
      const payload = response?.data;
      const productList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.products)
          ? payload.products
          : [];

      setProducts(productList);
    } catch (error) {
      setProductsError(
        error?.response?.data?.message ||
          'We could not load your products. Please try again.'
      );
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isCreator && activeTab === 'creator') {
      fetchMyProducts();
    }
  }, [user, isCreator, activeTab]);

  const fetchSellerOrders = async () => {
    setSellerOrdersLoading(true);
    setSellerOrdersError('');

    try {
      const response = await API.get('/orders/seller-orders');
      const payload = response?.data;
      const orderList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.orders)
          ? payload.orders
          : [];

      setSellerOrders(orderList);
    } catch (error) {
      setSellerOrdersError(
        error?.response?.data?.message ||
          'We could not load your seller orders. Please try again.'
      );
    } finally {
      setSellerOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user && isCreator && activeTab === 'creator') {
      fetchSellerOrders();
    }
  }, [user, isCreator, activeTab]);

  const updateSellerOrderStatus = async (order, item, nextStatus) => {
    const orderId = order?._id;
    const productId =
      item?.productId?._id ||
      item?.productId ||
      item?.product?._id;

    if (!orderId || !productId || !nextStatus) {
      setSellerOrdersMessage({
        type: 'error',
        text: 'The order or product ID is missing. Refresh seller orders and try again.',
      });
      return;
    }

    const updateKey = `${orderId}-${productId}`;
    setSellerOrderUpdating(updateKey);
    setSellerOrdersMessage(null);

    try {
      await API.patch(
        `/orders/seller-orders/${orderId}/items/${productId}/status`,
        { status: nextStatus }
      );

      setSellerOrdersMessage({
        type: 'success',
        text: 'Order status updated successfully.',
      });

      await fetchSellerOrders();
    } catch (error) {
      setSellerOrdersMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'We could not update this order status. Please try again.',
      });
    } finally {
      setSellerOrderUpdating('');
    }
  };

  const getAllowedNextStatuses = (status) => {
    const transitions = {
      Pending: ['Processing', 'Cancelled'],
      Processing: ['Shipped'],
      Shipped: ['Delivered'],
      Delivered: [],
      Cancelled: [],
    };

    return transitions[status || 'Pending'] || [];
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm());
  };

  const handleProductFormChange = (event) => {
    const { name, value } = event.target;
    setProductForm((current) => ({ ...current, [name]: value }));
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setProductSaving(true);
    setStatusMessage(null);

    const price = Number(productForm.price);
    const stock = Number(productForm.stock);

    if (!Number.isFinite(price) || price < 0) {
      setStatusMessage({
        type: 'error',
        text: 'Enter a valid non-negative product price.',
      });
      setProductSaving(false);
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setStatusMessage({
        type: 'error',
        text: 'Stock must be a non-negative whole number.',
      });
      setProductSaving(false);
      return;
    }

    const hasLatitude = productForm.latitude.trim() !== '';
    const hasLongitude = productForm.longitude.trim() !== '';

    if (hasLatitude !== hasLongitude) {
      setStatusMessage({
        type: 'error',
        text: 'Enter both latitude and longitude, or leave both empty.',
      });
      setProductSaving(false);
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price,
      image: productForm.image.trim(),
      category: productForm.category,
      stock,
      artisanLocation: {
        city: productForm.city.trim(),
        district: productForm.district.trim(),
        state: productForm.state.trim(),
        postalCode: productForm.postalCode.trim(),
        latitude: hasLatitude ? Number(productForm.latitude) : null,
        longitude: hasLongitude ? Number(productForm.longitude) : null,
      },
    };

    try {
      if (editingProductId) {
        await API.put(
          `/products/my-products/${editingProductId}`,
          payload
        );
        setStatusMessage({
          type: 'success',
          text: 'Product updated successfully.',
        });
      } else {
        await API.post('/products', payload);
        setStatusMessage({
          type: 'success',
          text: 'Product added to your store.',
        });
      }

      resetProductForm();
      await fetchMyProducts();
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'We could not save this product. Please check the details and try again.',
      });
    } finally {
      setProductSaving(false);
    }
  };

  // FIXED: Edit fills the form and scrolls to Product Management.
  const handleEditProduct = (product) => {
    setEditingProductId(product._id);

    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      image: product.image || '',
      category: product.category || 'Art & Gifts',
      stock: String(product.stock ?? 0),
      city: product.artisanLocation?.city || '',
      district: product.artisanLocation?.district || '',
      state: product.artisanLocation?.state || '',
      postalCode: product.artisanLocation?.postalCode || '',
      latitude:
        product.artisanLocation?.latitude == null
          ? ''
          : String(product.artisanLocation.latitude),
      longitude:
        product.artisanLocation?.longitude == null
          ? ''
          : String(product.artisanLocation.longitude),
    });

    setStatusMessage(null);

    requestAnimationFrame(() => {
      document
        .getElementById('store-product-form')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    });
  };

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}" from your store? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await API.delete(`/products/my-products/${product._id}`);

      setProducts((current) =>
        current.filter((item) => item._id !== product._id)
      );

      if (editingProductId === product._id) resetProductForm();

      setStatusMessage({
        type: 'success',
        text: 'Product deleted successfully.',
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'We could not delete this product. Please try again.',
      });
    }
  };

  const defaultAddress = useMemo(() => getSavedAddress(user), [user]);

  const handleLogout = () => {
    if (typeof logout === 'function') {
      logout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    navigate('/login');
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData({
        name: user?.name || '',
        phone: user?.phone || '',
        avatar: user?.avatar || '',
        bio: user?.bio || '',
        address: getSavedAddress(user),
      });
    }

    setStatusMessage(null);
    setIsEditing((current) => !current);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData((current) => ({
        ...current,
        address: { ...current.address, [field]: value },
      }));
    } else {
      setFormData((current) => ({ ...current, [name]: value }));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({
        type: 'error',
        text: 'Please choose a valid image file.',
      });
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: 'Please choose an image smaller than 2 MB.',
      });
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      setFormData((current) => ({
        ...current,
        avatar: String(readerEvent.target?.result || ''),
      }));
    };

    reader.onerror = () => {
      setStatusMessage({
        type: 'error',
        text: 'Could not read that image.',
      });
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const address = formData.address;
    const addressFields = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
    ];

    const addressHasContent = addressFields.some((value) =>
      String(value || '').trim()
    );

    if (
      addressHasContent &&
      addressFields.some((value) => !String(value || '').trim())
    ) {
      setStatusMessage({
        type: 'error',
        text: 'Please complete the street, city, state, and postal code, or leave the address empty.',
      });
      setLoading(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      bio: formData.bio.trim(),
      avatar: formData.avatar,
    };

    if (addressHasContent) {
      payload.savedAddresses = [
        {
          fullName: address.fullName || formData.name.trim(),
          phone: address.phone || formData.phone.trim(),
          street: address.street.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          zipCode: address.zipCode.trim(),
        },
      ];
    }

    try {
      if (typeof updateUserProfile === 'function') {
        await updateUserProfile(payload);
      } else {
        const response = await API.put('/auth/profile', payload);
        const updatedUser = { ...user, ...response.data };

        if (typeof setUser === 'function') setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setStatusMessage({
        type: 'success',
        text: 'Your profile has been updated successfully.',
      });
      setIsEditing(false);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'We could not save your changes. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const retryFetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');

    try {
      const response = await API.get('/orders/my-orders');
      const payload = response?.data;
      const orderList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.orders)
          ? payload.orders
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

      setOrders(orderList);
    } catch (error) {
      setOrdersError(
        error?.response?.data?.message ||
          'We could not load your order history right now.'
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  const inputClass =
    'mt-1.5 w-full rounded-xl border border-[#E5D9CE] bg-white px-3.5 py-3 text-sm text-[#38291F] outline-none transition placeholder:text-[#9C8D82] focus:border-[#A65D45] focus:ring-2 focus:ring-[#A65D45]/15';

  const cardClass =
    'rounded-2xl border border-[#E9DED3] bg-white p-5 shadow-[0_8px_28px_rgba(56,41,31,0.04)] sm:p-6';

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-3xl border border-[#E9DED3] bg-white p-8">
          <p className="text-lg font-semibold text-[#38291F]">
            Sign in to view your profile
          </p>
          <p className="mt-2 text-sm text-[#78685D]">
            Your account details and purchases will appear here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-5 rounded-xl bg-[#A65D45] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8D4C38]"
          >
            Sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F1] px-4 py-7 text-[#38291F] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A65D45]">
            CraftLocal account
          </p>
          <h1 className="mt-2 font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            Your profile
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#78685D]">
            Manage your personal details, delivery address, and CraftLocal
            activity in one place.
          </p>
        </header>

        <section className="mb-7 overflow-hidden rounded-3xl border border-[#E9DED3] bg-white shadow-[0_12px_36px_rgba(56,41,31,0.06)]">
          <div className="relative h-32 overflow-hidden bg-[#38291F] sm:h-40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(250,247,241,0.18),transparent_30%),radial-gradient(circle_at_85%_70%,rgba(166,93,69,0.65),transparent_38%)]" />
            <div className="absolute bottom-4 right-5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold capitalize tracking-wide text-white backdrop-blur">
              {user.role || 'buyer'} account
            </div>
          </div>

          <div className="px-5 pb-6 pt-5 sm:px-8 sm:pt-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-end gap-4">
                <img
                  src={
                    formData.avatar ||
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name || 'CraftLocal User'
                    )}&background=E9DED3&color=38291F&size=160`
                  }
                  alt={`${user.name || 'User'} profile`}
                  className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white bg-[#F1E8DE] object-cover shadow-md sm:h-28 sm:w-28"
                />
                <div className="min-w-0 pb-1">
                  <h2 className="truncate text-xl font-bold sm:text-2xl">
                    {user.name || 'CraftLocal member'}
                  </h2>
                  <p className="mt-1 truncate text-sm text-[#78685D]">
                    {user.email}
                  </p>
                  <p className="mt-2 inline-flex rounded-full bg-[#F4E8E1] px-2.5 py-1 text-xs font-semibold capitalize text-[#8D4C38]">
                    {user.role || 'buyer'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:pb-1">
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="flex-1 rounded-xl border border-[#DCC7B9] bg-[#FAF7F1] px-4 py-2.5 text-sm font-semibold text-[#8D4C38] transition hover:bg-[#F4E8E1] sm:flex-none"
                >
                  {isEditing ? 'Cancel' : 'Edit profile'}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-[#E7D7CF] px-4 py-2.5 text-sm font-semibold text-[#8D4C38] transition hover:border-[#A65D45] hover:bg-[#FBF1ED]"
                >
                  Log out
                </button>
              </div>
            </div>

            {statusMessage && (
              <div
                role="status"
                className={`mt-5 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
                  statusMessage.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-200 bg-rose-50 text-rose-800'
                }`}
              >
                <span>{statusMessage.text}</span>
                <button
                  type="button"
                  aria-label="Dismiss message"
                  onClick={() => setStatusMessage(null)}
                  className="font-bold opacity-70 hover:opacity-100"
                >
                  ×
                </button>
              </div>
            )}

            {isEditing ? (
              <form
                onSubmit={handleSubmit}
                className="mt-7 border-t border-[#EFE5DC] pt-6"
              >
                <div className="mb-5">
                  <h3 className="font-headline text-lg font-bold">
                    Personal details
                  </h3>
                  <p className="mt-1 text-sm text-[#78685D]">
                    Keep your information up to date.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Full name
                    <input
                      className={inputClass}
                      type="text"
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Phone number
                    <input
                      className={inputClass}
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Add a contact number"
                    />
                  </label>
                </div>

                <label className="mt-4 block text-sm font-semibold">
                  Profile image
                  <input
                    className="mt-2 block w-full cursor-pointer rounded-xl border border-[#E5D9CE] bg-white p-2.5 text-sm text-[#78685D] file:mr-3 file:rounded-lg file:border-0 file:bg-[#F4E8E1] file:px-3 file:py-2 file:font-semibold file:text-[#8D4C38] hover:file:bg-[#EEDBD0]"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                  />
                  <span className="mt-1 block text-xs font-normal text-[#8A7B70]">
                    PNG, JPG, or WebP · maximum 2 MB
                  </span>
                </label>

                <label className="mt-4 block text-sm font-semibold">
                  Bio or craft story
                  <textarea
                    className={inputClass}
                    name="bio"
                    rows={3}
                    maxLength={500}
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell the CraftLocal community a little about yourself..."
                  />
                </label>

                <div className="mb-5 mt-7 border-t border-[#EFE5DC] pt-6">
                  <h3 className="font-headline text-lg font-bold">
                    Default delivery address
                  </h3>
                  <p className="mt-1 text-sm text-[#78685D]">
                    Leave the address empty if you only want to update your
                    profile details. If you enter an address, complete every
                    required field.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Recipient name
                    <input
                      className={inputClass}
                      name="address.fullName"
                      autoComplete="name"
                      value={formData.address.fullName}
                      onChange={handleChange}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Street address
                    <input
                      className={inputClass}
                      name="address.street"
                      autoComplete="street-address"
                      value={formData.address.street}
                      onChange={handleChange}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    City
                    <input
                      className={inputClass}
                      name="address.city"
                      autoComplete="address-level2"
                      value={formData.address.city}
                      onChange={handleChange}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    State
                    <input
                      className={inputClass}
                      name="address.state"
                      autoComplete="address-level1"
                      value={formData.address.state}
                      onChange={handleChange}
                    />
                  </label>
                  <label className="text-sm font-semibold sm:col-span-2">
                    Postal code
                    <input
                      className={inputClass}
                      name="address.zipCode"
                      autoComplete="postal-code"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                    />
                  </label>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    disabled={loading}
                    className="rounded-xl border border-[#DCC7B9] px-5 py-3 text-sm font-semibold text-[#8D4C38] transition hover:bg-[#FAF7F1] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-[#A65D45] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8D4C38] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Saving changes…' : 'Save changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-7 grid gap-6 border-t border-[#EFE5DC] pt-6 md:grid-cols-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#A65D45]">
                    Contact details
                  </h3>
                  <dl className="mt-3 space-y-3 text-sm">
                    <div>
                      <dt className="text-xs text-[#8A7B70]">Email</dt>
                      <dd className="mt-0.5 break-all font-medium">
                        {user.email || 'Not provided'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#8A7B70]">Phone</dt>
                      <dd className="mt-0.5 font-medium">
                        {user.phone || 'Not added yet'}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#A65D45]">
                    About
                  </h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#78685D]">
                    {user.bio ||
                      'Add a short bio to introduce yourself to the CraftLocal community.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {isCreator && (
          <nav
            aria-label="Profile workspace"
            className="mb-6 flex max-w-lg gap-2 rounded-2xl border border-[#E9DED3] bg-[#F1E8DE] p-1.5"
          >
            <button
              type="button"
              onClick={() => setActiveTab('buyer')}
              className={`flex-1 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                activeTab === 'buyer'
                  ? 'bg-white text-[#38291F] shadow-sm'
                  : 'text-[#78685D] hover:text-[#38291F]'
              }`}
            >
              Buyer workspace
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('creator')}
              className={`flex-1 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                activeTab === 'creator'
                  ? 'bg-[#38291F] text-white shadow-sm'
                  : 'text-[#78685D] hover:text-[#38291F]'
              }`}
            >
              Store Studio
            </button>
          </nav>
        )}

        {activeTab === 'buyer' ? (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <section className={cardClass}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4E8E1] text-lg">
                    ✉
                  </span>
                  <div>
                    <h2 className="font-headline text-lg font-bold">
                      Contact information
                    </h2>
                    <p className="text-xs text-[#8A7B70]">
                      Your account details
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <p className="break-all">
                    <span className="text-[#8A7B70]">Email: </span>
                    {user.email || 'Not provided'}
                  </p>
                  <p>
                    <span className="text-[#8A7B70]">Phone: </span>
                    {user.phone || 'Not added yet'}
                  </p>
                </div>
              </section>

              <section className={cardClass}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4E8E1] text-lg">
                    ⌖
                  </span>
                  <div>
                    <h2 className="font-headline text-lg font-bold">
                      Delivery address
                    </h2>
                    <p className="text-xs text-[#8A7B70]">
                      Your saved default address
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-[#78685D]">
                  {formatAddress(defaultAddress) ||
                    'No saved address yet. Choose Edit profile to add one.'}
                </p>
                {defaultAddress.fullName && (
                  <p className="mt-2 text-sm font-semibold">
                    {defaultAddress.fullName}
                  </p>
                )}
              </section>
            </div>

            <section className={cardClass}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A65D45]">
                    Your activity
                  </p>
                  <h2 className="mt-1 font-headline text-xl font-bold">
                    Recent purchases
                  </h2>
                  <p className="mt-1 text-sm text-[#78685D]">
                    Your orders placed through CraftLocal.
                  </p>
                </div>
                <span className="w-fit rounded-full bg-[#F4E8E1] px-3 py-1 text-xs font-semibold text-[#8D4C38]">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </span>
              </div>

              {ordersLoading ? (
                <div className="mt-5 rounded-xl bg-[#FAF7F1] p-6 text-center text-sm text-[#78685D]">
                  Loading your orders…
                </div>
              ) : ordersError ? (
                <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                  <p>{ordersError}</p>
                  <button
                    type="button"
                    onClick={retryFetchOrders}
                    className="mt-2 font-semibold underline"
                  >
                    Try again
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-[#DCC7B9] bg-[#FAF7F1] px-5 py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1E8DE] text-xl">
                    ♡
                  </div>
                  <h3 className="mt-3 font-semibold">No purchases yet</h3>
                  <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#78685D]">
                    When you place an order for a handmade find, it will show up
                    here.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/products')}
                    className="mt-4 rounded-xl bg-[#A65D45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8D4C38]"
                  >
                    Explore products
                  </button>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {orders.map((order, orderIndex) => {
                    const orderItems = Array.isArray(order.items)
                      ? order.items
                      : [];
                    const orderId =
                      order._id || order.id || `order-${orderIndex}`;

                    return (
                      <article
                        key={orderId}
                        className="rounded-xl border border-[#EFE5DC] p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs text-[#8A7B70]">
                              Order #
                              {String(order._id || order.id || '')
                                .slice(-8)
                                .toUpperCase()}
                            </p>
                            <p className="mt-1 text-sm font-semibold">
                              {orderItems.length}{' '}
                              {orderItems.length === 1 ? 'item' : 'items'}
                            </p>
                            <p className="mt-1 text-xs text-[#8A7B70]">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString(
                                    'en-IN',
                                    {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    }
                                  )
                                : 'Date unavailable'}
                            </p>
                          </div>
                          <div className="sm:text-right">
                            <p className="font-bold">
                              {formatCurrency(
                                order.totalAmount ?? order.total ?? 0
                              )}
                            </p>
                            <span className="mt-1 inline-flex rounded-full bg-[#F4E8E1] px-2.5 py-1 text-xs font-semibold capitalize text-[#8D4C38]">
                              {order.status || 'Pending'}
                            </span>
                          </div>
                        </div>

                        {orderItems.length > 0 && (
                          <div className="mt-3 border-t border-[#EFE5DC] pt-3">
                            {orderItems.slice(0, 3).map((item, index) => (
                              <p
                                key={
                                  item._id ||
                                  item.productId ||
                                  `${orderId}-${index}`
                                }
                                className="py-1 text-sm text-[#78685D]"
                              >
                                {item.name || item.product?.name || 'Craft item'}{' '}
                                <span className="text-[#A39489]">
                                  × {item.quantity || 1}
                                </span>
                              </p>
                            ))}
                            {orderItems.length > 3 && (
                              <p className="pt-1 text-xs text-[#8A7B70]">
                                +{orderItems.length - 3} more items
                              </p>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            <section className={cardClass}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A65D45]">
                Store Studio
              </p>
              <h2 className="mt-1 font-headline text-xl font-bold">
                Your craft, your story
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#78685D]">
                Manage your product listings and introduce your craft to the
                CraftLocal community.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#FAF7F1] px-5 py-4">
                  <p className="text-xs font-semibold text-[#78685D]">
                    Products in stock
                  </p>
                  <p className="mt-1 text-3xl font-bold">
                    {products.reduce(
                      (total, product) =>
                        total + (Number(product.stock) > 0 ? 1 : 0),
                      0
                    )}
                  </p>
                  <p className="text-xs text-[#78685D]">
                    listings with available stock
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F4E8E1] px-5 py-4">
                  <p className="text-xs font-semibold text-[#8D4C38]">
                    Your listings
                  </p>
                  <p className="mt-1 text-3xl font-bold">{products.length}</p>
                  <p className="text-xs text-[#78685D]">
                    products in your store
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: user?.name || '',
                    phone: user?.phone || '',
                    avatar: user?.avatar || '',
                    bio: user?.bio || '',
                    address: getSavedAddress(user),
                  });
                  setStatusMessage(null);
                  setIsEditing(true);
                }}
                className="mt-4 rounded-xl border border-[#DCC7B9] px-4 py-2.5 text-sm font-semibold text-[#8D4C38] hover:bg-[#FAF7F1]"
              >
                Edit store bio
              </button>
            </section>

            <section className={cardClass}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A65D45]">
                    Order fulfilment
                  </p>
                  <h2 className="mt-1 font-headline text-xl font-bold">
                    Seller Orders
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[#78685D]">
                    Review purchases containing your products and update each item's progress.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchSellerOrders}
                  disabled={sellerOrdersLoading}
                  className="w-fit rounded-xl border border-[#DCC7B9] px-4 py-2 text-sm font-semibold text-[#8D4C38] disabled:opacity-50"
                >
                  {sellerOrdersLoading ? 'Refreshing…' : 'Refresh orders'}
                </button>
              </div>

              {sellerOrdersMessage && (
                <div
                  role="status"
                  className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                    sellerOrdersMessage.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-rose-200 bg-rose-50 text-rose-800'
                  }`}
                >
                  {sellerOrdersMessage.text}
                </div>
              )}

              {sellerOrdersError && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                  <p>{sellerOrdersError}</p>
                  <button
                    type="button"
                    onClick={fetchSellerOrders}
                    className="mt-2 font-semibold underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {sellerOrdersLoading ? (
                <div className="mt-5 rounded-xl bg-[#FAF7F1] p-6 text-center text-sm text-[#78685D]">
                  Loading seller orders…
                </div>
              ) : !sellerOrdersError && sellerOrders.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-[#DCC7B9] bg-[#FAF7F1] px-5 py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1E8DE] text-xl">
                    ♡
                  </div>
                  <h3 className="mt-3 font-semibold">No seller orders yet</h3>
                  <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#78685D]">
                    Orders containing products assigned to your account will appear here.
                    If you just placed an order, refresh this section.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {sellerOrders.map((order) => {
                    const orderItems = Array.isArray(order.items) ? order.items : [];
                    const orderId = order._id;
                    const address = order.shippingAddress || {};

                    return (
                      <article
                        key={orderId}
                        className="rounded-2xl border border-[#EFE5DC] p-4 sm:p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs text-[#8A7B70]">
                              Order #{String(orderId || '').slice(-8).toUpperCase()}
                            </p>
                            <p className="mt-1 text-sm font-semibold">
                              {orderItems.length} {orderItems.length === 1 ? 'item' : 'items'} in your store
                            </p>
                            <p className="mt-1 text-xs text-[#8A7B70]">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Date unavailable'}
                            </p>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-xs text-[#8A7B70]">Your items subtotal</p>
                            <p className="mt-1 text-lg font-bold">
                              {formatCurrency(
                                order.sellerSubtotal ??
                                  orderItems.reduce(
                                    (sum, item) =>
                                      sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
                                    0
                                  )
                              )}
                            </p>
                            <span className="mt-1 inline-flex rounded-full bg-[#F4E8E1] px-2.5 py-1 text-xs font-semibold text-[#8D4C38]">
                              {order.status || 'Pending'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-[#FAF7F1] p-4">
                          <h3 className="text-sm font-semibold">Delivery details</h3>
                          <p className="mt-2 text-sm font-medium">
                            {address.fullName || 'Name not provided'}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[#78685D]">
                            {[address.address, address.city, address.state, address.postalCode]
                              .filter(Boolean)
                              .join(', ') || 'Address not available'}
                          </p>
                          {address.phone && (
                            <p className="mt-1 text-sm text-[#78685D]">
                              Phone: {address.phone}
                            </p>
                          )}
                          <p className="mt-2 text-xs text-[#8A7B70]">
                            Payment: {(order.paymentMethod || 'COD').toUpperCase()} · {order.paymentStatus || 'Pending'} · Delivery: {order.deliveryMethod || 'standard'}
                          </p>
                        </div>

                        <div className="mt-4 space-y-3">
                          {orderItems.map((item, index) => {
                            const itemStatus = item.status || order.status || 'Pending';
                            const updateKey = `${orderId}-${item.productId?._id || item.productId || item.product?._id}`;
                            const allowedStatuses = getAllowedNextStatuses(itemStatus);

                            return (
                              <div
                                key={item._id || updateKey || `${orderId}-${index}`}
                                className="flex flex-col gap-3 rounded-xl border border-[#EFE5DC] p-3 sm:flex-row sm:items-center"
                              >
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name || 'Ordered craft'}
                                    className="h-16 w-16 rounded-lg bg-[#F1E8DE] object-cover"
                                    onError={(event) => {
                                      event.currentTarget.style.display = 'none';
                                    }}
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold">{item.name || 'Craft item'}</p>
                                  <p className="mt-1 text-sm text-[#78685D]">
                                    {formatCurrency(item.price)} × {item.quantity || 1}
                                  </p>
                                  <p className="mt-1 text-xs text-[#8A7B70]">
                                    Item status: {itemStatus}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-2 sm:min-w-48">
                                  {allowedStatuses.length > 0 ? (
                                    <select
                                      aria-label={`Update status for ${item.name || 'order item'}`}
                                      className={inputClass}
                                      value=""
                                      disabled={sellerOrderUpdating === updateKey}
                                      onChange={(event) => {
                                        const nextStatus = event.target.value;
                                        if (nextStatus) {
                                          updateSellerOrderStatus(order, item, nextStatus);
                                        }
                                      }}
                                    >
                                      <option value="">
                                        {sellerOrderUpdating === updateKey ? 'Updating…' : 'Update status…'}
                                      </option>
                                      {allowedStatuses.map((status) => (
                                        <option key={status} value={status}>
                                          {status}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span className="rounded-lg bg-[#FAF7F1] px-3 py-2 text-center text-xs text-[#78685D]">
                                      No further updates
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section
              id="store-product-form"
              className={`${cardClass} scroll-mt-24`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A65D45]">
                Product management
              </p>
              <h2 className="mt-1 font-headline text-xl font-bold">
                {editingProductId ? 'Edit product' : 'Add a product'}
              </h2>
              <p className="mt-1 text-sm text-[#78685D]">
                Price is in Indian rupees (₹). Product images currently use a
                public image URL.
              </p>

              <form onSubmit={handleProductSubmit} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Product name *
                    <input
                      className={inputClass}
                      name="name"
                      value={productForm.name}
                      onChange={handleProductFormChange}
                      maxLength={120}
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Category *
                    <select
                      className={inputClass}
                      name="category"
                      value={productForm.category}
                      onChange={handleProductFormChange}
                      required
                    >
                      {productCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block text-sm font-semibold">
                  Description *
                  <textarea
                    className={inputClass}
                    name="description"
                    value={productForm.description}
                    onChange={handleProductFormChange}
                    rows={4}
                    maxLength={3000}
                    required
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Price (₹) *
                    <input
                      className={inputClass}
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleProductFormChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Stock quantity *
                    <input
                      className={inputClass}
                      type="number"
                      name="stock"
                      value={productForm.stock}
                      onChange={handleProductFormChange}
                      min="0"
                      step="1"
                      required
                    />
                  </label>
                </div>

                <label className="block text-sm font-semibold">
                  Product image URL *
                  <input
                    className={inputClass}
                    type="url"
                    name="image"
                    value={productForm.image}
                    onChange={handleProductFormChange}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  <span className="mt-1 block text-xs font-normal text-[#8A7B70]">
                    Use a publicly accessible image URL. File uploads are not
                    enabled yet.
                  </span>
                </label>

                <div className="border-t border-[#EFE5DC] pt-4">
                  <h3 className="font-semibold">Artisan location</h3>
                  <p className="mt-1 text-xs text-[#8A7B70]">
                    Optional. GPS coordinates can be used for nearby product
                    search.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    City
                    <input
                      className={inputClass}
                      name="city"
                      value={productForm.city}
                      onChange={handleProductFormChange}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    District
                    <input
                      className={inputClass}
                      name="district"
                      value={productForm.district}
                      onChange={handleProductFormChange}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    State
                    <input
                      className={inputClass}
                      name="state"
                      value={productForm.state}
                      onChange={handleProductFormChange}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Postal code
                    <input
                      className={inputClass}
                      name="postalCode"
                      value={productForm.postalCode}
                      onChange={handleProductFormChange}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Latitude
                    <input
                      className={inputClass}
                      type="number"
                      name="latitude"
                      value={productForm.latitude}
                      onChange={handleProductFormChange}
                      min="-90"
                      max="90"
                      step="any"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Longitude
                    <input
                      className={inputClass}
                      type="number"
                      name="longitude"
                      value={productForm.longitude}
                      onChange={handleProductFormChange}
                      min="-180"
                      max="180"
                      step="any"
                    />
                  </label>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={resetProductForm}
                      disabled={productSaving}
                      className="rounded-xl border border-[#DCC7B9] px-5 py-3 text-sm font-semibold text-[#8D4C38] disabled:opacity-50"
                    >
                      Cancel edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={productSaving}
                    className="rounded-xl bg-[#A65D45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8D4C38] disabled:opacity-60"
                  >
                    {productSaving
                      ? 'Saving product…'
                      : editingProductId
                        ? 'Save product changes'
                        : 'Add product to store'}
                  </button>
                </div>
              </form>
            </section>

            <section className={cardClass}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A65D45]">
                    Your inventory
                  </p>
                  <h2 className="mt-1 font-headline text-xl font-bold">
                    My products
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={fetchMyProducts}
                  disabled={productsLoading}
                  className="w-fit rounded-xl border border-[#DCC7B9] px-4 py-2 text-sm font-semibold text-[#8D4C38] disabled:opacity-50"
                >
                  {productsLoading ? 'Refreshing…' : 'Refresh products'}
                </button>
              </div>

              {productsError && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                  <p>{productsError}</p>
                  <button
                    type="button"
                    onClick={fetchMyProducts}
                    className="mt-2 font-semibold underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {productsLoading ? (
                <div className="mt-5 rounded-xl bg-[#FAF7F1] p-6 text-center text-sm text-[#78685D]">
                  Loading your products…
                </div>
              ) : products.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-[#DCC7B9] bg-[#FAF7F1] px-5 py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1E8DE] text-xl">
                    ✦
                  </div>
                  <h3 className="mt-3 font-semibold">
                    Your store is ready for its first listing
                  </h3>
                  <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#78685D]">
                    Add a product using the form above. Existing marketplace
                    products will not appear here unless they are assigned to
                    your account.
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <article
                      key={product._id}
                      className="overflow-hidden rounded-2xl border border-[#EFE5DC] bg-white"
                    >
                      <div className="aspect-[4/3] bg-[#F1E8DE]">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-semibold text-[#A65D45]">
                          {product.category}
                        </p>
                        <h3 className="mt-1 font-semibold">{product.name}</h3>
                        <p className="mt-2 font-bold">
                          {formatCurrency(product.price)}
                        </p>
                        <p
                          className={`mt-1 text-xs ${
                            Number(product.stock) > 0
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {Number(product.stock) > 0
                            ? `${product.stock} in stock`
                            : 'Out of stock'}
                        </p>
                        <p className="mt-2 text-sm leading-5 text-[#78685D]">
                          {product.description}
                        </p>
                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditProduct(product)}
                            className="flex-1 rounded-lg border border-[#DCC7B9] px-3 py-2 text-sm font-semibold text-[#8D4C38] hover:bg-[#FAF7F1]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product)}
                            className="flex-1 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export { Profile };
export default Profile;
