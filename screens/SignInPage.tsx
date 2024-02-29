import React, {useState, useEffect} from "react";
import {StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, TextInput, ActivityIndicator, Alert, Linking} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

import {useNavigation, useIsFocused} from "@react-navigation/native";
import {checkIfEmailIsRegistered, checkIfPhoneNumberIsRegistered, firebaseErrorHandling, initiatePhoneNumberVerification} from "../helperFunctions/AuthenticationFunctions";
import auth from "@react-native-firebase/auth";

import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {EditorParams} from "../App";

import * as SecureStore from "expo-secure-store";
import {getValueFor, OptIntoFaceAuth} from "../helperFunctions/StorageFunctions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {GoogleSignin, GoogleSigninButton} from "@react-native-google-signin/google-signin";
import {FirebaseError} from "firebase/app";

export default function SignInPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<EditorParams>>();

  // email_regexex checks if the input string resembles a valid email address pattern.
  const email_reg_ex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phone_reg_ex = /^\d{10}$/;

  GoogleSignin.configure({
    webClientId: "338110400267-gklnb04mf7ov50cs78dorpb4jg1gbdt1.apps.googleusercontent.com",
  });

  function openSupportLink() {
    const supportLink = "https://support.google.com/googleplay/answer/9037938?hl=en";
    Linking.openURL(supportLink);
  }
  const onGoogleButtonPress = async () => {
    try {
      const is_play_services = await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      if (is_play_services) {
        // Get the users ID token
        const {idToken} = await GoogleSignin.signIn();

        // Create a Google credential with the token in firebase
        const google_credential = auth.GoogleAuthProvider.credential(idToken);

        // Sign-in the user with the credential in firebase
        const user_credential = await auth().signInWithCredential(google_credential);

        if (user_credential) {
          navigation.navigate("Dashboard");
        }
      } else {
        Alert.alert("Play Services Not Available", "Please check your device settings or use another login method.", [{text: "OK", onPress: () => openSupportLink()}]);
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert(`Unexpected error: ${error}`);
    }
  };

  const authenticateWithFaceID = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with Face ID",
        disableDeviceFallback: false,
      });

      // Authentication with Face ID successful
      if (result.success) {
        // Retrieve data stored locally using Face ID
        return getValueFor("user_key");
      } else {
        Alert.alert("Face Authentication", "Authentication failed, No Data Fetched");
      }
    } catch (error) {
      alert(`Face authentication Failed: ${error}`);
    } finally {
      return null;
    }
  };

  const handleAuthentication = async () => {
    try {
      // make change to variable name isInitalized
      let first_time_opening_flag = await AsyncStorage.getItem("first_time_opening_flag");

      if (first_time_opening_flag === null) {
        // Clean up data if it's the first time the app is opened
        await cleanUpData();
      }

      const opt_into_face_auth = await getValueFor("opt_into_face_auth");
      const change_password = await getValueFor("change_password");

      // use !
      if (opt_into_face_auth == null || opt_into_face_auth.answer === "NO" || change_password?.change_password === true) {
        // Initiate manual sign in/sign up flow
        Alert.alert("Initiated manual sign in/sign up flow");
      } else if (opt_into_face_auth.answer === "YES" && !change_password?.change_password) {
        // Initiate face ID sign in flow
        const user_cred = await authenticateWithFaceID();

        if (user_cred && "user" in user_cred && "password" in user_cred) {
          const user: string = user_cred.user as string;
          const password: string = user_cred.password as string;

          const sign_in = await auth().signInWithEmailAndPassword(user, password);
          if (sign_in) {
            navigation.navigate("Dashboard");
          } else {
            Alert.alert("Error Signing In", "Credentials incorrect");
          }
        }
      }
    } catch (error) {
      const firebase_error = error as FirebaseError;
      const {title, message} = firebaseErrorHandling(firebase_error);
      Alert.alert(title, message);
    }
  };

  const cleanUpData = async () => {
    Alert.alert(`Data was deleted`);
    try {
      await SecureStore.deleteItemAsync("user_key");
      await SecureStore.deleteItemAsync("opt_into_face_auth");
    } catch (error) {
      alert(`Unexpected error: ${error}`);
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
      const trimmed_input = emailOrPhone.trim();
      if (!trimmed_input) {
        alert("Please enter a valid email or phone number.");
        return;
      }

      // Check if the input is a valid email
      if (email_reg_ex.test(trimmed_input)) {
        const isemail_regexistered = await checkIfEmailIsRegistered(trimmed_input);

        if (isemail_regexistered) {
          navigation.navigate("EnterPassword", {email: trimmed_input});
        } else {
          alert("Email not registered!");
        }
      } else if (phone_reg_ex.test(trimmed_input)) {
        // replace all non-digit characters with an empty string.
        const formatted_phone_number = trimmed_input.replace(/\D/g, "");
        const full_phone_number = `+1${formatted_phone_number}`;

        // Checking if phone # is registered
        const is_phone_number_registered = await checkIfPhoneNumberIsRegistered(full_phone_number);

        if (is_phone_number_registered) {
          const confirmation = await initiatePhoneNumberVerification(full_phone_number);

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
      alert(`Unexpected error: ${error}`);
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
              <Text>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("SignUpPage")} style={styles.signUpButton}>
              <Text>Sign Up</Text>
            </TouchableOpacity>
            <View style={styles.googleContainer}>
              <GoogleSigninButton onPress={() => onGoogleButtonPress()} />
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 35,
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
    gap: 20,
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
