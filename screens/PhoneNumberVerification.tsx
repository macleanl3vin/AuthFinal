import {View, Text, KeyboardAvoidingView, TextInput, ActivityIndicator, TouchableOpacity, StyleSheet, Alert} from "react-native";
import React, {useState} from "react";
import {useNavigation} from "@react-navigation/native";
import auth, {firebase} from "@react-native-firebase/auth";
import {FIREBASE_ANALYTICS, FIREBASE_APP, FIREBASE_AUTH} from "../FirebaseConfig";

import {getAnalytics, logEvent} from "firebase/analytics";

import {initiatePhoneNumberVerification, linkPhoneNumberToAccount} from "../helperFunctions/AuthenticationFunctions";
import {collection, doc, getFirestore, setDoc} from "firebase/firestore";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {EditorParams} from "../App";
import {allowFaceID, getValueFor, handleAlert, save} from "../helperFunctions/StorageFunctions";
import {PhoneAuthProvider} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PageThreeProps {
  route: any;
}

export default function PhoneNumberVerification({route}: PageThreeProps): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const {email, phone, password} = route.params;
  const user = auth().currentUser;

  const db = getFirestore(FIREBASE_APP);
  const navigation = useNavigation<NativeStackNavigationProp<EditorParams>>();

  const handleCodeConfirmation = async () => {
    setLoading(true);

    try {
      await linkPhoneNumberToAccount(user, confirmation, verificationCode);

      // Storing users credentials in firestore under given UID
      const user_doc_ref = doc(collection(db, "users"), user?.uid);
      const user_credentials = {email, phone};
      await setDoc(user_doc_ref, user_credentials);

      await allowFaceID(email, password);

      navigation.navigate("Dashboard");
    } catch (error) {
      setLoading(false);
      console.log(`Error confirming verification code: ${error}`);
      alert(`Error confirming verification code: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const sendVerificaitonCode = async () => {
    setLoading(true);

    try {
      // Handle the verify phone button press
      const phone_auth = await firebase.auth().verifyPhoneNumber(phone);

      const verification_id = phone_auth.verificationId;

      alert("Verification code sent");
      setConfirmation(verification_id);
    } catch (error) {
      // Log failed verification attempt
      console.log(error);
      alert(`Error Sending Verification Code ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <TextInput value={verificationCode} style={styles.input} placeholder="Verification code" autoCapitalize="none" onChangeText={(text) => setVerificationCode(text)} />
        {loading ? (
          <ActivityIndicator size="large" color="#0000f" />
        ) : (
          <View style={styles.ButtonContainer}>
            <TouchableOpacity onPress={handleCodeConfirmation} style={styles.proceedButton} disabled={loading}>
              <Text>Confirm Code</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={sendVerificaitonCode} style={styles.signUpButton} disabled={loading}>
              <Text>Send Verification</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#ffffff",
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 1.84,
    elevation: 5,
  },
  ButtonContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 15,
    paddingHorizontal: 20,
  },
  proceedButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 10,
    alignItems: "center",
    backgroundColor: "#66CFF4",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2.84,
    elevation: 5,
  },
  signUpButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 10,
    alignItems: "center",
    backgroundColor: "#FFAF37",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2.84,
    elevation: 5,
  },
  googleContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 15,
  },
});
