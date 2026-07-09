import { useRouter } from "expo-router";
import { Home, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BottomNavigationProps {
  activeTab: "home" | "refill" | "profile";
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const router = useRouter();

  const navItems = [
    {
      id: "home" as const,
      icon: <Home size={24} color={activeTab === "home" ? "#ffffff" : "#9ca3af"} strokeWidth={2.5} />,
      label: "Home",
      onPress: () => router.push("/(tabs)" as any),
    },
    // {
    //   id: "refill" as const,
    //   icon: <Pill size={24} color={activeTab === "refill" ? "#ffffff" : "#9ca3af"} strokeWidth={2.5} />,
    //   label: "Refill",
    //   onPress: () => router.push("/(tabs)/refill" as any),
    // },
    {
      id: "profile" as const,
      icon: <User size={24} color={activeTab === "profile" ? "#ffffff" : "#9ca3af"} strokeWidth={2.5} />,
      label: "Profile",
      onPress: () => router.push("/(tabs)/profile" as any),
    },
  ];

  return (
    <View style={[styles.container, { paddingBottom: 12 }]}>
      <View style={styles.navBar}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              activeTab === item.id && styles.navItemActive,
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              activeTab === item.id && styles.iconContainerActive
            ]}>
              {item.icon}
            </View>
            <Text
              style={[
                styles.navText,
                activeTab === item.id && styles.navTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderTopWidth: 0,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 5,
  },
  navBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  navItemActive: {},
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  iconContainerActive: {
    backgroundColor: "#1da250",
    shadowColor: "#1da250",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navText: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  navTextActive: {
    color: "#1da250",
    fontWeight: "600",
  },
});
