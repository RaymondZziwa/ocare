import { useRouter } from "expo-router";
import { Home, Pill, User } from "lucide-react-native";
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
      icon: (
        <Home size={20} color={activeTab === "home" ? "#1da250" : "#6b7280"} />
      ),
      label: "Home",
      onPress: () => router.push("/(tabs)" as any),
    },
    {
      id: "refill" as const,
      icon: (
        <Pill
          size={20}
          color={activeTab === "refill" ? "#1da250" : "#6b7280"}
        />
      ),
      label: "Refill",
      onPress: () => router.push("/(tabs)/refill" as any),
    },
    {
      id: "profile" as const,
      icon: (
        <User
          size={20}
          color={activeTab === "profile" ? "#1da250" : "#6b7280"}
        />
      ),
      label: "Profile",
      onPress: () => router.push("/(tabs)/profile" as any),
    },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.navItem,
            activeTab === item.id && styles.navItemActive,
          ]}
          onPress={item.onPress}
        >
          {item.icon}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  navItemActive: {
    borderTopWidth: 2,
    borderTopColor: "#1da250",
  },
  navText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginTop: 4,
  },
  navTextActive: {
    color: "#1da250",
  },
});
