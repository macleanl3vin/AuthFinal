import React, {useEffect, useState} from "react";
import {View, Text, KeyboardAvoidingView, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, Alert, Button} from "react-native";
import {useNavigation} from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import {FirebaseError} from "firebase/app";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {EditorParams} from "../App";

import {getValueFor, handleAlert, handleForgotPassword, save} from "../helperFunctions/StorageFunctions";
import {useRoute} from "@react-navigation/native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {firebaseErrorHandling} from "../helperFunctions/AuthenticationFunctions";
// This or useRoute()?
interface EnterPasswordProps {
  route: any;
}

export default function EnterPassword({route}: EnterPasswordProps): JSX.Element {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const {email} = route?.params;

  const navigation = useNavigation<NativeStackNavigationProp<EditorParams>>();

  const SignIn = async () => {
    try {
      const user_credential = await auth().signInWithEmailAndPassword(email, password);

      if (user_credential) {
        let opt_into_face_authVal = await getValueFor("opt_into_face_auth");
        let forgotPassword = await SecureStore.getItemAsync("change_password");

        handleForgotPassword(forgotPassword, password);

        if (opt_into_face_authVal == null) {
          Alert.alert('Do you want to allow "pudo" to use Face ID?', "Use Face ID to authenticate on pudo", [
            {text: "NO", onPress: () => handleAlert("NO", email, password)},
            {text: "YES", onPress: () => handleAlert("YES", email, password)},
          ]);

          if (user_credential) {
            navigation.navigate("Dashboard", {current_email: email});
          } else {
            Alert.alert("Error Logging In", "User not found");
          }
        } else if ("answer" in opt_into_face_authVal && (opt_into_face_authVal.answer === "NO" || opt_into_face_authVal.answer === "YES")) {
          const user_credential = await auth().signInWithEmailAndPassword(email, password);
          const user = user_credential.user;

          // If email is verified, proceed to the Dashboard
          if (user && user.emailVerified) {
            await user.reload();

            navigation.navigate("Dashboard", {current_email: user.email});
          } else {
            // If email is not verified, show an alert
            Alert.alert("Email not verified", "Please verify your email before proceeding.");
          }
        }
      }
    } catch (error) {
      const firebase_error = error as FirebaseError;
      const {title, message} = firebaseErrorHandling(firebase_error);
      Alert.alert(title, message);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    setLoading(true);

    try {
      await auth().sendPasswordResetEmail(email);
      // change key name
      const value = {change_password: "true"};
      save("change_password", value);

      alert(`Password reset sent to ${email}`);
    } catch (error) {
      console.error("Error sending password reset:", error);
      alert("Error sending password reset:");
    } finally {
      setLoading(false);
    }
  };

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
