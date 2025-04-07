import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiUsers, FiTag, FiTrash2, FiPlus } from 'react-icons/fi';
import { FaPesoSign } from 'react-icons/fa6';

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
const CATEGORIES = ['Conference Room', 'Event Space', 'Room Stays'];

const CreateRoom = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    category: '',
    price: '',
    description: '',
    capacity: '',
    amenities: [] as string[],
    images: [] as File[],
  });

  // Image preview URLs
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle text input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
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
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const updatedImages = [...formData.images, ...newFiles];

    // Generate preview URLs
    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

    setFormData({
      ...formData,
      images: updatedImages,
    });

    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);

    // Clear error if it exists
    if (errors.images) {
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

    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);

    const updatedPreviewUrls = [...imagePreviewUrls];
    updatedPreviewUrls.splice(index, 1);

    setFormData({
      ...formData,
      images: updatedImages,
    });

    setImagePreviewUrls(updatedPreviewUrls);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (!formData.description.trim())
      newErrors.description = 'Description is required';
    if (!formData.capacity.trim()) newErrors.capacity = 'Capacity is required';
    else if (
      isNaN(Number(formData.capacity)) ||
      Number(formData.capacity) <= 0
    ) {
      newErrors.capacity = 'Capacity must be a positive number';
    }

    if (formData.amenities.length === 0)
      newErrors.amenities = 'Select at least one amenity';
    if (formData.images.length === 0)
      newErrors.images = 'Upload at least one image';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Here you would normally send the data to your API
      console.log('Form submitted with data:', formData);

      // Mock successful submission
      setTimeout(() => {
        alert('Room created successfully!');
        navigate('/dashboard'); // Redirect to dashboard or room list
      }, 1500);
    } catch (error) {
      console.error('Error creating room:', error);
      setErrors({
        ...errors,
        form: 'Failed to create room. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // For numeric inputs only
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value === '' || /^\d+$/.test(value)) {
      handleInputChange(e);
    }
  };

  return (
    <section className="min-h-screen bg-light dark:bg-darkBlue">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Create New Space
        </h1>

        {errors.form && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
            {errors.form}
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
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Space Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.name
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-700'
                    } 
                  bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                    placeholder="e.g., Creative Studio Space"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      errors.location
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-700'
                    } 
                  bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                    placeholder="e.g., Manila, Philippines"
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.location}
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
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      errors.category
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
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (₱)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPesoSign className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleNumericInput}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      errors.price
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-700'
                    } 
                  bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                    placeholder="e.g., 5000"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.price}
                  </p>
                )}
              </div>

              {/* Capacity */}
              <div>
                <label
                  htmlFor="capacity"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Capacity
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUsers className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleNumericInput}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      errors.capacity
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-700'
                    } 
                  bg-light dark:bg-gray-900 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                    placeholder="e.g., 25"
                  />
                </div>
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.capacity}
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
