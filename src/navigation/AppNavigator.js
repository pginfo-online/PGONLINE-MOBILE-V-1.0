import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuthStore from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import PGDetailScreen from '../screens/pg/PGDetailScreen';
import AIChatScreen from '../screens/search/AIChatScreen';
import BookVisitScreen from '../screens/visits/BookVisitScreen';
import SearchScreen from '../screens/search/SearchScreen';
import MeetupDetailScreen from '../screens/meetups/MeetupDetailScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import MyMeetupsScreen from '../screens/profile/MyMeetupsScreen';

const Stack = createNativeStackNavigator();
const stackScreenOptions = {
  headerShown: false,
  gestureEnabled: false,
};

const detailScreenOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  gestureEnabled: true,
};

const modalScreenOptions = {
  headerShown: false,
  animation: 'slide_from_bottom',
  gestureEnabled: true,
};

export default function AppNavigator() {
  const { isAuthenticated, hydrate, _hasHydrated } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!_hasHydrated) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={stackScreenOptions}>
        {isAuthenticated ? (
          <Stack.Group>
            <Stack.Screen
              name="Main"
              component={MainNavigator}
              options={stackScreenOptions}
            />
            <Stack.Screen
              name="SearchDedicated"
              component={SearchScreen}
              options={modalScreenOptions}
            />
            <Stack.Screen
              name="PGDetail"
              component={PGDetailScreen}
              options={detailScreenOptions}
            />
            <Stack.Screen
              name="AIChat"
              component={AIChatScreen}
              options={modalScreenOptions}
            />
            <Stack.Screen
              name="BookVisit"
              component={BookVisitScreen}
              options={detailScreenOptions}
            />
            <Stack.Screen
              name="MeetupDetail"
              component={MeetupDetailScreen}
              options={detailScreenOptions}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
              options={detailScreenOptions}
            />
            <Stack.Screen
              name="Terms"
              component={TermsScreen}
              options={detailScreenOptions}
            />
            <Stack.Screen
              name="MyMeetups"
              component={MyMeetupsScreen}
              options={detailScreenOptions}
            />
          </Stack.Group>
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={stackScreenOptions}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
