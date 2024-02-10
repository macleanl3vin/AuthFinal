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
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignInPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<EditorParams>>();

  // emailRegex checks if the input string resembles a valid email address pattern.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;

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
    let isFirstTimeOpened = await AsyncStorage.getItem("firstTimeOpened");

    if (!isFirstTimeOpened) {
      // Clean up data if it's the first time the app is opened
      await cleanUpData();
      await AsyncStorage.setItem("firstTimeOpened", "true");
    }

    let returnValue = await getValueFor("opt_into_face_auth");

    let changePassword = await getValueFor("change_password");

    if (returnValue == null || returnValue.answer === "NO" || changePassword?.change_password === true) {
      // Initiate manual sign in/sign up flow
      console.log("opt_into_face_auth is", returnValue);
      console.log("change_password is", changePassword);
    } else if ("answer" in returnValue && returnValue.answer === "YES" && changePassword?.change_password === false) {
      // Initiate face ID sign in flow
      const userCred = await authenticateWithFaceID();

      if (userCred && "user" in userCred && "password" in userCred) {
        console.log(userCred?.user, userCred?.password);
        let user: string = userCred.user as string;
        let password: string = userCred.password as string;

        let signIn = await auth().signInWithEmailAndPassword(user, password);
        if (signIn) {
          navigation.navigate("Dashboard");
        } else {
          Alert.alert("Error Signing In", "Credentials incorrect");
        }
      }
    }
  };

  const cleanUpData = async () => {
    try {
      await SecureStore.deleteItemAsync("UserKey");
      await SecureStore.deleteItemAsync("opt_into_face_auth");
      console.log("Sensitive data deleted.");
    } catch (error) {
      console.error("Error checking and deleting stored data:", error);
    }
  };

  useEffect(() => {
    // function calls when the component is mounted
    const fetchData = async () => {
      await handleAuthentication();
    };
    fetchData();
  }, []);

  const SignIn = async () => {
    setLoading(true);

    try {
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
      } else if (phoneRegex.test(trimmedInput)) {
        // replace all non-digit characters with an empty string.
        const formattedPhoneNumber = trimmedInput.replace(/\D/g, "");
        const fullPhoneNumber = `+1${formattedPhoneNumber}`;

        // Checking if phone # is registered
        const isPhoneNumberRegistered = await checkIfPhoneNumberIsRegistered(fullPhoneNumber);

        if (isPhoneNumberRegistered) {
          const confirmation = await initiatePhoneNumberVerification(fullPhoneNumber);

          navigation.navigate("SignInWithPhone", {confirmationCred: confirmation});
        } else {
          alert("Phone number is not registered. Please sign up first.");
        }
      } else {
        alert("Please enter a valid email or phone number.");
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
