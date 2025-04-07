import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiChevronRight,
  FiDollarSign,
  FiCalendar,
  FiHome,
  FiShield,
  FiUsers,
  FiHelpCircle,
} from 'react-icons/fi';
import { MdOutlineWorkspaces } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import logo_black from '../../assets/logo_black.jpg';

const BecomeHost = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  // FAQ data
  const faqs = [
    {
      question: 'What types of spaces can I list on OpenSpace?',
      answer:
        "You can list various types of spaces including conference rooms, meeting rooms, event spaces, studios, and any other professional workspaces. We're looking for spaces that provide value to professionals and businesses.",
    },
    {
      question: 'How much can I earn as an OpenSpace host?',
      answer:
        'Earnings vary based on your location, space type, amenities, and availability. Our hosts typically earn between ₱1,000 to ₱5,000 per booking, with popular spaces in prime locations earning even more.',
    },
    {
      question: 'Do I need to be verified to become a host?',
      answer:
        'Yes, all hosts must complete our verification process which includes providing government ID, proof of property ownership or authorization to list the space, and completion of our host training program.',
    },
    {
      question: 'What fees does OpenSpace charge?',
      answer:
        'OpenSpace takes a 15% service fee from each booking. This covers our platform services, payment processing, customer support, and marketing to help your listing reach more potential clients.',
    },
    {
      question: 'How do I get paid for my bookings?',
      answer:
        'We process payments 24 hours after guests check in. Funds are then transferred to your preferred payment method (bank account, GCash, or Maya) with payments typically arriving within 3-5 business days.',
    },
  ];

  // Process steps
  const hostingSteps = [
    {
      icon: <FiHome className="w-8 h-8 text-blue-500" />,
      title: 'List your space',
      description:
        'Describe your space, add high-quality photos, and set your availability and pricing.',
    },
    {
      icon: <FiCalendar className="w-8 h-8 text-blue-500" />,
      title: 'Manage bookings',
      description: 'Review and accept booking requests that fit your schedule.',
    },
    {
      icon: <MdOutlineWorkspaces className="w-8 h-8 text-blue-500" />,
      title: 'Welcome guests',
      description:
        "Provide access to your space and ensure it's clean and ready for use.",
    },
    {
      icon: <FiDollarSign className="w-8 h-8 text-blue-500" />,
      title: 'Get paid',
      description:
        'Receive secure payments directly to your preferred payment method.',
    },
  ];

  // Benefits
  const benefits = [
    {
      icon: <FiDollarSign className="w-10 h-10 text-blue-500" />,
      title: 'Earn Extra Income',
      description: 'Turn your unused space into a revenue stream',
    },
    {
      icon: <FiCalendar className="w-10 h-10 text-green-500" />,
      title: 'Flexible Schedule',
      description: 'You control when your space is available',
    },
    {
      icon: <FiShield className="w-10 h-10 text-purple-500" />,
      title: 'Secure & Protected',
      description: 'All bookings are verified and insured',
    },
    {
      icon: <FiUsers className="w-10 h-10 text-orange-500" />,
      title: 'Expand Your Network',
      description: 'Connect with professionals in your area',
    },
  ];

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      navigate('/auth/login?redirect=/become-host');
    } else if (user && user.role === 'host') {
      navigate('/dashboard');
    } else {
      navigate('/profile/edit');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue text-gray-900 dark:text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-400 dark:from-blue-900 dark:to-indigo-900">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                Share Your Space,
                <br />
                Grow Your Income
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-lg">
                Join OpenSpace hosts who are earning by sharing their
                professional spaces with people who need them.
              </p>
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-white text-blue-600 dark:bg-light dark:text-darkBlue text-lg font-semibold rounded-xl shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300">
                Become a Host
              </button>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <div className="relative w-80 h-80 md:w-96 md:h-96">
                <div className="absolute -top-4 -left-4 w-full h-full bg-blue-300 dark:bg-blue-700 rounded-xl transform rotate-6"></div>
                <div className="absolute -bottom-4 -right-4 w-full h-full bg-blue-500 dark:bg-blue-900 rounded-xl transform -rotate-6"></div>
                <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Modern workspace"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white dark:bg-gray-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center p-6">
              <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                5,000+
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Active Hosts
              </p>
            </div>
            <div className="text-center p-6">
              <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                ₱15M+
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Monthly Earnings
              </p>
            </div>
            <div className="text-center p-6">
              <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                10K+
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Monthly Bookings
              </p>
            </div>
            <div className="text-center p-6">
              <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                98%
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Satisfaction Rate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 md:py-24 bg-gray-50 dark:bg-darkBlue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Host on OpenSpace?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of hosts who are leveraging their spaces to create
              new income streams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 md:py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How Hosting Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Hosting on OpenSpace is simple and secure. Here's how it works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {hostingSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mb-4">
                    {step.icon}
                  </div>
                  <span className="absolute top-0 right-0 -mt-4 -mr-4 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
                {index < hostingSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <FiChevronRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 md:py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get answers to the most common questions about hosting on
              OpenSpace.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-4">
                <button
                  onClick={() =>
                    setSelectedQuestion(
                      selectedQuestion === index ? null : index
                    )
                  }
                  className="w-full flex items-center justify-between p-5 rounded-xl bg-gray-50 dark:bg-gray-700 text-left focus:outline-none transition-all">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <span
                    className={`transform transition-transform duration-300 ${
                      selectedQuestion === index ? 'rotate-180' : ''
                    }`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </button>
                {selectedQuestion === index && (
                  <div className="p-5 border-t dark:border-gray-600">
                    <p className="text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <img
              src={logo_black}
              alt="OpenSpace"
              className="h-12 mx-auto bg-white rounded-full p-1"
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to become a host?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community of hosts and start earning from your space today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-blue-600 dark:bg-light dark:text-darkBlue text-lg font-semibold rounded-xl shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300">
              Start Hosting
            </button>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-gray-50 dark:bg-darkBlue py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-3">
            <FiHelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Need help?
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Our host support team is available 24/7 to answer your questions.
          </p>
          <button className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Contact Host Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default BecomeHost;
