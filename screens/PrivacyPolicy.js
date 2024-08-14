
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

const PrivacyPolicyScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  React.useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  if (!fontsLoaded) {
    return null;
  } else {
    SplashScreen.hideAsync();
  }

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name={isRTL ? "arrowright" : "arrowleft"} size={30} color="#2E6FF3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("Terms of Service and Privacy Policy")}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.policyText}>
          {`
The site is secured and does not share its information with third parties. The information is reserved for the development of the application. We use information to help us improve the security and reliability of our Services. This includes detecting and responding to fraud, abuse, and security risks, as well as detecting and responding to technical issues that could harm the application, users, or the public.

When to share your information

We do not share your personal information with companies, organizations, or individuals outside the application except in the following cases:

With your consent
We will share your personal information with unaffiliated third parties only with your consent. For example, if you use Home to make a reservation through a reservation service, we will obtain your permission before sharing your name or phone number with the service.

With domain administrators
If you are a student or work at an organization that uses online services, your domain administrator and vendors who manage your account will have access to your email account. They may be able to:
• Access and retain information stored in your account, such as your email
• Change your account password
• Suspend or terminate access to your account
• Receive your account information in compliance with applicable law, regulation, legal process, or enforceable governmental request
• Restrict your ability to delete or modify your information or privacy settings.

For legal reasons
We will share personal information if we believe in good faith that it is necessary to disclose it for any of the following reasons:
• Apply applicable terms of service.
• Detecting fraud, technical problems, or security problems, preventing them from occurring, or taking other measures to deal with them.
• Protect against harm to the rights, property, or safety of users or the public. We may share non-personally identifiable information publicly and with our partners, such as publishers, advertisers, developers, or rights holders. For example, we share information publicly to display indicators from your browser or device for advertising and measurement purposes using cookies or similar technologies (such as a file or image upload service).

In the event we enter into a merger, acquisition, or asset sale, we will continue to ensure the confidentiality of your personal information and provide notice to relevant users before personal information is transferred or subject to a different privacy policy. Other data is automatically deleted or anonymized after a set period of time, such as advertising data in server logs.

Payment policy
About payment: Before paying, please confirm before paying because the refund does not work due to technical difficulties (mainly challenges with the banking system, as the banking protection system considered it as suspicious activity that may lead to the closure of financial accounts).
`}
        </Text>
        <Text style={[styles.policyText, styles.arabicText]}>
          {`
سياسة الخصوصية

الموقع مؤمن ولا يشارك معلوماته مع جهات خارجية. المعلومات محفوظة لتطوير التطبيق. نستخدم المعلومات لتساعدنا في تحسين أمان خدماتنا وموثوقيتها. وهذا يشمل كشف مخاطر الاحتيال وإساءة الاستخدام والأمان والاستجابة لها، بالإضافة إلى رصد المشاكل الفنية التي قد تضر بالتطبيق أو المستخدمين أو الجمهور والاستجابة لها.

متى تشارك معلوماتك

لا نشارك معلوماتك الشخصية مع الشركات، أو المؤسسات، أو الأفراد خارج التطبيق إلا في الحالات التالية:

بموافقة منك
سنشارك معلوماتك الشخصية مع جهات خارجية غير تابعة لتطبيق بعد الحصول على موافقتك فقط. على سبيل المثال، إذا استخدمت Home لإجراء حجز من خلال إحدى خدمات الحجز، سنحصل على إذن منك قبل مشاركة اسمك أو رقم هاتفك مع الخدمة.

مع مشرفي النطاق
إذا كنت طالبًا أو تعمل في مؤسسة تستخدم خدمات الانترنت، سيتوفّر لدى مشرف النطاق والموردين، الذين يديرون حسابك، إمكانية الوصول إلى حسابك على الايميل. وقد يتمكنون من:
• الوصول إلى المعلومات المخزّنة في حسابك والاحتفاظ بها، مثل بريدك الإلكتروني
• تغيير كلمة مرور حسابك
• تعليق إمكانية الوصول إلى حسابك أو إنهاؤها
• تلقي معلومات حسابك التزامًا بقانون معمول به أو لائحة أو إجراء قانوني أو طلب حكومي واجب النفاذ
• تقييد قدرتك على حذف أو تعديل معلوماتك أو إعدادات خصوصيتك.

لأسباب قانونية
سنشارك المعلومات الشخصية إذا كنا نعتقد بنية حسنة أنّه من الضروري الإفصاح عنها لأي من الأسباب التالية:
• تطبيق بنود الخدمة السارية.
• اكتشاف احتيال أو مشكلات فنية أو مشكلات أمان أو الحيلولة دون وقوعها أو غير ذلك من إجراءات التعامل معها.
• الحماية من إلحاق ضرر بحقوق أو ملكيات أو سلامة المستخدمين أو الجمهور. يجوز لنا مشاركة المعلومات التي لا تحدد هوية الشخص مع الجميع ومع شركائنا، مثل الناشرين أو المعلنين أو المطورين أو أصحاب الحقوق. فعلى سبيل المثال، نشارك المعلومات مع الجميع لـ عرض مؤشرات من متصفّحك أو جهازك لأغراض الإعلان والقياس باستخدام ملفات تعريف الارتباط أو التقنيات المماثلة (مثل خدمة تحميل ملفات او صور).

في حال دخول في عملية دمج أو استحواذ أو بيع أصول، سنستمر في ضمان سرية معلوماتك الشخصية وإرسال إشعار للمستخدمين المعنيين قبل نقل المعلومات الشخصية أو إخضاعها لسياسة خصوصية مختلفة.

سياسة الدفع
حول الدفع: قبل الدفع يرجى التأكيد قبل الدفع لأن استرداد الأموال لا يعمل بسبب صعوبات فنية (بشكل أساسي تحديات النظام المصرفي، حيث اعتبره نظام الحماية المصرفي نشاطًا مشبوهًا قد يؤدي الى غلق حسابات المالية).
`}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop:50,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 25,
    fontFamily: "Montserrat-Bold",
    flex: 1,
    textAlign: "center",
  },
  scrollContainer: {
    padding: 20,
  },
  policyText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: "Montserrat-Regular",
  },
  arabicText: {
    textAlign: "right",
    fontFamily: "Montserrat-Regular",
  },
});

export default PrivacyPolicyScreen;
