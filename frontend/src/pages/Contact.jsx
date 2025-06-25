import React, { useState } from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
          <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-xl w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-700" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send the formData to a server here.
    console.log(formData);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-2 w-full">
      <div className="w-full bg-white rounded-2xl shadow-2xl p-8 md:p-14 flex flex-col items-center border border-blue-100">
        <div className="flex flex-col md:flex-row items-center gap-10 w-full">
          <div className="flex-1 min-w-[300px] flex flex-col items-center md:items-start">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-blue-700 text-center md:text-left">
              Contact <span className="text-teal-500">Us</span>
            </h1>
            <p className="text-lg mb-8 text-gray-700 text-center md:text-left">
              Have questions about disease detection or want to book an appointment? Fill out the form or reach us directly!
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 w-full max-w-md"
            >
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                className="p-3 rounded-xl border border-blue-200 bg-blue-50 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
                className="p-3 rounded-xl border border-blue-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="p-3 rounded-xl border border-blue-200 bg-blue-50 text-base focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                rows={4}
                required
                className="p-3 rounded-xl border border-blue-200 bg-white text-base resize-none focus:outline-none focus:ring-2 focus:ring-teal-200 transition"
              />
              <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl text-lg font-bold mt-2 shadow-md transition-all"
              >
                Send Message
              </button>
            </form>
            <div className="mt-8 text-gray-700 text-base space-y-1 w-full max-w-md">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M16 12H8m8 0a8 8 0 11-16 0 8 8 0 0116 0z" />
                </svg>
                <strong>Email:</strong> support@healthdetect.com
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                  <path d="M16 3v4a1 1 0 001 1h4" />
                </svg>
                <strong>Phone:</strong> +1 234 567 8901
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-[260px] flex justify-center items-center">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
              alt="Contact illustration"
              className="rounded-2xl w-full max-w-xs object-cover shadow-lg border-4 border-blue-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactPage = (props) => (
  <ErrorBoundary>
    <Contact {...props} />
  </ErrorBoundary>
);

export default ContactPage;
