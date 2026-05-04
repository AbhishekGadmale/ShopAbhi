import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fetchWithAuth } from "../api/client";
import Breadcrumbs from "../components/Breadcrumbs";

function UserProfile() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Form States
  const [name, setName] = useState(user?.name || "");
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    isDefault: false,
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetchWithAuth("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        addToast("Profile updated successfully");
        refreshUser();
      }
    } catch (err) {
      addToast("Update failed", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth("/api/users/addresses", {
        method: "POST",
        body: JSON.stringify(newAddress),
      });
      if (res.ok) {
        addToast("Address added");
        setShowAddressForm(false);
        setNewAddress({ street: "", city: "", state: "", zipCode: "", country: "India", isDefault: false });
        refreshUser();
      }
    } catch (err) {
      addToast("Failed to add address", "error");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await fetchWithAuth(`/api/users/addresses/${addressId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        addToast("Address deleted");
        refreshUser();
      }
    } catch (err) {
      addToast("Delete failed", "error");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const res = await fetchWithAuth(`/api/users/addresses/${addressId}/default`, {
        method: "PUT",
      });
      if (res.ok) {
        addToast("Default address updated");
        refreshUser();
      }
    } catch (err) {
      addToast("Failed to set default", "error");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 min-h-[70vh]">
      <Breadcrumbs />
      
      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all ${activeTab === "profile" ? "bg-[#febd69] text-[#111]" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
          >
            👤 Profile Details
          </button>
          <button 
            onClick={() => setActiveTab("addresses")}
            className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all ${activeTab === "addresses" ? "bg-[#febd69] text-[#111]" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
          >
            📍 Address Book
          </button>
          <div className="pt-6 mt-6 border-t border-white/10">
            <p className="px-6 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Account Stats</p>
            <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-gray-400 text-xs">Joined On</p>
              <p className="text-white font-bold">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow bg-[#1a1a1a] rounded-3xl border border-white/5 p-8 md:p-12">
          {activeTab === "profile" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-white mb-8">Personal Information</h2>
              <form onSubmit={handleUpdateProfile} className="max-w-md space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Full Name</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-white focus:border-[#febd69] outline-none transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Email Address</label>
                  <input 
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-gray-500 mt-2 italic">Email cannot be changed for security reasons.</p>
                </div>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-4 bg-[#febd69] text-[#111] font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-[#febd69]/10"
                >
                  {isUpdating ? "Saving Changes..." : "Update Profile"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Your Saved Addresses</h2>
                <button 
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-sm font-bold text-[#febd69] hover:underline"
                >
                  {showAddressForm ? "✕ Cancel" : "+ Add New Address"}
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="bg-black/30 p-8 rounded-2xl border border-white/5 mb-10 space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Street Address</label>
                      <input 
                        required
                        type="text"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#febd69] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">City</label>
                      <input 
                        required
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#febd69] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">State</label>
                      <input 
                        required
                        type="text"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#febd69] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Zip Code</label>
                      <input 
                        required
                        type="text"
                        value={newAddress.zipCode}
                        onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#febd69] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Country</label>
                      <input 
                        required
                        type="text"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#febd69] outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="default-check"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                      className="w-4 h-4 accent-[#febd69]"
                    />
                    <label htmlFor="default-check" className="text-sm text-gray-400">Set as default address</label>
                  </div>
                  <button className="w-full py-3 bg-[#febd69] text-[#111] font-bold rounded-xl transition-all active:scale-95">Save Address</button>
                </form>
              )}

              {user.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {user.addresses.map((addr) => (
                    <div key={addr._id} className={`p-6 rounded-2xl border transition-all ${addr.isDefault ? "border-[#febd69] bg-[#febd69]/5 shadow-lg shadow-[#febd69]/5" : "border-white/5 bg-white/5"}`}>
                      <div className="flex justify-between items-start mb-4">
                        {addr.isDefault && <span className="text-[10px] font-bold uppercase bg-[#febd69] text-[#111] px-2 py-1 rounded">Default</span>}
                        <div className="flex gap-4 ml-auto">
                          {!addr.isDefault && (
                            <button onClick={() => handleSetDefault(addr._id)} className="text-[10px] font-bold text-gray-500 hover:text-[#febd69] uppercase tracking-tighter">Set Default</button>
                          )}
                          <button onClick={() => handleDeleteAddress(addr._id)} className="text-[10px] font-bold text-red-500/60 hover:text-red-500 uppercase tracking-tighter">Delete</button>
                        </div>
                      </div>
                      <p className="text-white font-bold mb-1">{user.name}</p>
                      <p className="text-gray-400 text-sm leading-relaxed">{addr.street}</p>
                      <p className="text-gray-400 text-sm leading-relaxed">{addr.city}, {addr.state} {addr.zipCode}</p>
                      <p className="text-gray-400 text-sm leading-relaxed">{addr.country}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-gray-500 italic">No addresses saved yet.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default UserProfile;
