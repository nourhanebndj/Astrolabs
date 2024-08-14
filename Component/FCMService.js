import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';

class FCMService {
  register = (onRegister, onNotification, onOpenNotification) => {
    this.checkPermission(onRegister);
    this.createNotificationListeners(onRegister, onNotification, onOpenNotification);
  };

  checkPermission = async (onRegister) => {
    const enabled = await messaging().hasPermission();
    if (enabled) {
      this.getToken(onRegister);
    } else {
      this.requestPermission(onRegister);
    }
  };

  getToken = async (onRegister) => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      await AsyncStorage.setItem('fcmToken', fcmToken);
      onRegister(fcmToken);
    } else {
      console.log("Failed to get FCM token");
    }
  };

  requestPermission = async (onRegister) => {
    try {
      await messaging().requestPermission();
      this.getToken(onRegister);
    } catch (error) {
      console.log("Permission rejected");
    }
  };

  deleteToken = async () => {
    try {
      await messaging().deleteToken();
      await AsyncStorage.removeItem('fcmToken');
      console.log("FCM token deleted");
    } catch (error) {
      console.log("Failed to delete token");
    }
  };

  createNotificationListeners = (onRegister, onNotification, onOpenNotification) => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage) {
        const notification = remoteMessage.notification;
        onOpenNotification(notification);
      }
    });

    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        const notification = remoteMessage.notification;
        onOpenNotification(notification);
      }
    });

    messaging().onMessage(async remoteMessage => {
      if (remoteMessage) {
        const notification = remoteMessage.notification;
        onNotification(notification);
      }
    });

    messaging().onTokenRefresh(fcmToken => {
      onRegister(fcmToken);
    });
  };

  unRegister = () => {
    messaging().onMessage(() => {});
    messaging().onNotificationOpenedApp(() => {});
    messaging().getInitialNotification(() => {});
    messaging().onTokenRefresh(() => {});
  };
}

export const fcmService = new FCMService();
