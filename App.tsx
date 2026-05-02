import {ReactDOM, useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, StyleSheet , } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import db from './src/database/db';
import createTables from './src/database/createTables';


// Tab Screens
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';

// Extra Screens
import CreatePlanScreen from './src/screens/CreatePlanScreen';
import StartNowScreen from './src/screens/StartNowScreen';
import ViewPlannedScreen from './src/screens/ViewPlannedScreen';
import ViewDoneScreen from './src/screens/ViewDoneScreen';
import EditScreen from './src/screens/EditScreen';
import TimerScreen from './src/screens/TimerScreen';
import GetLocationScreen from './src/screens/GetLocationScreen';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


// Bottom Tab Navigator
function TabNavigator() {

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,

        tabBarIcon: ({ focused }) => {
          let iconName = '';

          if (route.name === 'Home') iconName = 'home';
          if (route.name === 'Map') iconName = 'map';
          if (route.name === 'Chatbot') iconName = 'smart-toy';

          return (
            <Icon
              name={iconName}
              size={28}
              color={focused ? '#000000' : '#888'}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} />
    </Tab.Navigator>
  );
}


// Main App
export default function App() {

    useEffect(() => {
      createTables();
    }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* Bottom Tabs */}
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
        />

        {/* FAB Navigation Screens */}
        <Stack.Screen
          name="CreatePlan"
          component={CreatePlanScreen}
        />

        <Stack.Screen
          name="StartNow"
          component={StartNowScreen}
        />

        {/*Other */}
        <Stack.Screen name="ViewPlanned" component={ViewPlannedScreen} />
        <Stack.Screen name="ViewDone" component={ViewDoneScreen} />
        <Stack.Screen name="Edit" component={EditScreen} />
        <Stack.Screen name="Timer" component={TimerScreen} />
        <Stack.Screen name="Location" component={GetLocationScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: 15,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    elevation: 8,
    shadowColor: '#676767',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  customButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1b4788',
    elevation: 5,
  },
});