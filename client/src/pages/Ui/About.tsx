import { useState } from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { MdOutlineWeb } from 'react-icons/md';

const About = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const team = [
    {
      name: 'Josh Khovick Fermano',
      role: 'Founder | Lead Developer',
      description: 'Full-stack developer with expertise in React and Node.js',
      github: 'https://github.com/',
      linkedin: 'https://linkedin.com/in/',
      website: 'https://example.com/',
    },
    {
      name: 'Earl Justine Simbajon',
      role: 'UI/UX Designer',
      description: 'Creating intuitive and accessible user experiences',
      github: 'https://github.com/',
      linkedin: 'https://linkedin.com/in/',
      website: 'https://example.com/',
    },
    {
      name: 'Inaki Manuel Flores',
      role: 'Systems Analyst',
      description: 'Ensuring smooth operations and timely deliveries',
      github: 'https://github.com/',
      linkedin: 'https://linkedin.com/in/',
      website: 'https://example.com/',
    },
    {
      name: 'Dennis Delos Santos',
      role: 'Web Developer',
      description: 'Ensuring smooth operations and timely deliveries',
      github: 'https://github.com/',
      linkedin: 'https://linkedin.com/in/',
      website: 'https://example.com/',
    },
    {
      name: 'Yahweh Sarceno',
      role: 'Web Developer',
      description: 'Ensuring smooth operations and timely deliveries',
      github: 'https://github.com/',
      linkedin: 'https://linkedin.com/in/',
      website: 'https://example.com/',
    },
  ];

  return (
    <div className="min-h-screen px-4 py-8 md:py-16 bg-light dark:bg-darkBlue text-darkBlue dark:text-light transition-all duration-300">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">About OpenSpace</h1>
          <p className="text-xl max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
            A modern platform for finding and booking collaborative workspaces
            that inspire creativity and productivity.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5 order-2 md:order-1">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300">
              OpenSpace was founded with a simple mission: to connect
              professionals with inspiring workspaces where they can thrive. We
              believe that the right environment can fuel innovation and
              collaboration.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              By making it easy to discover, compare, and book workspaces, we're
              helping to create a more flexible and productive work culture for
              everyone.
            </p>
          </div>
          <div className="border-2 border-darkBlue dark:border-light rounded-lg h-64 md:h-80 bg-gray-100 dark:bg-gray-800 flex items-center justify-center order-1 md:order-2">
            <p className="text-gray-400 italic">Mission Image</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-10">
          <h2 className="text-3xl font-bold text-center">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {['Curated Workspaces', 'Seamless Booking', 'Verified Reviews'].map(
              (feature, index) => (
                <div
                  key={index}
                  className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800">
                  <h3 className="text-xl font-semibold mb-3">{feature}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut
                    elit tellus, luctus nec ullamcorper mattis.
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Team Section */}
        <div className="space-y-10">
          <h2 className="text-3xl font-bold text-center">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg transition-all duration-300"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}>
                <div className="aspect-w-3 aspect-h-4 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <p className="text-gray-400 italic">Photo</p>
                </div>

                <div
                  className={`absolute inset-0 bg-darkBlue/80 dark:bg-light/90 flex flex-col justify-end p-5 text-light dark:text-darkBlue transition-all duration-500 ${
                    hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                  }`}>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="font-medium">{member.role}</p>
                  <p className="mt-2 text-sm">{member.description}</p>
                  <div className="flex gap-4 mt-4">
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer">
                      <FaGithub className="text-xl hover:scale-110 transition-transform" />
                    </a>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer">
                      <FaLinkedin className="text-xl hover:scale-110 transition-transform" />
                    </a>
                    <a
                      href={member.website}
                      target="_blank"
                      rel="noopener noreferrer">
                      <MdOutlineWeb className="text-xl hover:scale-110 transition-transform" />
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-bold">{member.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-3xl font-bold">Get In Touch</h2>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions about OpenSpace? We'd love to hear from you.
          </p>
          <button className="mt-4 px-6 py-3 bg-darkBlue text-light dark:bg-light dark:text-darkBlue rounded-lg hover:scale-105 transition-all duration-300">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
