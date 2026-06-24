import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import HomeScreen from '../screens/home/HomeScreen';
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
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: false,
        tabBarLabelPosition: 'below-icon',
        tabBarIcon: ({ focused, color }) => {
          const cfg = tabConfig[route.name];
          return <Ionicons name={focused ? cfg.activeIcon : cfg.icon} size={focused ? 25 : 24} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 64 + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          height: 54,
          paddingVertical: 3,
          justifyContent: 'center',
        },
        tabBarIconStyle: {
          marginTop: 1,
          marginBottom: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          lineHeight: 13,
          fontWeight: '700',
          marginTop: 1,
          marginBottom: 0,
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
