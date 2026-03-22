import { useState, useEffect } from 'react';
import { getUserProfile, deleteUserAccount, updateUserProfile } from '../api';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await getUserProfile();
        if (result.success) {
          setUserData(result.data);
          setFormData(result.data);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await updateUserProfile(formData);
      if (result.success) {
        setUserData(formData);
        setIsEditing(false);
      }
    } catch (err) { alert('Update failed'); }
  };

  if (loading) return <div className="text-center py-20 text-[#666] font-bold uppercase tracking-widest">LOADING PROFILE...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-[#666] font-medium mt-1">Manage your profile and security preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="cashmate-card text-center p-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border-2 border-[var(--accent-secondary)] mx-auto mb-6 flex items-center justify-center overflow-hidden">
              <img src={userData?.image || `https://ui-avatars.com/api/?name=${userData?.name || 'User'}&background=random`} alt="Profile" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1 uppercase tracking-tight">{userData?.name}</h2>
            <p className="text-[10px] font-black text-[#4D4D4D] tracking-widest uppercase mb-6">MEMBER SINCE 2024</p>

            <div className="flex flex-col gap-2">
              <button className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#252525] transition-all">
                CHANGE AVATAR
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full bg-white text-black py-3 rounded-xl text-xs font-bold hover:scale-105 transition-all"
              >
                {isEditing ? 'CANCEL EDIT' : 'EDIT PROFILE'}
              </button>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="lg:col-span-2">
          <div className="cashmate-card p-8">
            <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-8">Personal Details</h3>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'FULL NAME', key: 'name', type: 'text' },
                { label: 'EMAIL ADDRESS', key: 'email', type: 'email' },
                { label: 'PHONE NUMBER', key: 'phone', type: 'tel' },
                { label: 'LOCATION', key: 'location', type: 'text' },
              ].map(field => (
                <div key={field.key} className="space-y-2">
                  <label className="text-[10px] font-black text-[#4D4D4D] tracking-[0.2em]">{field.label}</label>
                  <input
                    type={field.type}
                    disabled={!isEditing}
                    className="w-full bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl py-3 px-4 text-sm text-white focus:border-[var(--accent-primary)] outline-none transition-all disabled:opacity-50"
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  />
                </div>
              ))}

              {isEditing && (
                <div className="md:col-span-2 pt-4">
                  <button type="submit" className="bg-[var(--accent-secondary)] text-black px-10 py-3 rounded-xl font-black text-xs hover:scale-105 transition-all">
                    SAVE CHANGES
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="mt-8">
            <div className="cashmate-card border-red-500/20 bg-red-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-red-500 tracking-widest uppercase">Danger Zone</h4>
                  <p className="text-xs text-[#666] font-medium mt-1">Once you delete your account, there is no going back.</p>
                </div>
                <button
                  onClick={deleteUserAccount}
                  className="text-[10px] font-black text-red-500 border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                  DELETE ACCOUNT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;