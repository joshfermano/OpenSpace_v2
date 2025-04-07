import { useState, useEffect } from 'react';
import { FiUsers, FiFileText, FiHome } from 'react-icons/fi';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Component imports
import DashboardSummary from '../../components/Admin/DashboardSummary';
import UserManagement from '../../components/Admin/UserManagement';
import VerificationRequests from '../../components/Admin/VerificationRequests';
import RoomApprovals from '../../components/Admin/RoomApprovals';
import AdminModal from '../../components/Admin/AdminModal';

// Types and mock data
import {
  MOCK_USERS,
  MOCK_VERIFICATION_REQUESTS,
  MOCK_ROOMS,
} from '../../config/Admin/mockData';
import { Room } from '../../config/Admin/roomApproval';

// Types for actions and preview data
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
  data?: Room;
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

  // Filtered data states
  const [filteredUsers, setFilteredUsers] = useState(MOCK_USERS);
  const [filteredVerifications, setFilteredVerifications] = useState(
    MOCK_VERIFICATION_REQUESTS
  );
  const [filteredRooms, setFilteredRooms] = useState(MOCK_ROOMS);

  // Handle search filtering
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(MOCK_USERS);
      setFilteredVerifications(MOCK_VERIFICATION_REQUESTS);
      setFilteredRooms(MOCK_ROOMS);
      return;
    }

    const search = searchTerm.toLowerCase();

    switch (activeTab) {
      case 'rooms':
        setFilteredRooms(
          MOCK_ROOMS.filter(
            (room) =>
              room.name.toLowerCase().includes(search) ||
              room.location.toLowerCase().includes(search) ||
              room.category.toLowerCase().includes(search)
          )
        );
        break;
      case 'verifications':
        setFilteredVerifications(
          MOCK_VERIFICATION_REQUESTS.filter(
            (request) =>
              request.userName.toLowerCase().includes(search) ||
              request.userEmail.toLowerCase().includes(search)
          )
        );
        break;
      case 'users':
        setFilteredUsers(
          MOCK_USERS.filter(
            (user) =>
              user.name.toLowerCase().includes(search) ||
              user.email.toLowerCase().includes(search) ||
              user.role.toLowerCase().includes(search)
          )
        );
        break;
    }
  }, [searchTerm, activeTab]);

  // Summary calculations
  const summaryData = {
    totalUsers: MOCK_USERS.length,
    verifiedUsers: MOCK_USERS.filter((u) => u.status === 'verified').length,
    bannedUsers: MOCK_USERS.filter((u) => u.status === 'banned').length,
    pendingVerifications: MOCK_VERIFICATION_REQUESTS.filter(
      (v) => v.status === 'pending'
    ).length,
    totalSpaces: MOCK_ROOMS.filter((r) => r.status === 'approved').length,
    hostCount: new Set(MOCK_ROOMS.map((r) => r.hostId)).size,
  };

  // Tab configuration
  const tabs = [
    { id: 'rooms' as const, label: 'Room Approvals', icon: FiHome },
    { id: 'verifications' as const, label: 'Verifications', icon: FiFileText },
    { id: 'users' as const, label: 'Users', icon: FiUsers },
  ];

  // Handle action confirmations
  const handleConfirmAction = (action: Action) => {
    // Implement your action handlers here
    console.log('Handling action:', action);

    switch (action.type) {
      case 'approveRoom':
        // Handle room approval
        setFilteredRooms((rooms) =>
          rooms.map((room) =>
            room.id === action.id ? { ...room, status: 'approved' } : room
          )
        );
        break;
      case 'rejectRoom':
        // Handle room rejection
        setFilteredRooms((rooms) =>
          rooms.map((room) =>
            room.id === action.id ? { ...room, status: 'rejected' } : room
          )
        );
        break;
      case 'approveVerification':
        // Handle verification approval
        setFilteredVerifications((verifications) =>
          verifications.map((v) =>
            v.id === action.id ? { ...v, status: 'approved' } : v
          )
        );
        break;
      case 'rejectVerification':
        // Handle verification rejection
        setFilteredVerifications((verifications) =>
          verifications.map((v) =>
            v.id === action.id ? { ...v, status: 'rejected' } : v
          )
        );
        break;
      case 'banUser':
        // Handle user ban
        setFilteredUsers((users) =>
          users.map((user) =>
            user.id === action.id ? { ...user, status: 'banned' } : user
          )
        );
        break;
      case 'deleteUser':
        // Handle user deletion
        setFilteredUsers((users) =>
          users.filter((user) => user.id !== action.id)
        );
        break;
    }

    setConfirmAction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
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
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors
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
              />
            )}
            {activeTab === 'verifications' && (
              <VerificationRequests
                requests={filteredVerifications}
                statusConfig={verificationStatusConfig}
                onViewDocument={(url, userName) =>
                  setPreviewData({ type: 'document', url, userName })
                }
                onApproveRequest={(requestId) =>
                  setConfirmAction({
                    type: 'approveVerification',
                    id: requestId,
                  })
                }
                onRejectRequest={(requestId) =>
                  setConfirmAction({
                    type: 'rejectVerification',
                    id: requestId,
                  })
                }
              />
            )}
            {activeTab === 'users' && (
              <UserManagement
                users={filteredUsers}
                statusConfig={userStatusConfig}
                verificationConfig={verificationStatusConfig}
                onViewDocument={(url, userName) =>
                  setPreviewData({ type: 'document', url, userName })
                }
                onBanUser={(userId, userName) =>
                  setConfirmAction({ type: 'banUser', id: userId, userName })
                }
                onDeleteUser={(userId, userName) =>
                  setConfirmAction({ type: 'deleteUser', id: userId, userName })
                }
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
              {previewData.data.images.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Room preview ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">
                  Location:
                </span>{' '}
                {previewData.data.location}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">
                  Category:
                </span>{' '}
                {previewData.data.category}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">
                  Price:
                </span>{' '}
                ₱{Number(previewData.data.price).toLocaleString()}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">
                  Capacity:
                </span>{' '}
                {previewData.data.capacity} people
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">
                  Description:
                </span>{' '}
                {previewData.data.description}
              </p>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">
                  Amenities:
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {previewData.data.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          previewData?.type === 'document' && (
            <div className="flex justify-center">
              <img
                src={previewData.url}
                alt="ID Document"
                className="max-w-full h-auto rounded-lg"
              />
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
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              Cancel
            </button>
            <button
              onClick={() =>
                confirmAction && handleConfirmAction(confirmAction)
              }
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
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
