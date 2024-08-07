import * as React from 'react';
import { AppRegistry, View, ActivityIndicator, StyleSheet, I18nManager } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import i18n from './i18next'; // Make sure this path is correct
import { I18nextProvider } from 'react-i18next';
import RNRestart from 'react-native-restart';
import { name as appName } from './app.json';
import sharedI18UtilInstance from './sharedI18UtilInstance';
//import { fcmService } from './Component/FCMService'; // Import FCMService

// screens
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import AssistanceScreen from './screens/AsistanceScreen';
import ConsultationScreen from './screens/ConsultationScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import MoreScreen from './screens/MoreScreen';
import AdminScreen from './screens/AdminScreen';
import ProfileAdminScreen from './screens/ProfileAdmin';
import ProfileUser from './screens/ProfilUser';

import AddPost from './screens/AddPost';
import ArticleDetail from './screens/ArticleDetail';
import ChatAdmin from './screens/ChatAdmin';
import AnalysisRequestDetail from './screens/AnalysisRequestDetail';
import AssistanceRequestScreen from './screens/AssistanceRequestScreen';
import AssistanceRequestDetail from './screens/AssistanceRequestDetail';
import ConsultationRequestScreen from './screens/ConsultationRequestScreen';
import ConsultationRequestDetail from './screens/ConsultationRequestDetail';
import BottomNavBar from './Component/bottomnavbar';
import ChatList from './screens/ChatAdmin';
import ChatScreen from './screens/chatscreen';
import Request from './screens/Requests';
import PaymentScreen from './screens/payments';
import PriceManagementScreen from './screens/PriceManagementScreen';
import Members from './screens/members';
import MemberDetail from './screens/membersdetails';
import EditAssistance from './screens/EditAssistance';
import EditConsultation from './screens/EditConsultation';
import EditAnalysis from './screens/EditAnalysis';
import AppointmentDetailScreen from './screens/AppointmentDetailScreen';
import AdminSchedulePage from './screens/AdminSchedulePage';
import UserSchedulePage from './screens/UserSchedulePage';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ChangeLanguageScreen from './screens/ChangeLanguageScreen';
import SecurityScreen from './screens/SecurityScreen';
import SubscriptionHistoryScreen from './screens/SubscriptionHistoryScreen';

const Stack = createStackNavigator();

const commonOptions = {
  headerShown: false,
};

export default function App() {
  const [initialRoute, setInitialRoute] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        const isAdmin = JSON.parse(await AsyncStorage.getItem('isAdmin'));

        if (userToken) {
          setInitialRoute(isAdmin ? 'Admin' : 'BottomNavBar');
        } else {
          setInitialRoute('Welcome');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false);
      }
    };

    applyRTL();
    checkLoginStatus();
  }, []);

 /* React.useEffect(() => {
    fcmService.register(
      (token) => {
        console.log("FCM Token:", token);
      },
      (notification) => {
        console.log("FCM Notification:", notification);
        Toast.show({
          type: 'success',
          text1: notification.title,
          text2: notification.body,
        });
      },
      (notification) => {
        console.log("FCM Notification Opened:", notification);
      }
    );

    return () => {
      fcmService.unRegister();
    };
  }, []);
*/
  const applyRTL = async () => {
    const language = await AsyncStorage.getItem('appLanguage') || 'en';
    updateRTLSettings(language === 'ar');
  };

  const updateRTLSettings = (isRTL) => {
    sharedI18UtilInstance.allowRTL(isRTL); // Use your custom RTL utility
    if (isRTL !== I18nManager.isRTL && RNRestart && typeof RNRestart.Restart === 'function') {
      RNRestart.Restart(); // This will restart the app
    }
  };

  i18n.on('languageChanged', (language) => updateRTLSettings(language === 'ar'));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#2E6FF3' />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen name='Welcome' component={WelcomeScreen} options={commonOptions} />
          <Stack.Screen name='Login' component={LoginScreen} options={commonOptions} />
          <Stack.Screen name='Signup' component={SignupScreen} options={commonOptions} />
          <Stack.Screen name='ForgotPassword' component={ForgotPasswordScreen} options={commonOptions} />
          <Stack.Screen name='BottomNavBar' component={BottomNavBar} options={commonOptions} />
          <Stack.Screen name='Consultation' component={ConsultationScreen} options={commonOptions} />
          <Stack.Screen name='Analysis' component={AnalysisScreen} options={commonOptions} />
          <Stack.Screen name='Assistance' component={AssistanceScreen} options={commonOptions} />
          <Stack.Screen name='More' component={MoreScreen} options={commonOptions} />
          <Stack.Screen name='Admin' component={AdminScreen} options={commonOptions} />
          <Stack.Screen name='Profile' component={ProfileAdminScreen} options={commonOptions} />
          <Stack.Screen name='ProfileUser' component={ProfileUser} options={commonOptions} />
          <Stack.Screen name='ChangeLanguage' component={ChangeLanguageScreen} options={commonOptions} />
          <Stack.Screen name='Security' component={SecurityScreen} options={commonOptions} />
          <Stack.Screen name='SubscriptionHistory' component={SubscriptionHistoryScreen} options={commonOptions} />
          <Stack.Screen name='AddPost' component={AddPost} options={commonOptions} />
          <Stack.Screen name='ArticleDetail' component={ArticleDetail} options={commonOptions} />
          <Stack.Screen name='ChatAdmin' component={ChatAdmin} options={commonOptions} />
          <Stack.Screen name='AnalysisRequestDetail' component={AnalysisRequestDetail} options={commonOptions} />
          <Stack.Screen name='AssistanceRequestScreen' component={AssistanceRequestScreen} options={commonOptions} />
          <Stack.Screen name='AssistanceRequestDetail' component={AssistanceRequestDetail} options={commonOptions} />
          <Stack.Screen name='ConsultationRequestScreen' component={ConsultationRequestScreen} options={commonOptions} />
          <Stack.Screen name='ConsultationRequestDetail' component={ConsultationRequestDetail} options={commonOptions} />
          <Stack.Screen name='ChatList' component={ChatList} options={{ headerShown: false }} />
          <Stack.Screen name='ChatScreen' component={ChatScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Request' component={Request} options={{ headerShown: false }} />
          <Stack.Screen name='payments' component={PaymentScreen} options={commonOptions} />
          <Stack.Screen name='PriceManagementScreen' component={PriceManagementScreen} options={commonOptions} />
          <Stack.Screen name='Members' component={Members} options={commonOptions} />
          <Stack.Screen name='MemberDetail' component={MemberDetail} options={commonOptions} />
          <Stack.Screen name='EditAssistance' component={EditAssistance} options={commonOptions} />
          <Stack.Screen name='EditConsultation' component={EditConsultation} options={commonOptions} />
          <Stack.Screen name='EditAnalysis' component={EditAnalysis} options={commonOptions} />
          <Stack.Screen name='AppointmentDetailScreen' component={AppointmentDetailScreen} options={commonOptions} />
          <Stack.Screen name='AdminSchedule' component={AdminSchedulePage} options={commonOptions} />
          <Stack.Screen name='UserSchedule' component={UserSchedulePage} options={commonOptions} />
        </Stack.Navigator>
        <Toast ref={(ref) => Toast.setRef(ref)} />
      </NavigationContainer>
    </I18nextProvider>
  );
}

AppRegistry.registerComponent(appName, () => App);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
});
