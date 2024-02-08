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

// const userData = {user: "maclean.levin@gmail.com", password: "johnwayne2004"};
// save("bananas", userData);

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
