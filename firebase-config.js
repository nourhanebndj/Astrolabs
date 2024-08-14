import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {

  apiKey: "AIzaSyBuxqeuLEnWBNjhaV3vGqnIflDO8W1NFSU",

  authDomain: "astrolabs-1a622.firebaseapp.com",

  projectId: "astrolabs-1a622",

  storageBucket: "astrolabs-1a622.appspot.com",

  messagingSenderId: "42001484814",

  appId: "1:42001484814:web:0f118be52a6f6f9dd7005f"

};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export{auth}