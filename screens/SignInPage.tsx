import React, {useState, useEffect} from "react";
import {StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, TextInput, ActivityIndicator, Alert} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

import {useNavigation, useIsFocused} from "@react-navigation/native";
import {checkIfEmailIsRegistered, checkIfPhoneNumberIsRegistered, initiatePhoneNumberVerification} from "../helperFunctions/AuthenticationFunctions";
import auth from "@react-native-firebase/auth";

import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {EditorParams} from "../App";

import * as SecureStore from "expo-secure-store";
import {getValueFor} from "../helperFunctions/StorageFunctions";

export default function SignInPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<EditorParams>>();

  // emailRegex checks if the input string resembles a valid email address pattern.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const authenticateWithFaceID = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with Face ID",
        disableDeviceFallback: false,
      });

      // Authentication with Face ID successful
      if (result.success) {
        // Retrieve data stored locally using Face ID
        return getValueFor("UserKey");
      } else {
        Alert.alert("Face ID Authentication", "Authentication failed");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
    }
  };

  const handleAuthentication = async () => {
    let returnValue = await getValueFor("opt_into_face_auth");

    if (returnValue == null) {
      // Initiate manual sign in/sign up flow
      console.log("opt_into_face_auth is", returnValue);
    } else if ("answer" in returnValue && returnValue.answer === "YES") {
      // Initiate face ID sign in flow
      const userCred = await authenticateWithFaceID();

      if (userCred && "user" in userCred && "password" in userCred) {
        console.log(userCred?.user, userCred?.password);
        let user: string = userCred.user as string;
        let password: string = userCred.password as string;

        let signIn = await auth().signInWithEmailAndPassword(user, password);
        if (signIn) {
          navigation.navigate("Dashboard");
        }
      }
    }
  };
  useEffect(() => {
    // function calls when the component is mounted
    handleAuthentication();
  }, []);

  const SignIn = async () => {
    setLoading(true);

    try {
      const test = await LocalAuthentication.hasHardwareAsync();
      console.log("does it have fingerprint or face ID", test);

      // Check if the input is empty
      const trimmedInput = emailOrPhone.trim();
      if (!trimmedInput) {
        alert("Please enter a valid email or phone number.");
        return;
      }

      console.log(trimmedInput);
      // Check if the input is a valid email
      if (emailRegex.test(trimmedInput)) {
        const isEmailRegistered = await checkIfEmailIsRegistered(trimmedInput);

        if (isEmailRegistered) {
          navigation.navigate("EnterPassword", {email: trimmedInput});
        } else {
          alert("Email not registered!");
        }
      } else {
        alert("Enter a valid Email");
      }
    } catch (error) {
      setLoading(false);
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <TextInput value={emailOrPhone} style={styles.input} placeholder="Email/Phone" autoCapitalize="none" onChangeText={(text) => setEmailOrPhone(text)} />
        {loading ? (
          <ActivityIndicator size="large" color="#0000f" />
        ) : (
          <View style={styles.ButtonContainer}>
            <TouchableOpacity onPress={SignIn} style={styles.proceedButton}>
              <Text>Proceed</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("SignUpPage")} style={styles.signUpButton}>
              <Text>Sign Up</Text>
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
