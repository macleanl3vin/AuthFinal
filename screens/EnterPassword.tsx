import React, {useEffect, useState} from "react";
import {View, Text, KeyboardAvoidingView, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, Alert, Button} from "react-native";
import {useNavigation} from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import {FirebaseError} from "firebase/app";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {EditorParams} from "../App";

import {getValueFor, save} from "../helperFunctions/StorageFunctions";
import {useRoute} from "@react-navigation/native";
import * as LocalAuthentication from "expo-local-authentication";

// This or useRoute()?
interface EnterPasswordProps {
  route: any;
}

export default function EnterPassword({route}: EnterPasswordProps): JSX.Element {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const {email} = route?.params;

  const navigation = useNavigation<NativeStackNavigationProp<EditorParams>>();

  const handleAlert = async (decision: String) => {
    try {
      if (decision == "YES") {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Authenticate with Face ID",
          disableDeviceFallback: false,
        });

        const opt_into_face_auth = {answer: "YES"};

        save("opt_into_face_auth", opt_into_face_auth);

        save("UserKey", {user: email, password: password});
      } else {
        // Saving as no before show OS system prompt will allow them to enable this in the future easily.
        const opt_into_face_auth = {answer: "NO"};
        save("opt_into_face_auth", opt_into_face_auth);
        console.log("NO");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const SignIn = async () => {
    try {
      let returnValue = await getValueFor("opt_into_face_auth");

      if (returnValue == null) {
        Alert.alert('Do you want to allow "pudo" to use Face ID?', "Use Face ID to authenticate on pudo", [
          {text: "NO", onPress: () => handleAlert("NO")},
          {text: "YES", onPress: () => handleAlert("YES")},
        ]);
        navigation.navigate("Dashboard", {currentEmail: email});
      } else if ("answer" in returnValue && (returnValue.answer === "NO" || returnValue.answer === "YES")) {
        const userCredential = await auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // If email is verified, proceed to the Dashboard
        if (user && user.emailVerified) {
          await user.reload();

          navigation.navigate("Dashboard", {currentEmail: user.email});
        } else {
          // If email is not verified, show an alert
          Alert.alert("Email not verified", "Please verify your email before proceeding.");
        }
        console.log(`User logged in manually with ${email}, ${password}`);
      }
    } catch (error) {
      console.error("Error signing in:", error);

      // Check for specific error codes
      const firebaseError = error as FirebaseError;

      if (firebaseError.code == "auth/wrong-password") {
        Alert.alert("Invalid Password", "Please check your password and try again.");
      } else if (firebaseError.code == "auth/user-not-found") {
        Alert.alert("User Error", "Email may not be verified, check email.");
      }
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    setLoading(true);

    try {
      await auth().sendPasswordResetEmail(email);

      alert(`Password reset sent to ${email}`);
    } catch (error) {
      console.error("Error sending password reset:", error);
      alert("Error sending password reset:");
    } finally {
      setLoading(false);
    }
  };

  // const SignIn = async () => {
  //   setLoading(true);

  //   try {
  //     const userCredential = await auth().signInWithEmailAndPassword(email, password);
  //     const user = userCredential.user;

  //     // If email is verified, proceed to the Dashboard
  //     if (user && user.emailVerified) {
  //       await user.reload();

  //       navigation.navigate("Dashboard", {currentEmail: user.email});
  //     } else {
  //       // If email is not verified, show an alert
  //       Alert.alert("Email not verified", "Please verify your email before proceeding.");
  //     }
  //   } catch (error) {
  //     console.error("Error signing in:", error);

  //     // Check for specific error codes
  //     const firebaseError = error as FirebaseError;

  //     if (firebaseError.code == "auth/wrong-password") {
  //       Alert.alert("Invalid Password", "Please check your password and try again.");
  //     } else if (firebaseError.code == "auth/user-not-found") {
  //       Alert.alert("User Error", "Email may not be verified, check email.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <TextInput value={password} style={styles.input} secureTextEntry={true} placeholder="Password" autoCapitalize="none" onChangeText={(text) => setPassword(text)} />
        {loading ? (
          <ActivityIndicator size="large" color="#0000f" />
        ) : (
          <View style={styles.ButtonContainer}>
            <TouchableOpacity onPress={SignIn} style={styles.loginButton}>
              <Text>Proceed</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={forgotPassword} style={styles.button}>
              <Text>Forgot password?</Text>
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
  button: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 10,
    alignItems: "center",
    backgroundColor: "#fffff",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2.84,
    elevation: 5,
  },
  ButtonContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 15,
    paddingHorizontal: 20,
  },
  loginButton: {
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
  signupButton: {
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
  loginText: {
    fontSize: 10,
  },
  googleContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 15,
  },
});
