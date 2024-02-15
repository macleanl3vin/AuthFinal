import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import {Alert} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function save(key: string, value: object) {
  try {
    const stringValue = JSON.stringify(value);

    console.log("inside storage function", value);
    await SecureStore.setItemAsync(key, stringValue, {
      keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY,
    });
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

export async function getValueFor(key: string): Promise<{user: string; password: string} | {opt_into_face_auth: string} | {change_password: string} | null> {
  let result = await SecureStore.getItemAsync(key);

  if (result && key === "UserKey") {
    const parsedObject: {user: string; password: string} = JSON.parse(result);
    return parsedObject;
  } else if (result && key === "opt_into_face_auth") {
    const parsedObject: {opt_into_face_auth: string} = JSON.parse(result);
    return parsedObject;
  } else if (result && key === "change_password") {
    const parsedObject: {change_password: string} = JSON.parse(result);
    return parsedObject;
  } else {
    return null;
  }
}

export const handleAlert = async (decision: String, email: String, password: String) => {
  try {
    if (decision == "YES") {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with Face ID",
        disableDeviceFallback: false,
      });

      if (result.success) {
        const opt_into_face_auth = {answer: "YES"};

        save("opt_into_face_auth", opt_into_face_auth);
        save("UserKey", {user: email, password: password});

        const isFirstTimeOpened = await AsyncStorage.getItem("firstTimeOpened");

        if (isFirstTimeOpened === null) {
          await AsyncStorage.setItem("firstTimeOpened", "false");
        }
      }
    } else {
      // Saving as no before show OS system prompt will allow them to enable this in the future easily.
      const opt_into_face_auth = {answer: "NO"};
      save("opt_into_face_auth", opt_into_face_auth);

      const isFirstTimeOpened = await AsyncStorage.getItem("firstTimeOpened");

      if (isFirstTimeOpened === null) {
        await AsyncStorage.setItem("firstTimeOpened", "false");
      }
    }
  } catch (error) {
    console.log("Unexpected error", error);
    Alert.alert(`Unexpected error when storing data: ${error}`);
  }
};
