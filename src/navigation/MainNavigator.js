import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import HomeScreen from '../screens/home/HomeScreen';
import { View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import WishlistScreen from '../screens/wishlist/WishlistScreen';
import MyVisitsScreen from '../screens/visits/MyVisitsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import SupportScreen from '../screens/support/SupportScreen';

const Tab = createBottomTabNavigator();

const tabConfig = {
  Home: { icon: 'home', activeIcon: 'home' },
  Support: { icon: 'headset-outline', activeIcon: 'headset' },
  Wishlist: { icon: 'heart-outline', activeIcon: 'heart' },
  Visits: { icon: 'calendar-outline', activeIcon: 'calendar' },
  Profile: { icon: 'person-outline', activeIcon: 'person' },
};

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const cfg = tabConfig[route.name];
          return <Ionicons name={focused ? cfg.activeIcon : cfg.icon} size={22} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 60,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Support" component={SupportScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Visits" component={MyVisitsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
