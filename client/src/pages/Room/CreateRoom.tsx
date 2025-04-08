import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiUsers, FiTag, FiTrash2, FiPlus } from 'react-icons/fi';
import { FaPesoSign } from 'react-icons/fa6';
import { roomApi } from '../../services/roomApi';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../services/core';

// Common amenities options
const AMENITIES_OPTIONS = [
  'Wi-Fi',
  'Air Conditioning',
  'Projector',
  'Whiteboard',
  'Coffee/Tea',
  'Microphone',
  'Speaker System',
  'Catering Available',
  'Restrooms',
  'Parking',
  'Accessible Entry',
  'Natural Lighting',
  'Outdoor Space',
];

// Room categories
const CATEGORIES = ['Conference Room', 'Events Place', 'Room Stay'];

const CreateRoom = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, user } = useAuth();

  // Check if user can create rooms (must be a host)
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'host') {
      navigate('/become-host');
    } else if (!isAuthenticated) {
      navigate('/auth/login?redirect=/rooms/create');
    }
  }, [isAuthenticated, user, navigate]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: 'Philippines',
      zipCode: '',
    },
    type: '',
    price: {
      basePrice: '',
      cleaningFee: '0',
      serviceFee: '0',
    },
    capacity: {
      maxGuests: '',
    },
    amenities: [] as string[],
    houseRules: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      instantBooking: false,
      cancellationPolicy: 'Standard 48-hour cancellation policy',
    },
    availability: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      isAlwaysAvailable: true,
    },
  });

  // Image files state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prevData) => {
        // Safely access the parent property
        const parentObj = prevData[parent as keyof typeof prevData];

        // Make sure it's an object before spreading
        if (
          parentObj &&
          typeof parentObj === 'object' &&
          !Array.isArray(parentObj)
        ) {
          return {
            ...prevData,
            [parent]: {
              ...parentObj,
              [child]: value,
            },
          };
        }

        // If it's not a valid object, return unchanged state
        return prevData;
      });
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // For handling type selection (mapping to backend types)
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryToType: Record<string, string> = {
      'Conference Room': 'conference',
      'Events Place': 'event',
      'Room Stay': 'stay',
    };

    const category = e.target.value;
    const type = categoryToType[category] || '';

    setFormData({
      ...formData,
      type: type,
    });

    if (errors.type) {
      setErrors({
        ...errors,
        type: '',
      });
    }
  };

  // Handle amenity selection
  const handleAmenityToggle = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a !== amenity),
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }

    // Clear amenities error if it exists and we now have amenities
    if (errors.amenities && formData.amenities.length > 0) {
      setErrors({
        ...errors,
        amenities: '',
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);

    // Check file size and type
    const validFiles = newFiles.filter((file) => {
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      const isValidType = file.type.startsWith('image/');

      if (!isValidSize) {
        setErrors({
          ...errors,
          images: 'One or more images exceed the 10MB limit',
        });
      } else if (!isValidType) {
        setErrors({
          ...errors,
          images: 'Only image files are allowed',
        });
      }

      return isValidSize && isValidType;
    });

    const updatedFiles = [...imageFiles, ...validFiles];
    setImageFiles(updatedFiles);

    // Generate preview URLs
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);

    // Clear error if it exists and we now have images
    if (errors.images && updatedFiles.length > 0) {
      setErrors({
        ...errors,
        images: '',
      });
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);

    const updatedFiles = [...imageFiles];
    updatedFiles.splice(index, 1);

    const updatedPreviewUrls = [...imagePreviewUrls];
    updatedPreviewUrls.splice(index, 1);

    setImageFiles(updatedFiles);
    setImagePreviewUrls(updatedPreviewUrls);

    // Re-add error if no images left
    if (updatedFiles.length === 0) {
      setErrors({
        ...errors,
        images: 'Upload at least one image',
      });
    }
  };

  // For numeric inputs only
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === '' || /^\d+$/.test(value)) {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData((prevData) => {
          // Safely access the parent property
          const parentObj = prevData[parent as keyof typeof prevData];

          // Make sure it's an object before spreading
          if (
            parentObj &&
            typeof parentObj === 'object' &&
            !Array.isArray(parentObj)
          ) {
            return {
              ...prevData,
              [parent]: {
                ...parentObj,
                [child]: value,
              },
            };
          }

          return prevData;
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }

      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: '',
        });
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.title.trim()) newErrors['title'] = 'Name is required';
    if (!formData.type) newErrors['type'] = 'Category is required';
    if (!formData.description.trim())
      newErrors['description'] = 'Description is required';

    // Location validation
    if (!formData.location.address.trim())
      newErrors['location.address'] = 'Address is required';
    if (!formData.location.city.trim())
      newErrors['location.city'] = 'City is required';
    if (!formData.location.state.trim())
      newErrors['location.state'] = 'State/Province is required';
    if (!formData.location.zipCode.trim())
      newErrors['location.zipCode'] = 'Zip code is required';

    // Price validation
    if (!formData.price.basePrice.trim())
      newErrors['price.basePrice'] = 'Price is required';
    else if (
      isNaN(Number(formData.price.basePrice)) ||
      Number(formData.price.basePrice) <= 0
    ) {
      newErrors['price.basePrice'] = 'Price must be a positive number';
    }

    // Capacity validation
    if (!formData.capacity.maxGuests.trim())
      newErrors['capacity.maxGuests'] = 'Capacity is required';
    else if (
      isNaN(Number(formData.capacity.maxGuests)) ||
      Number(formData.capacity.maxGuests) <= 0
    ) {
      newErrors['capacity.maxGuests'] = 'Capacity must be a positive number';
    }

    // Amenities validation
    if (formData.amenities.length === 0)
      newErrors['amenities'] = 'Select at least one amenity';

    // Images validation
    if (imageFiles.length === 0)
      newErrors['images'] = 'Upload at least one image';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitMessage('');

    try {
      // First, create the room
      const roomResponse = await roomApi.createRoom(formData);

      if (!roomResponse.success) {
        throw new Error(roomResponse.message || 'Failed to create room');
      }

      const roomId = roomResponse.data._id;

      // Then, if we have images, upload them
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });

        // Use fetch directly for file uploads with full URL
        const imageResponse = await fetch(
          `${API_URL}/api/rooms/${roomId}/images`,
          {
            method: 'POST',
            credentials: 'include',
            body: formData,
          }
        );

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json();
          throw new Error(errorData.message || 'Failed to upload images');
        }
      }

      setSubmitSuccess(true);
      setSubmitMessage(
        'Space created successfully! Redirecting to your dashboard...'
      );

      // Redirect after short delay
      setTimeout(() => {
        navigate('/dashboard/host/listings');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating room:', error);
      setSubmitSuccess(false);
      setSubmitMessage(
        error.message || 'Failed to create space. Please try again.'
      );
      setErrors({
        ...errors,
        form: error.message || 'Failed to create space. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-light dark:bg-darkBlue">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Create New Space
        </h1>

        {submitSuccess === false && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
            {submitMessage || errors.form}
          </div>
        )}

        {submitSuccess === true && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg mb-6">
            {submitMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Details Section */}
          <div className="bg-light dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-light">
              Basic Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Space Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.title
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-700'
                    } 
                  bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                    placeholder="e.g., Creative Studio Space"
                  />
                </div>
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiTag className="text-gray-400" />
                  </div>
                  <select
                    id="category"
                    name="category"
                    onChange={handleTypeChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      errors.type
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-700'
                    } 
                  bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}>
                    <option value="">Select a category</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.type}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="location.address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="location.address"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      errors['location.address']
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-700'
                    } 
                  bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                    placeholder="e.g., 123 Main Street"
                  />
                </div>
                {errors['location.address'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors['location.address']}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="location.city"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="location.city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors['location.city']
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-700'
                  } 
                bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                  placeholder="e.g., Manila"
                />
                {errors['location.city'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors['location.city']}
                  </p>
                )}
              </div>

              {/* State */}
              <div>
                <label
                  htmlFor="location.state"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  id="location.state"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors['location.state']
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-700'
                  } 
                bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                  placeholder="e.g., Metro Manila"
                />
                {errors['location.state'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors['location.state']}
                  </p>
                )}
              </div>

              {/* Zip Code */}
              <div>
                <label
                  htmlFor="location.zipCode"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Postal/Zip Code
                </label>
                <input
                  type="text"
                  id="location.zipCode"
                  name="location.zipCode"
                  value={formData.location.zipCode}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors['location.zipCode']
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-700'
                  } 
                bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                  placeholder="e.g., 1000"
                />
                {errors['location.zipCode'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors['location.zipCode']}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price.basePrice"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (₱)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPesoSign className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="price.basePrice"
                    name="price.basePrice"
                    value={formData.price.basePrice}
                    onChange={handleNumericInput}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      errors['price.basePrice']
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-700'
                    } 
                  bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                    placeholder="e.g., 5000"
                  />
                </div>
                {errors['price.basePrice'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors['price.basePrice']}
                  </p>
                )}
              </div>

              {/* Capacity */}
              <div>
                <label
                  htmlFor="capacity.maxGuests"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Capacity
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUsers className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="capacity.maxGuests"
                    name="capacity.maxGuests"
                    value={formData.capacity.maxGuests}
                    onChange={handleNumericInput}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      errors['capacity.maxGuests']
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-700'
                    } 
                  bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                    placeholder="e.g., 25"
                  />
                </div>
                {errors['capacity.maxGuests'] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors['capacity.maxGuests']}
                  </p>
                )}
              </div>

              {/* Description - Full width */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.description
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-700'
                  } 
                bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                  placeholder="Describe your space - what makes it special, features, ambiance, etc."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Amenities Section */}
          <div className="bg-light dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-light">
                Amenities
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formData.amenities.length} selected
              </div>
            </div>

            {errors.amenities && (
              <p className="mb-3 text-sm text-red-600 dark:text-red-400">
                {errors.amenities}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {AMENITIES_OPTIONS.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    formData.amenities.includes(amenity)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-2 border-blue-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-light dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-light">
              Space Images
            </h2>

            {errors.images && (
              <p className="mb-3 text-sm text-red-600 dark:text-red-400">
                {errors.images}
              </p>
            )}

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* Image upload button */}
            <button
              type="button"
              onClick={triggerFileInput}
              className="mb-4 flex items-center justify-center w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
              <div className="flex flex-col items-center text-center">
                <FiPlus
                  size={24}
                  className="text-gray-400 dark:text-gray-500 mb-2"
                />
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  Click to upload images
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PNG, JPG, WEBP up to 10MB
                </p>
              </div>
            </button>

            {/* Image previews */}
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-black/50 text-light p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* House Rules Section */}
          <div className="bg-light dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-light">
              Booking Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Check-in Time */}
              <div>
                <label
                  htmlFor="houseRules.checkInTime"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Check-in Time
                </label>
                <input
                  type="time"
                  id="houseRules.checkInTime"
                  name="houseRules.checkInTime"
                  value={formData.houseRules.checkInTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                  bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                />
              </div>

              {/* Check-out Time */}
              <div>
                <label
                  htmlFor="houseRules.checkOutTime"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Check-out Time
                </label>
                <input
                  type="time"
                  id="houseRules.checkOutTime"
                  name="houseRules.checkOutTime"
                  value={formData.houseRules.checkOutTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                  bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                />
              </div>

              {/* Cancellation Policy */}
              <div className="md:col-span-2">
                <label
                  htmlFor="houseRules.cancellationPolicy"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cancellation Policy
                </label>
                <textarea
                  id="houseRules.cancellationPolicy"
                  name="houseRules.cancellationPolicy"
                  value={formData.houseRules.cancellationPolicy}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                  bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                  placeholder="Describe your cancellation policy..."
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500">
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-light border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Create Space'
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateRoom;
