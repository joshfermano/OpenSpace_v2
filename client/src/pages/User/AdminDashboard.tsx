import { useState, useEffect } from 'react';
import { FiUsers, FiFileText, FiHome } from 'react-icons/fi';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/adminApi';

import DashboardSummary from '../../components/Admin/DashboardSummary';
import UserManagement from '../../components/Admin/UserManagement';
import VerificationRequests from '../../components/Admin/VerificationRequests';
import RoomApprovals from '../../components/Admin/RoomApprovals';
import AdminModal from '../../components/Admin/AdminModal';

type ActionType =
  | 'approveRoom'
  | 'rejectRoom'
  | 'approveVerification'
  | 'rejectVerification'
  | 'banUser'
  | 'deleteUser';

interface Action {
  type: ActionType;
  id: string;
  userName?: string;
}

interface PreviewData {
  type: 'room' | 'document';
  data?: any;
  url?: string;
  userName?: string;
}

// Status configurations
const userStatusConfig = {
  active: {
    label: 'Active',
    color:
      'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  },
  verified: {
    label: 'Verified',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  },
  banned: {
    label: 'Banned',
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  },
};

const verificationStatusConfig = {
  approved: {
    label: 'Approved',
    color:
      'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  },
  pending: {
    label: 'Pending',
    color:
      'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  },
  not_submitted: {
    label: 'Not Submitted',
    color: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400',
  },
};

const AdminDashboard = () => {
  // Authentication check
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // If not authenticated or not admin, redirect to home
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // States
  const [activeTab, setActiveTab] = useState<
    'rooms' | 'verifications' | 'users'
  >('rooms');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [confirmAction, setConfirmAction] = useState<Action | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);

  // Dashboard summary
  const [summaryData, setSummaryData] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    bannedUsers: 0,
    pendingVerifications: 0,
    totalSpaces: 0,
    hostCount: 0,
  });

  // Fetch data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch dashboard summary
        console.log('Fetching dashboard summary...');
        const summaryResponse = await adminApi.getDashboardSummary();
        console.log('Dashboard summary response:', summaryResponse);

        if (summaryResponse.success && summaryResponse.data) {
          const data = summaryResponse.data;
          setSummaryData({
            totalUsers: data.totalUsers || 0,
            verifiedUsers: data.verifiedUsers || 0,
            bannedUsers: data.bannedUsers || 0,
            pendingVerifications: data.pendingVerifications || 0,
            totalSpaces: data.totalSpaces || 0,
            hostCount: data.hostCount || 0,
          });
          console.log('Dashboard summary updated successfully:', data);
        } else {
          console.error(
            'Failed to load dashboard summary:',
            summaryResponse.message
          );
        }

        // Fetch users
        console.log('Fetching users...');
        const usersResponse = await adminApi.getUsers();
        if (usersResponse.success) {
          const formattedUsers = usersResponse.data.map((user: any) => ({
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            status: user.active === false ? 'banned' : 'active',
            joinDate: user.createdAt,
            verificationStatus:
              user.identificationDocument?.verificationStatus ||
              'not_submitted',
            idType: user.identificationDocument?.idType || '',
            documentUrl: user.identificationDocument?.idImage || '',
            imageUrl: user.profileImage,
            rooms: user.rooms?.length || 0,
          }));

          setUsers(formattedUsers);
          setFilteredUsers(formattedUsers);
          console.log('Users loaded:', formattedUsers.length);
        }

        // Fetch pending ID verifications - Filter out admin users
        console.log('Fetching ID verifications...');
        const verificationsResponse =
          await adminApi.getPendingIdVerifications();
        if (verificationsResponse.success) {
          const formattedVerifications = verificationsResponse.data
            .filter((verification: any) => verification.role !== 'admin')
            .map((verification: any) => ({
              id: verification._id,
              userId: verification._id,
              userName: `${verification.firstName} ${verification.lastName}`,
              userEmail: verification.email,
              idType: verification.identificationDocument?.idType || 'Unknown',
              submissionDate:
                verification.identificationDocument?.uploadDate ||
                new Date().toISOString(),
              status:
                verification.identificationDocument?.verificationStatus ||
                'pending',
              documentUrl: verification.identificationDocument?.idImage || '',
              imageUrl: verification.profileImage,
            }));

          setVerifications(formattedVerifications);
          setFilteredVerifications(formattedVerifications);
          console.log('Verifications loaded:', formattedVerifications.length);
        }

        // Fetch pending room approvals
        console.log('Fetching room approvals...');
        const roomsResponse = await adminApi.getPendingRoomApprovals();
        if (roomsResponse.success) {
          const formattedRooms = roomsResponse.data.map((room: any) => ({
            id: room._id,
            name: room.title,
            location: room.location.city + ', ' + room.location.state,
            category: room.category,
            price: room.pricing.hourlyRate,
            capacity: room.capacity,
            description: room.description,
            amenities: room.amenities,
            images: room.images.map((img: string) =>
              img.startsWith('http')
                ? img
                : `${import.meta.env.VITE_API_URL || ''}${img}`
            ),
            hostId: room.host._id,
            hostName: `${room.host.firstName} ${room.host.lastName}`,
            hostImage: room.host.profileImage,
            createdAt: room.createdAt,
            status: room.status,
          }));
          setRooms(formattedRooms);
          setFilteredRooms(formattedRooms);
          console.log('Rooms loaded:', formattedRooms.length);
        }
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
      setFilteredVerifications(verifications);
      setFilteredRooms(rooms);
      return;
    }

    const search = searchTerm.toLowerCase();

    switch (activeTab) {
      case 'rooms':
        setFilteredRooms(
          rooms.filter(
            (room) =>
              room.name.toLowerCase().includes(search) ||
              room.location.toLowerCase().includes(search) ||
              room.category.toLowerCase().includes(search)
          )
        );
        break;
      case 'verifications':
        setFilteredVerifications(
          verifications.filter(
            (request) =>
              request.userName.toLowerCase().includes(search) ||
              request.userEmail.toLowerCase().includes(search)
          )
        );
        break;
      case 'users':
        setFilteredUsers(
          users.filter(
            (user) =>
              user.name.toLowerCase().includes(search) ||
              user.email.toLowerCase().includes(search) ||
              user.role.toLowerCase().includes(search)
          )
        );
        break;
    }
  }, [searchTerm, activeTab, users, verifications, rooms]);

  const tabs = [
    { id: 'rooms' as const, label: 'Room Approvals', icon: FiHome },
    { id: 'verifications' as const, label: 'Verifications', icon: FiFileText },
    { id: 'users' as const, label: 'Users', icon: FiUsers },
  ];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
    const parent = e.currentTarget.parentElement;

    if (parent) {
      const iconDiv = document.createElement('div');
      iconDiv.className =
        'flex items-center justify-center h-full w-full text-gray-500';

      const parentHeight = parent.clientHeight;
      const iconSize = Math.floor(parentHeight * 0.6);

      iconDiv.innerHTML = `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="${iconSize}" width="${iconSize}" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

      parent.appendChild(iconDiv);
    }
  };

  const handleConfirmAction = async (action: Action) => {
    try {
      switch (action.type) {
        case 'approveRoom':
          // Handle room approval
          const approveResponse = await adminApi.approveRoom(action.id, true);
          if (approveResponse.success) {
            setRooms((prevRooms) =>
              prevRooms.map((room) =>
                room.id === action.id ? { ...room, status: 'approved' } : room
              )
            );
            setFilteredRooms((prevRooms) =>
              prevRooms.map((room) =>
                room.id === action.id ? { ...room, status: 'approved' } : room
              )
            );
          }
          break;
        case 'rejectRoom':
          // Handle room rejection
          const rejectResponse = await adminApi.approveRoom(
            action.id,
            false,
            'Does not meet platform standards'
          );
          if (rejectResponse.success) {
            setRooms((prevRooms) =>
              prevRooms.map((room) =>
                room.id === action.id ? { ...room, status: 'rejected' } : room
              )
            );
            setFilteredRooms((prevRooms) =>
              prevRooms.map((room) =>
                room.id === action.id ? { ...room, status: 'rejected' } : room
              )
            );
          }
          break;
        case 'approveVerification':
          // Handle verification approval
          const verifyResponse = await adminApi.verifyUserIdDocument(
            action.id,
            {
              isApproved: true,
            }
          );
          if (verifyResponse.success) {
            setVerifications((prevVerifications) =>
              prevVerifications.map((v) =>
                v.userId === action.id ? { ...v, status: 'approved' } : v
              )
            );
            setFilteredVerifications((prevVerifications) =>
              prevVerifications.map((v) =>
                v.userId === action.id ? { ...v, status: 'approved' } : v
              )
            );
          }
          break;
        case 'rejectVerification':
          // Handle verification rejection
          const rejectVerifyResponse = await adminApi.verifyUserIdDocument(
            action.id,
            {
              isApproved: false,
              rejectionReason:
                'Document does not meet verification requirements',
            }
          );
          if (rejectVerifyResponse.success) {
            setVerifications((prevVerifications) =>
              prevVerifications.map((v) =>
                v.userId === action.id ? { ...v, status: 'rejected' } : v
              )
            );
            setFilteredVerifications((prevVerifications) =>
              prevVerifications.map((v) =>
                v.userId === action.id ? { ...v, status: 'rejected' } : v
              )
            );
          }
          break;
        case 'banUser':
          // Handle user ban
          const banResponse = await adminApi.banUser(action.id);
          if (banResponse.success) {
            setUsers((prevUsers) =>
              prevUsers.map((user) =>
                user.id === action.id ? { ...user, status: 'banned' } : user
              )
            );
            setFilteredUsers((prevUsers) =>
              prevUsers.map((user) =>
                user.id === action.id ? { ...user, status: 'banned' } : user
              )
            );
          }
          break;
        case 'deleteUser':
          // Handle user deletion
          const deleteResponse = await adminApi.deleteUser(action.id);
          if (deleteResponse.success) {
            setUsers((prevUsers) =>
              prevUsers.filter((user) => user.id !== action.id)
            );
            setFilteredUsers((prevUsers) =>
              prevUsers.filter((user) => user.id !== action.id)
            );
          }
          break;
      }
    } catch (error) {
      console.error(`Error handling action ${action.type}:`, error);
    } finally {
      setConfirmAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBlue flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-600 dark:text-gray-300">
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-light">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-light/80 mt-1">
              Manage spaces, users, and verification requests
            </p>
          </div>

          {/* Summary Cards */}
          <DashboardSummary {...summaryData} />

          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 text-xs md:text-sm font-medium transition-colors
                  ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}>
                <tab.icon className="mr-2" size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 
                focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            />
          </div>

          {/* Content Area */}
          <div className="mt-6">
            {activeTab === 'rooms' && (
              <RoomApprovals
                rooms={filteredRooms}
                onViewRoom={(room) =>
                  setPreviewData({ type: 'room', data: room })
                }
                onApproveRoom={(roomId) =>
                  setConfirmAction({ type: 'approveRoom', id: roomId })
                }
                onRejectRoom={(roomId) =>
                  setConfirmAction({ type: 'rejectRoom', id: roomId })
                }
                onImageError={handleImageError}
              />
            )}
            {activeTab === 'verifications' && (
              <VerificationRequests
                requests={filteredVerifications}
                statusConfig={verificationStatusConfig}
                onViewDocument={(url, userName) => {
                  console.log('Viewing verification document with URL:', url);
                  setPreviewData({ type: 'document', url, userName });
                }}
                onApproveRequest={(_, userId) =>
                  setConfirmAction({
                    type: 'approveVerification',
                    id: userId,
                  })
                }
                onRejectRequest={(_, userId) =>
                  setConfirmAction({
                    type: 'rejectVerification',
                    id: userId,
                  })
                }
                onImageError={handleImageError}
              />
            )}
            {activeTab === 'users' && (
              <UserManagement
                users={filteredUsers}
                statusConfig={userStatusConfig}
                verificationConfig={verificationStatusConfig}
                onViewDocument={(url, userName) => {
                  console.log('Viewing document with URL:', url);
                  setPreviewData({ type: 'document', url, userName });
                }}
                onBanUser={(userId, userName) =>
                  setConfirmAction({ type: 'banUser', id: userId, userName })
                }
                onDeleteUser={(userId, userName) =>
                  setConfirmAction({ type: 'deleteUser', id: userId, userName })
                }
                onImageError={handleImageError}
              />
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AdminModal
        isOpen={!!previewData}
        title={
          previewData?.type === 'room'
            ? `Room Details - ${previewData.data?.name}`
            : `ID Document - ${previewData?.userName}`
        }
        onClose={() => setPreviewData(null)}
        footerContent={
          <button
            onClick={() => setPreviewData(null)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Close
          </button>
        }>
        {previewData?.type === 'room' && previewData.data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {previewData.data.images.map((url: string, index: number) => (
                <img
                  key={index}
                  src={url}
                  alt={`Room preview ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={handleImageError}
                />
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-light/80">
                <span className="font-medium text-gray-900 dark:text-light">
                  Location:
                </span>{' '}
                {previewData.data.location}
              </p>
              <p className="text-gray-600 dark:text-light/80">
                <span className="font-medium text-gray-900 dark:text-light">
                  Category:
                </span>{' '}
                {previewData.data.category}
              </p>
              <p className="text-gray-600 dark:text-light/80">
                <span className="font-medium text-gray-900 dark:text-light">
                  Price:
                </span>{' '}
                ₱{Number(previewData.data.price).toLocaleString()}
              </p>
              <p className="text-gray-600 dark:text-light/80">
                <span className="font-medium text-gray-900 dark:text-light">
                  Capacity:
                </span>{' '}
                {previewData.data.capacity} people
              </p>
              <p className="text-gray-600 dark:text-light/80">
                <span className="font-medium text-gray-900 dark:text-light">
                  Description:
                </span>{' '}
                {previewData.data.description}
              </p>
              <div>
                <span className="font-medium text-gray-900 dark:text-light">
                  Amenities:
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {previewData.data.amenities.map((amenity: string) => (
                    <span
                      key={amenity}
                      className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-light/80 rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          previewData?.type === 'document' && (
            <div className="flex flex-col items-center">
              <p className="mb-4 text-gray-700 dark:text-light">
                Document provided by {previewData.userName}
              </p>
              {previewData.url ? (
                <>
                  <img
                    src={previewData.url}
                    alt="ID Document"
                    className="max-w-full h-auto rounded-lg"
                    onLoad={() =>
                      console.log('Document image loaded successfully')
                    }
                    onError={(e) => {
                      console.error(
                        'Error loading document image:',
                        previewData.url
                      );
                      e.currentTarget.src =
                        '/assets/images/document-placeholder.png';
                    }}
                  />
                  {/* Remove or truncate the URL display to avoid long text */}
                  {!previewData.url.startsWith('data:') && (
                    <p className="mt-4 text-sm text-gray-500 dark:text-light/70 truncate max-w-md">
                      Source: {previewData.url.split('/').pop() || 'Document'}
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-light/70">
                    Document image not available or could not be loaded.
                  </p>
                </div>
              )}
            </div>
          )
        )}
      </AdminModal>

      {/* Confirmation Modal */}
      <AdminModal
        isOpen={!!confirmAction}
        title={
          confirmAction?.type === 'approveRoom'
            ? 'Approve Room Listing'
            : confirmAction?.type === 'rejectRoom'
            ? 'Reject Room Listing'
            : confirmAction?.type === 'approveVerification'
            ? 'Approve Verification'
            : confirmAction?.type === 'rejectVerification'
            ? 'Reject Verification'
            : confirmAction?.type === 'banUser'
            ? 'Ban User'
            : confirmAction?.type === 'deleteUser'
            ? 'Delete User'
            : ''
        }
        onClose={() => setConfirmAction(null)}
        footerContent={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setConfirmAction(null)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-light 
          rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              Cancel
            </button>
            <button
              onClick={() =>
                confirmAction && handleConfirmAction(confirmAction)
              }
              className={`px-4 py-2 text-white dark:text-light rounded-lg transition-colors ${
                [
                  'rejectRoom',
                  'rejectVerification',
                  'banUser',
                  'deleteUser',
                ].includes(confirmAction?.type || '')
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}>
              Confirm
            </button>
          </div>
        }>
        {confirmAction?.type === 'approveRoom'
          ? 'Are you sure you want to approve this room listing? It will be visible to all users.'
          : confirmAction?.type === 'rejectRoom'
          ? 'Are you sure you want to reject this room listing? The host will be notified.'
          : confirmAction?.type === 'approveVerification'
          ? 'Are you sure you want to approve this verification request? The user will be marked as verified.'
          : confirmAction?.type === 'rejectVerification'
          ? 'Are you sure you want to reject this verification request? The user will need to submit new documents.'
          : confirmAction?.type === 'banUser'
          ? `Are you sure you want to ban ${confirmAction.userName}? They will no longer be able to access the platform.`
          : confirmAction?.type === 'deleteUser'
          ? `Are you sure you want to permanently delete ${confirmAction.userName}? This action cannot be undone.`
          : null}
      </AdminModal>
    </div>
  );
};

export default AdminDashboard;
