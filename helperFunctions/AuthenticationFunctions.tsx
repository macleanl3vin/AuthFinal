import auth, {FirebaseAuthTypes} from "@react-native-firebase/auth";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
// import "firebase/compat/auth";
import {QuerySnapshot, collection, getDocs, getFirestore, query, where} from "firebase/firestore";
import {Alert, Linking} from "react-native";
import {EditorParams} from "../App";
import {GoogleSignin, GoogleSigninButton} from "@react-native-google-signin/google-signin";
import {PhoneAuthProvider} from "firebase/auth";

export async function linkPhoneNumberToAccount(
  user: FirebaseAuthTypes.User | null,
  verificationId: string,
  verificationCode: string
): Promise<FirebaseAuthTypes.UserCredential | undefined> {
  try {
    // Check if a user exists
    if (user) {
      // assigns newly created phone authentication credentials to the credential variable.
      const credential = auth.PhoneAuthProvider.credential(verificationId, verificationCode);

      // links the provided phone number to the currently logged in user's Firebase account.
      // uses the phone authentication credentials obtained during code verification/confirmation above.
      const cred = await user?.linkWithCredential(credential);

      console.log("Phone number linked to account successfully");
      return cred;
    } else {
      alert("User is does not exist. Unable to link phone number to account.");
    }
  } catch (error) {
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
    throw error;
  }
}

export async function signInWithPhoneNumberAndCode(verificationId: string, verificationCode: string): Promise<void> {
  try {
    // Create new AuthCredential from verificationId & verification code
    const phoneCredential = auth.PhoneAuthProvider.credential(verificationId, verificationCode);

    await auth().signInWithCredential(phoneCredential);
  } catch (error) {
    console.error("Error signing in with phone number and verification code:", error);
    throw error;
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
