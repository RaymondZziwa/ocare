import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiCamera, FiSave, FiX, FiSettings, FiBell, FiDatabase, FiShield, FiGlobe } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { fetchDataSuccess } from '../../redux/slices/auth/userAuthSlice';
import { apiRequest, baseURL } from '../../libs/apiConfig';
import { toast } from 'sonner';
import axios from 'axios';
import { EmployeeEndpoints } from '../humanResource/employee';
import DisableAccountConfirmationModal from './disableAccountConfirmationModal';
import { useNavigate } from 'react-router-dom';

const EmployeeProfile = () => {
  const dispatch = useDispatch()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const employee = useSelector((state: RootState) => state.userAuth.data)
    
  const disableAccount = async () => { 
    try {
      await apiRequest(EmployeeEndpoints.EMPLOYEE_PROFILE.DISABLE(employee.id), 'PUT');
      setIsModalOpen(false);
      navigate('/')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to disable account');
    }
  }

  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    email: employee.email || '',
    tel: employee.tel || '',
    password: '',
    profileImage: employee.profileImage || ''
  });
  const [previewImage, setPreviewImage] = useState(employee.profileImage || '');
  const [settings, setSettings] = useState({
    systemEmails: false,
    autoSave: false,
    language: 'en',
    theme: 'light',
    dataRetention: 30,
    twoFactorAuth: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewImage(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      const { data } = await axios.post(
        `${baseURL}/api/employees/upload-profile-picture/${employee.id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: ''
          }
        }
      );

      if (data?.updatedEmployee) {
        console.log('Upload response:', data);
        dispatch(fetchDataSuccess(data.updatedEmployee));
        toast.success('Profile picture updated successfully');
      } else {
        toast.success('Profile picture updated');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    apiRequest(EmployeeEndpoints.EMPLOYEE_PROFILE.UPDATE_PROFILE(employee.id), 'PUT', '', formData)
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      email: employee.email || '',
      tel: employee.tel || '',
      password: '',
      profileImage: employee.profileImage || ''
    });
    setPreviewImage(employee.profileImage || '');
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-700 py-4 px-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Employee Profile & Settings</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded-lg ${activeTab === 'profile' ? 'bg-gray-600 text-white' : 'bg-gray-500 text-gray-200'}`}
            onClick={() => setActiveTab('profile')}
          >
            <FiUser className="inline mr-2" /> Profile
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${activeTab === 'settings' ? 'bg-gray-600 text-white' : 'bg-gray-500 text-gray-200'}`}
            onClick={() => setActiveTab('settings')}
          >
            <FiSettings className="inline mr-2" /> Settings
          </button>
        </div>
      </div>
      
      {activeTab === 'profile' ? (
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image Section */}
            <div className="md:w-1/3 flex flex-col items-center">
              <div className="relative mb-4">
                <img
                  src={
                    previewImage
                      ? previewImage.startsWith('blob:')
                        ? previewImage // it's a local preview
                        : `${baseURL|| ''}${previewImage}` // backend URL
                      : "https://cdn-icons-png.flaticon.com/512/847/847969.png" // fallback icon
                  }
                  alt="Profile"
                  className="w-48 h-48 rounded-full object-cover border-4 border-gray-200"
                />

                {isEditing && (
                  <label htmlFor="image-upload" className="absolute bottom-2 right-2 bg-gray-700 rounded-full p-2 cursor-pointer">
                    <FiCamera className="h-5 w-5 text-white" />
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
                
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800">{employee.firstName} {employee.lastName}</h3>
              <p className="text-gray-600">{employee.role?.name}</p>
              <p className="text-gray-600">{employee.dept?.name}, {employee.branch?.name}</p>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            {/* Profile Information Section */}
            <div className="md:w-2/3">
                <span className='text-sm italic text-gray-400'>*Profile Changes will reflect on your next login*</span>
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Personal Information</h3>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        value={employee.firstName}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-gray-500 focus:ring-gray-500 p-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        value={employee.lastName}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-gray-500 focus:ring-gray-500 p-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <input
                        type="text"
                        value={employee.gender}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-gray-500 focus:ring-gray-500 p-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Salary</label>
                      <input
                        type="text"
                        value={`UGX ${employee.salary}`}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-gray-500 focus:ring-gray-500 p-2"
                      />
                    </div>
                    
                    <div className="col-span-2 mt-4">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Editable Information</h3>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="block w-full pl-10 rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500 p-2"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiPhone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="tel"
                          value={formData.tel}
                          onChange={handleInputChange}
                          className="block w-full pl-10 rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500 p-2"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Password</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="block w-full pl-10 rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500 p-2"
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FiX className="mr-2" /> Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center"
                    >
                      <FiSave className="mr-2" /> Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                  <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <FiUser className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="text-gray-800">{employee.firstName} {employee.lastName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-5 w-5 text-gray-400 mr-2"></div>
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="text-gray-800">{employee.gender}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FiMail className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-800">{employee.email || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FiPhone className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="text-gray-800">{employee.tel}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-5 w-5 text-gray-400 mr-2"></div>
                      <div>
                        <p className="text-sm text-gray-500">Salary</p>
                        <p className="text-gray-800">UGX {employee.salary}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-5 w-5 text-gray-400 mr-2"></div>
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="text-gray-800">{employee.dept?.name || 'Not assigned'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-5 w-5 text-gray-400 mr-2"></div>
                      <div>
                        <p className="text-sm text-gray-500">Branch</p>
                        <p className="text-gray-800">{employee.branch?.name || 'Not assigned'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-5 w-5 text-gray-400 mr-2"></div>
                      <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="text-gray-800">{employee.role?.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">System Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notification Settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <FiBell className="h-5 w-5 text-gray-700 mr-2" />
                <h4 className="text-lg font-medium text-gray-800">Notification Settings</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="systemEmails" className="text-gray-700">Enable System Emails</label>
                  <div className="relative inline-block w-12 h-6">
                    <input
                      id="systemEmails"
                      name="systemEmails"
                      type="checkbox"
                      checked={settings.systemEmails}
                      onChange={handleSettingsChange}
                      className="opacity-0 w-0 h-0"
                    />
                    <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${settings.systemEmails ? 'bg-gray-700' : 'bg-gray-300'}`}></span>
                    <span className={`absolute h-4 w-4 top-1 rounded-full bg-white transition-transform ${settings.systemEmails ? 'left-7' : 'left-1'}`}></span>
                  </div>
                </div>
                
                {/* <div className="flex items-center justify-between">
                  <label htmlFor="autoSave" className="text-gray-700">Auto-Save Changes</label>
                  <div className="relative inline-block w-12 h-6">
                    <input
                      id="autoSave"
                      name="autoSave"
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={handleSettingsChange}
                      className="opacity-0 w-0 h-0"
                    />
                    <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${settings.autoSave ? 'bg-gray-700' : 'bg-gray-300'}`}></span>
                    <span className={`absolute h-4 w-4 top-1 rounded-full bg-white transition-transform ${settings.autoSave ? 'left-7' : 'left-1'}`}></span>
                  </div>
                </div> */}
              </div>
            </div>
            
            {/* Security Settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <FiShield className="h-5 w-5 text-gray-700 mr-2" />
                <h4 className="text-lg font-medium text-gray-800">Security Settings</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="twoFactorAuth" className="text-gray-700">Two-Factor Authentication</label>
                  <div className="relative inline-block w-12 h-6">
                    <input
                      id="twoFactorAuth"
                      name="twoFactorAuth"
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={handleSettingsChange}
                      className="opacity-0 w-0 h-0"
                    />
                    <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${settings.twoFactorAuth ? 'bg-gray-700' : 'bg-gray-300'}`}></span>
                    <span className={`absolute h-4 w-4 top-1 rounded-full bg-white transition-transform ${settings.twoFactorAuth ? 'left-7' : 'left-1'}`}></span>
                  </div>
                </div>
                
                {/* <div className="flex items-center justify-between">
                  <label htmlFor="dataRetention" className="text-gray-700">Data Retention (days)</label>
                  <select
                    id="dataRetention"
                    name="dataRetention"
                    value={settings.dataRetention}
                    onChange={handleSettingsChange}
                    className="rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 p-1"
                  >
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={365}>1 year</option>
                  </select>
                </div> */}
              </div>
            </div>
            
            {/* Appearance Settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <FiGlobe className="h-5 w-5 text-gray-700 mr-2" />
                <h4 className="text-lg font-medium text-gray-800">Appearance & Language</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    id="language"
                    name="language"
                    value={settings.language}
                      onChange={handleSettingsChange}
                      disabled
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 p-2"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                  <select
                    id="theme"
                    name="theme"
                      value={settings.theme}
                      disabled
                    onChange={handleSettingsChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 p-2"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Data Management */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <FiDatabase className="h-5 w-5 text-gray-700 mr-2" />
                <h4 className="text-lg font-medium text-gray-800">Data Management</h4>
              </div>
              
              <div className="space-y-4">
                {/* <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors">
                  Export Data
                </button> */}

                <button className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-md transition-colors" onClick={() => setIsModalOpen(true)}>
                  Disable Account
                </button>
              </div>
            </div>
          </div>
          
          {/* <div className="mt-6 flex justify-end">
            <button className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center">
              <FiSave className="mr-2" /> Save Settings
            </button>
          </div> */}
        </div>
      )}
       <DisableAccountConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={disableAccount}
        userName={employee.firstName + ' ' + employee.lastName}
        userEmail={employee.email}
      />
    </div>
  );
};

export default EmployeeProfile;