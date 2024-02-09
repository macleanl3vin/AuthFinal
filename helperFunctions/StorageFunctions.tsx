import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import {Alert} from "react-native";

export async function save(key: string, value: object) {
  try {
    const stringValue = JSON.stringify(value);

    console.log("inside storage function", value);
    await SecureStore.setItemAsync(key, stringValue);
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

export async function getValueFor(key: string): Promise<{user: string; password: string} | {opt_into_face_auth: string} | null> {
  let result = await SecureStore.getItemAsync(key);

  if (result && key === "UserKey") {
    const parsedObject: {user: string; password: string} = JSON.parse(result);
    console.log(parsedObject);
    return parsedObject;
  } else if (result && key === "opt_into_face_auth") {
    const parsedObject: {opt_into_face_auth: string} = JSON.parse(result);
    return parsedObject;
  } else {
    return null;
  }
}

export async function handleAlert(decision: String, email: String, password: String) {
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
      } else {
        Alert.alert("Face ID Authentication", "Authentication failed");
      }
    } else {
      // Saving as no before show OS system prompt will allow them to enable this in the future easily.
      const opt_into_face_auth = {answer: "NO"};
      save("opt_into_face_auth", opt_into_face_auth);
    }
  } catch (error) {
    Alert.alert("Face ID Authentication", "Authentication failed");
    console.log(error);
  }
}
