// sharedI18UtilInstance.js
import { I18nManager } from 'react-native';

const allowRTL = (isRTL) => {
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
};

export default {
  allowRTL,
};
