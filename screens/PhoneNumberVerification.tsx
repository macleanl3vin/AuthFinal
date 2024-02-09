import {View, Text, KeyboardAvoidingView, TextInput, ActivityIndicator, TouchableOpacity, StyleSheet, Alert} from "react-native";
import React, {useState} from "react";
import {useNavigation} from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import {FIREBASE_APP} from "../FirebaseConfig";

import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";

import {initiatePhoneNumberVerification, linkPhoneNumberToAccount} from "../helperFunctions/AuthenticationFunctions";
import {collection, doc, getFirestore, setDoc} from "firebase/firestore";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {EditorParams} from "../App";
import {getValueFor, save, handleAlert} from "../helperFunctions/StorageFunctions";

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

  const sendVerificaitonCode = async () => {
    const phoneVerificationConfirmation = await initiatePhoneNumberVerification(phone);
    setConfirmation(phoneVerificationConfirmation);
  };

  const allowFaceID = async () => {
    try {
      let returnValue = await getValueFor("opt_into_face_auth");

      if (returnValue == null) {
        Alert.alert('Do you want to allow "pudo" to use Face ID?', "Use Face ID to authenticate on pudo", [
          {text: "NO", onPress: () => handleAlert("NO", email, password)},
          {text: "YES", onPress: () => handleAlert("YES", email, password)},
        ]);
      }
    } catch (error) {
      console.error("Error during authentication:", error);
    }
  };

  const handleCodeConfirmation = async () => {
    setLoading(true);

    try {
      await linkPhoneNumberToAccount(user, confirmation, verificationCode);

      // Storing users credentials in firestore under given UID
      const userDocRef = doc(collection(db, "users"), user?.uid);
      const userCredentials = {email, phone};
      await setDoc(userDocRef, userCredentials);

      await allowFaceID();

      navigation.navigate("Dashboard");
    } catch (error) {
      setLoading(false);
      console.log(`Error confirming verification code: ${error}`);
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
            <TouchableOpacity onPress={handleCodeConfirmation} style={styles.signUpButton} disabled={loading}>
              <Text>Next</Text>
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
