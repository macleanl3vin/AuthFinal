import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import {Alert} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function save(key: string, value: object) {
  try {
    const stringValue = JSON.stringify(value);

    await SecureStore.setItemAsync(key, stringValue);
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

export interface OptIntoFaceAuth {
  answer?: string;
}

export async function getValueFor(key: string): Promise<{user: string; password: string} | {opt_into_face_auth: OptIntoFaceAuth} | {change_password: string} | null> {
  let result = await SecureStore.getItemAsync(key);

  if (result) {
    switch (key) {
      case "user_key":
        return JSON.parse(result) as {user: string; password: string};
      case "opt_into_face_auth":
        return JSON.parse(result) as {opt_into_face_auth: OptIntoFaceAuth};
      case "change_password":
        return JSON.parse(result) as {change_password: string};
      default:
        return null;
    }
  } else {
    return null;
  }
}

export const allowFaceID = async (email: string, password: string) => {
  try {
    let opt_into_face_auth = await getValueFor("opt_into_face_auth");

    if (opt_into_face_auth == null) {
      Alert.alert('Do you want to allow "pudo" to use Face ID?', "Use Face ID to authenticate on pudo", [
        {text: "NO", onPress: () => handleAlert("NO")},
        {text: "YES", onPress: () => handleAlert("YES", email, password)},
      ]);
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    Alert.alert(`Error during authentication: ${error}`);
  }
};

export const handleAlert = async (decision: String, email?: String, password?: String) => {
  try {
    // look into this
    let opt_into_face_auth = {answer: decision === "YES" ? "YES" : "NO"};

    if (decision == "YES") {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with Face ID",
        disableDeviceFallback: false,
      });

      if (result.success) {
        opt_into_face_auth = {answer: "YES"};
        save("user_key", {user: email, password: password});
      }
    } else {
      opt_into_face_auth = {answer: "NO"};
    }

    save("opt_into_face_auth", opt_into_face_auth);

    const first_time_opening_flag = await AsyncStorage.getItem("first_time_opening_flag");
    if (first_time_opening_flag === null) {
      await AsyncStorage.setItem("first_time_opening_flag", "false");
    }
  } catch (error) {
    console.log("Unexpected error", error);
    Alert.alert(`Unexpected error when storing data: ${error}`);
  }
};

export const handleForgotPassword = async (forgotPassword: string | null, password: string) => {
  if (forgotPassword) {
    const userData = JSON.parse(forgotPassword);

    if (userData.change_password === "true") {
      userData.change_password = false;
      // Convert the object back to a JSON string
      const updated_user_key = JSON.stringify(userData);
      await SecureStore.setItemAsync("change_password", updated_user_key);

      const user_key = await SecureStore.getItemAsync("user_key");
      if (user_key) {
        // Parse the JSON string to get the object
        const userData = JSON.parse(user_key);

        // Update the user property with the new email
        userData.password = password;

        // Convert the object back to a JSON string
        const updated_user_key = JSON.stringify(userData);
        await SecureStore.setItemAsync("user_key", updated_user_key);
      }
    }
  }
};
