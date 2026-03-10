import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Dashboard/Header';
import Footer from '../components/Footer';
import LocationInput from '../components/LocationInput';
import { getUserProfile, deleteUserAccount, updateUserProfile } from '../api';

const UserDashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [modalData, setModalData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    location: '',
  });

  // Load user profile data from API
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const result = await getUserProfile();
        
        if (result.success) {
          setUserData(result.data);
        } else {
          // Fallback to default user data
          setUserData({
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "+1-555-0123",
            dob: null,
            location: "New York, USA",
            verified: false,
            image: null,
          });
        }
      } catch {
        // Fallback to default user data
        setUserData({
          id: 1,
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+1-555-0123",
          dob: null,
          location: "New York, USA",
          verified: false,
          image: null,
        });
      }
    };

    loadUserProfile();
  }, []);



  const toggleModal = (show) => {
    setModalOpen(show);
    if (show && userData) {
      setModalData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        dob: userData.dob ? userData.dob.split('T')[0] : '',
        location: userData.location || '',
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      // Update user data locally for immediate feedback
      setUserData(prev => ({ ...prev, image: imageUrl }));
      // TODO: Implement actual image upload to server
    }
  };

  const saveProfile = async () => {
    const { name, email, phone, dob, location } = modalData;

    if (name && email && phone && location) {
      try {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          alert('Please enter a valid email address');
          return;
        }

        const profileData = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          dob: dob || userData?.dob,
          location: location.trim(),
        };

        const result = await updateUserProfile(profileData);
        if (result.success) {
          // Update local user data
          setUserData(prev => ({ ...prev, ...profileData }));
          
          // Notify Header component to refresh user data
          window.dispatchEvent(new CustomEvent('userLogin'));
          
          toggleModal(false);
          alert('Profile updated successfully!');
        } else {
          const errorMessage = result.message || 'Failed to update profile';
          alert(errorMessage);
        }
      } catch (error) {
        const errorMessage = error.message || 'Failed to update profile. Please try again.';
        alert(errorMessage);
      }
    } else {
      alert('Please fill all required fields.');
    }
  };

  const deleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const result = await deleteUserAccount();
        if (result.success) {
          alert('Account deleted successfully!');
          // Clear local storage and redirect to home
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          window.location.href = '/';
        } else {
          alert(result.message || 'Failed to delete account');
        }
      } catch {
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen font-inter bg-gray-50">
      <Header />
      
      {/* Main User Dashboard Content */}
      <main className="flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl space-y-12">
          {/* Welcome Header */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 drop-shadow-md">
              Welcome, <span id="userName" className="text-indigo-600">{userData?.name || 'User'}</span>!
            </h1>
            <p className="text-lg text-gray-600">Manage your personal details with ease.</p>
          </div>

          {/* User Details Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mx-auto max-w-3xl">
            <div className="flex flex-col md:flex-row items-center justify-center mb-8">
              <div className="relative w-32 h-32 mb-6 md:mb-0 md:mr-8">
                <div
                  id="profileImage"
                  className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-indigo-200 hover:border-indigo-300 transition-all duration-300"
                  style={{
                    backgroundImage: userData?.image ? `url(${userData.image})` : 'none',
                    backgroundSize: userData?.image ? 'cover' : 'auto',
                  }}
                >
                  {!userData?.image && <i className="fas fa-user text-gray-400 text-5xl"></i>}
                </div>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                />
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 id="userNameDisplay" className="text-3xl font-bold text-gray-800 mb-4">
                  {userData?.name || 'User'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600 text-lg">
                  <p id="userEmail" className="flex flex-col md:flex-row">
                    <span className="font-semibold text-gray-800 md:w-20">Email:</span> 
                    <span className="break-all">{userData?.email || 'Not Set'}</span>
                  </p>
                  <p id="userDOB" className="flex flex-col md:flex-row">
                    <span className="font-semibold text-gray-800 md:w-20">DOB:</span> 
                    <span>{userData?.dob ? new Date(userData.dob).toLocaleDateString() : 'Not Set'}</span>
                  </p>
                  <p id="userPhone" className="flex flex-col md:flex-row">
                    <span className="font-semibold text-gray-800 md:w-20">Phone:</span> 
                    <span>{userData?.phone || 'Not Set'}</span>
                  </p>
                  <p id="userLocation" className="flex flex-col md:flex-row">
                    <span className="font-semibold text-gray-800 md:w-20">Location:</span> 
                    <span>{userData?.location || 'Not Set'}</span>
                  </p>
                  <p id="userVerified" className="md:col-span-2 flex flex-col md:flex-row">
                    <span className="font-semibold text-gray-800 md:w-20">Verified:</span> 
                    <span className={userData?.verified ? 'text-green-600' : 'text-red-600'}>
                      {userData?.verified ? 'Yes' : 'No'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={deleteAccount}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <i className="fas fa-trash mr-2"></i> Delete Account
              </button>
              <button
                onClick={() => toggleModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <i className="fas fa-edit mr-2"></i> Edit Profile
              </button>
            </div>
          </div>

          {/* Secure & Private Tagline */}
          <div className="mt-16 text-center text-lg text-gray-600 font-medium">
            <p className="flex items-center justify-center">
              <i className="fas fa-shield-alt text-green-500 mr-2"></i>
              Your data is secure, encrypted, and never stored without consent.
            </p>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <div
        id="editProfileModal"
        className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${
          modalOpen ? '' : 'hidden'
        }`}
      >
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative m-4">
          <button
            onClick={() => toggleModal(false)}
            className="absolute top-4 right-4 text-gray-500 text-2xl hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Profile</h2>
          <div className="space-y-4">
            <input
              id="modalEditName"
              type="text"
              placeholder="Name"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 placeholder-gray-400 transition"
              value={modalData.name}
              onChange={(e) => setModalData((prev) => ({ ...prev, name: e.target.value }))}
            />
            <input
              id="modalEditEmail"
              type="email"
              placeholder="Email"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 placeholder-gray-400 transition"
              value={modalData.email}
              onChange={(e) => setModalData((prev) => ({ ...prev, email: e.target.value }))}
            />
            <input
              id="modalEditPhone"
              type="tel"
              placeholder="Phone"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 placeholder-gray-400 transition"
              value={modalData.phone}
              onChange={(e) => setModalData((prev) => ({ ...prev, phone: e.target.value }))}
            />
            <input
              id="modalEditDOB"
              type="date"
              placeholder="Date of Birth"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 placeholder-gray-400 transition"
              value={modalData.dob}
              onChange={(e) => setModalData((prev) => ({ ...prev, dob: e.target.value }))}
            />
            <LocationInput
              id="modalEditLocation"
              placeholder="Enter your location..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 placeholder-gray-400 transition"
              value={modalData.location}
              onChange={(e) => setModalData((prev) => ({ ...prev, location: e.target.value }))}
            />
            <input
              id="modalImageUpload"
              type="file"
              accept="image/*"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <button
            onClick={saveProfile}
            className="mt-6 w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <i className="fas fa-save mr-2"></i> Save Changes
          </button>
        </div>
      </div>
      
      <Footer />
      
      <style>{`
        /* Custom styles with hover effects */
        #profileImage {
          transition: all 0.3s ease;
        }

        #profileImage:hover {
          border-color: #6366f1;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        #imageUpload, #modalImageUpload {
          cursor: pointer;
        }

        /* Responsive improvements */
        @media (max-width: 768px) {
          .grid-cols-1 {
            grid-template-columns: 1fr;
          }
          .text-center {
            text-align: center;
          }
          .md\\:text-left {
            text-align: center;
          }
        }

        /* Focus improvements */
        input:focus, button:focus {
          outline: none;
        }

        /* Better hover effects */
        button {
          transition: all 0.3s ease;
        }

        button:hover {
          transform: translateY(-1px);
        }

        /* Modal improvements */
        .fixed {
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;