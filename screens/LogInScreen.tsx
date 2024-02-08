import React, {useEffect, useState} from "react";
import {Text, View, StyleSheet, Button, Alert, TextInput} from "react-native";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";

import auth from "@react-native-firebase/auth";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {EditorParams} from "../App";
import {getValueFor} from "../helperFunctions/StorageFunctions";
import {get} from "react-native/Libraries/TurboModule/TurboModuleRegistry";

async function save(key: string, value: object) {
  try {
    const stringValue = JSON.stringify(value);

    await SecureStore.setItemAsync(key, stringValue);
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

export default function LogInScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<EditorParams>>();
  const [emailOrPhone, setEmailOrPhone] = useState("");

  const authenticateWithFaceID = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with Face ID",
        disableDeviceFallback: true,
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

  const showUI = async () => {
    let returnValue = await getValueFor("opt_into_face_auth");

    if (returnValue == null) {
      // Initiate manual sign in/sign up flow
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

  const handleContinue = () => {
    navigation.navigate("EnterPassword", {email: emailOrPhone});
  };

  useEffect(() => {
    showUI();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>🔐 Use Face ID to authenticate and retrieve data 🔐</Text>
      <Button title="Authenticate with Face ID" onPress={showUI} />
      <TextInput value={emailOrPhone} style={styles.input} placeholder="Email/Phone" autoCapitalize="none" onChangeText={(text) => setEmailOrPhone(text)} />
      <Button title="Next" onPress={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  paragraph: {
    margin: 12,
    fontSize: 18,
    textAlign: "center",
  },
});
