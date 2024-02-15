import auth, {firebase, FirebaseAuthTypes} from "@react-native-firebase/auth";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
// import "firebase/compat/auth";
import {QuerySnapshot, collection, getDocs, getFirestore, query, where} from "firebase/firestore";
import {Alert, Linking} from "react-native";
import {EditorParams} from "../App";
import {GoogleSignin, GoogleSigninButton} from "@react-native-google-signin/google-signin";
import {PhoneAuthProvider} from "firebase/auth";
import {FirebaseError} from "firebase/app";

export async function linkPhoneNumberToAccount(
  user: FirebaseAuthTypes.User | null,
  verificationId: string,
  verificationCode: string
): Promise<FirebaseAuthTypes.UserCredential | undefined> {
  try {
    const current_user = firebase.auth().currentUser;
    // Check if a user exists
    if (current_user) {
      // assigns newly created phone authentication credentials to the credential variable.
      const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);

      // links the provided phone number to the currently logged in user's Firebase account.
      // uses the phone authentication credentials obtained during code verification/confirmation above.
      const cred = await current_user.linkWithCredential(credential);

      console.log("Phone number linked to account successfully");
      return cred;
    } else {
      alert("User is does not exist. Unable to link phone number to account.");
    }
  } catch (error) {
    const firebaseError = error as FirebaseError;

    if (firebaseError.code === "auth/provider-already-linked") {
      Alert.alert("Error", "The provider has already been linked to the user.");
    } else if (firebaseError.code === "auth/invalid-credential") {
      Alert.alert("Error", "The provider's credential is not valid. Please check the documentation and parameters.");
    } else if (firebaseError.code === "auth/credential-already-in-use") {
      Alert.alert("Error", "The account corresponding to the credential already exists or is already linked to a Firebase User.");
    } else if (firebaseError.code === "auth/email-already-in-use") {
      Alert.alert("Error", "The email corresponding to the credential already exists among your users.");
    } else if (firebaseError.code === "auth/operation-not-allowed") {
      Alert.alert("Error", "The provider is not enabled. Please configure it in the Firebase Console.");
    } else if (firebaseError.code === "auth/invalid-email") {
      Alert.alert("Error", "The email used is invalid.");
    } else if (firebaseError.code === "auth/wrong-password") {
      Alert.alert("Error", "The password is incorrect.");
    } else if (firebaseError.code === "auth/invalid-verification-code") {
      Alert.alert("Error", "The verification code is not valid.");
    } else if (firebaseError.code === "auth/invalid-verification-id") {
      Alert.alert("Error", "The verification ID is not valid.");
    } else {
      Alert.alert("Unexpected Error");
    }

    console.error("Error linking phone number to account:", error);
    throw error;
  }
}

export async function initiatePhoneNumberVerification(phoneNumber: string): Promise<string> {
  try {
    // Initiate phone number verification
    const phoneAuth = await auth().verifyPhoneNumber(phoneNumber);
    // Extract verificationId from phoneAuth reference
    const verificationId = phoneAuth.verificationId;

    // Return the verificationId for later use
    return verificationId;
  } catch (error) {
    console.error("Error initiating phone number verification:", error);
    Alert.alert("Error", `Could not initiate phone number verification ${error}`);

    throw error;
  }
}

export async function signInWithPhoneNumberAndCode(verificationId: string, verificationCode: string): Promise<boolean | undefined> {
  try {
    // Create new AuthCredential from verificationId & verification code
    const phoneCredential = auth.PhoneAuthProvider.credential(verificationId, verificationCode);

    const result = await auth().signInWithCredential(phoneCredential);
    if (result) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error signing in with phone number and verification code:", error);
    const firebaseError = error as FirebaseError;

    if (firebaseError.code === "auth/account-exists-with-different-credential") {
      Alert.alert("Error", "Account already linked with different credential");
    } else if (firebaseError.code === "auth/invalid-credential") {
      Alert.alert("Error", "The provider's credential is not valid. Please check the documentation and parameters.");
    } else if (firebaseError.code === "auth/operation-not-allowed") {
      Alert.alert("Error", "account corresponding to the credential is not enabled");
    } else if (firebaseError.code === "auth/missing-verification-code") {
      Alert.alert("Error", "Missing verification code");
    } else {
      Alert.alert("Unexpected Error");
    }
  }
}

export const checkIfPhoneNumberIsRegistered = async (phoneNumber: string): Promise<boolean> => {
  const firestore = getFirestore();

  try {
    const userCollection = collection(firestore, "users");
    // query to retrieve documents from the userCollection
    // where the "phone" field matches the email input from the user.
    const q = query(userCollection, where("phone", "==", phoneNumber));
    const querySnapshot: QuerySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking if phone number is registered:", error);
    throw error;
  }
};

export const checkIfEmailIsRegistered = async (email: string): Promise<boolean> => {
  const firestore = getFirestore();
  try {
    // reference to the "users" collection in Firestore
    const userCollection = collection(firestore, "users");
    // query to retrieve documents from the userCollection
    // where the "email" field matches the email input from the user.
    const q = query(userCollection, where("email", "==", email));
    const querySnapshot: QuerySnapshot = await getDocs(q);

    // returns true if there is at least one match, and false otherwise.
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking if email is registered:", error);
    throw error;
  }
};
