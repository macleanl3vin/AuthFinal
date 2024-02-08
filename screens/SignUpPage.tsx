import {useNavigation} from "@react-navigation/native";
import React, {useState} from "react";
import auth from "@react-native-firebase/auth";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

import {ActivityIndicator, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";

import {checkIfEmailIsRegistered, checkIfPhoneNumberIsRegistered} from "../helperFunctions/AuthenticationFunctions";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {EditorParams} from "../App";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigation = useNavigation<NativeStackNavigationProp<EditorParams>>();

  const formattedPhoneNumber = phone.replace(/\D/g, "");
  const fullPhoneNumber = `+1${formattedPhoneNumber}`;

  async function save(key: string, value: object) {
    try {
      const stringValue = JSON.stringify(value);
      await SecureStore.setItemAsync(key, stringValue);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }

  const signup = async () => {
    setLoading(true);

    try {
      // Checks if the email and phone # is already registered
      const emailExists = await checkIfEmailIsRegistered(email);
      console.log("test");

      const phoneExists = await checkIfPhoneNumberIsRegistered(fullPhoneNumber);
      console.log("test1");
      // If the email or the phone number is registered, alert the user.
      if (emailExists || phoneExists) {
        alert("Credentials already In use. Please sign in.");
      } else {
        const userCred = await auth().createUserWithEmailAndPassword(email, password);

        if (userCred) {
          // Sending a verification email to the currently logged-in user.
          auth().currentUser?.sendEmailVerification();

          navigation.navigate("AwaitEmailVerification", {userEmail: email, userPassword: password, fullPhone: fullPhoneNumber});
        } else {
          alert("Cannot send verification email, user does not exist.");
        }
      }
    } catch (error) {
      setLoading(false);

      console.error("Unexpected error:", error);
      alert("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <TextInput value={email} style={styles.input} placeholder="Email/Username" autoCapitalize="none" onChangeText={(text) => setEmail(text)} />
        <TextInput value={password} style={styles.input} secureTextEntry={true} placeholder="Password" autoCapitalize="none" onChangeText={(text) => setPassword(text)} />
        <TextInput value={phone} style={styles.input} placeholder="Phone" autoCapitalize="none" onChangeText={(text) => setPhone(text)} />
        {loading ? (
          <ActivityIndicator size="large" color="#0000f" />
        ) : (
          <View style={styles.ButtonContainer}>
            <TouchableOpacity onPress={signup} style={styles.signupButton}>
              <Text>Create Account</Text>
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
});
