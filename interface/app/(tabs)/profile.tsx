import { useRouter } from "expo-router";
import {
    ChevronRight,
    Edit,
    FileText,
    LogOut,
    Package,
    Settings,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import BottomNavigation from "../../components/BottomNavigation";
import CustomModal from "../../components/CustomModal";
import { RootState } from "../../redux/store";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Get user data from Redux store
  const userAuth = useSelector((state: RootState) => state.userAuth);
  const { data: userData } = userAuth;

  // Format member since date
  const memberSince = userData.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  // Generate member ID from user ID
  const memberId = userData.id ? `MEM-${userData.id}` : "MEM-000000";

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing feature coming soon!");
  };

  const handlePrivacy = () => {
    router.push("/profile/privacy" as any);
  };

  const handleSecurity = () => {
    router.push("/profile/security" as any);
  };

  const handlePrescriptions = () => {
    router.push("/profile/prescriptions" as any);
  };

  const handleOrderHistory = () => {
    router.push("/profile/orders" as any);
  };

  const handleCamera = () => {
    Alert.alert("Change Photo", "Camera feature coming soon!");
  };

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = () => {
    dispatch(logout());
    router.replace("/auth/sign-in");
  };

  const menuItems = [
    {
      icon: <Settings size={20} color="#6b7280" />,
      title: "Privacy & Security",
      subtitle: "Manage your privacy settings",
      onPress: handlePrivacy,
    },
    {
      icon: <Package size={20} color="#6b7280" />,
      title: "Order History",
      subtitle: "View your past orders",
      onPress: handleOrderHistory,
    },
    {
      icon: <FileText size={20} color="#6b7280" />,
      title: "Past Prescriptions",
      subtitle: "View your prescription history",
      onPress: handlePrescriptions,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {userData.fullName || "Guest User"}
              </Text>
              <Text style={styles.memberInfo}>Member ID: {memberId}</Text>
              <Text style={styles.memberInfo}>Member since: {memberSince}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Edit size={16} color="#1da250" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>
              {userData.fullName || "Not provided"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>
              {userData.email || "Not provided"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>
              {userData.phone || "Not provided"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{memberSince}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuIcon}>{item.icon}</View>
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#ffffff" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomModal
        visible={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={confirmSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        type="destructive"
      />

      <BottomNavigation activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#f8fafc",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  imageContainer: {
    position: "relative",
    marginRight: 16,
  },
  imageButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1da250",
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  memberInfo: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  editButtonText: {
    color: "#1da250",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  infoSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "400",
    flex: 2,
    textAlign: "right",
  },
  menuSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 10,
    width: "80%",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 8,
  },
});
