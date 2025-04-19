import React from 'react';
import { useFormPersist, clearAllFormData } from '../utils/formPersistence';

interface FormData {
  name: string;
  email: string;
  message: string;
}

const ExampleForm: React.FC = () => {
  // Use the form persistence hook with a unique key prefix
  const [formData, setFormData] = useFormPersist<FormData>('form_example', {
    name: '',
    email: '',
    message: '',
  });

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Process the form submission
    console.log('Form submitted:', formData);

    // Clear the form data from sessionStorage after successful submission
    clearAllFormData();

    // Reset the form
    setFormData({
      name: '',
      email: '',
      message: '',
    });

    // Show success message
    alert('Form submitted successfully!');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Contact Form</h2>

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Message
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={4}
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
        Submit
      </button>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Your form data will persist even if you switch tabs or refresh the page.
      </p>
    </form>
  );
};

export default ExampleForm;
