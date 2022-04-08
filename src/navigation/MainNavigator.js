import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  FriendsScreen,
  HomeScreen,
  PreviousChatDetailScreen,
  PreviousChatsScreen,
  ProfileScreen,
  ReportProfileScreen,
  RoomScreen,
  SearchingScreen,
  ChatRoomSettingsScreen,
  StartALobbyScreen,
  ThirdPartyProfileScreen,
} from '../screens';

const Stack = createStackNavigator();

export const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Home"
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ChatRoomSettings" component={ChatRoomSettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="PreviousChats" component={PreviousChatsScreen} />
      <Stack.Screen name="PreviousChatDetail" component={PreviousChatDetailScreen} />
      <Stack.Screen name="ReportProfile" component={ReportProfileScreen} />

      <Stack.Screen name="Searching" component={SearchingScreen} />
      <Stack.Screen name="StartALobby" component={StartALobbyScreen} />
      <Stack.Screen name="Room" component={RoomScreen} />

      <Stack.Screen name="ThirdPartyProfile" component={ThirdPartyProfileScreen} />
    </Stack.Navigator>
  );
};
