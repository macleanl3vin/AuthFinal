import {View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert} from "react-native";
import React, {useState} from "react";
import auth from "@react-native-firebase/auth";
import {QuerySnapshot, collection, getDocs, getFirestore, query, updateDoc, where} from "firebase/firestore";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {EditorParams} from "../App";
import * as SecureStore from "expo-secure-store";

export default function Dashboard(): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const firestore = getFirestore();
  const navigation = useNavigation<NativeStackNavigationProp<EditorParams>>();

  const currentEmail = auth().currentUser?.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogout = async () => {
    try {
      await auth().signOut();
      console.log("User logged out successfully");
      navigation.navigate("SignInPage");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const changeEmail = async () => {
    setLoading(true);

    try {
      // Make sure input is a valid email, If it isnt promp user again
      const trimmed_input = newEmail.trim();
      if (!trimmed_input) {
        alert("Please enter a valid email.");

        setLoading(false);
        return;
      }

      // Confirm user input is a valid email
      if (emailRegex.test(trimmed_input)) {
        auth().currentUser?.verifyBeforeUpdateEmail(trimmed_input);

        Alert.alert("Verify your new email");

        const userCollection = collection(firestore, "users");
        const q = query(userCollection, where("email", "==", currentEmail));
        const querySnapshot: QuerySnapshot = await getDocs(q);

        const user_key = await SecureStore.getItemAsync("user_key");

        // Save user data locally after email change
        if (user_key) {
          // Parse the JSON string to get the object
          const user_data = JSON.parse(user_key);

          // Update the user property with the new email
          user_data.user = newEmail;

          // Convert the object back to a JSON string
          const updated_user_key = JSON.stringify(user_data);
          await SecureStore.setItemAsync("user_key", updated_user_key);
        }

        if (!querySnapshot.empty) {
          // Assuming there is only one document with the specific email, which there should be.
          const doc = querySnapshot.docs[0];
          // Update the document with the new email
          const new_data = {email: trimmed_input};
          await updateDoc(doc.ref, new_data);

          await auth().signOut();

          navigation.navigate("SignInPage");
        } else {
          console.warn("email was not changed");
        }
      }
    } catch (error) {
      alert(`Could not change your email! ${error}`);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Signed In User: {auth().currentUser?.email}</Text>
      <TextInput value={newEmail} style={styles.input} placeholder="Email/Phone" autoCapitalize="none" onChangeText={(text) => setNewEmail(text)} />
      {loading ? (
        <ActivityIndicator size="large" color="#0000f" />
      ) : (
        <View style={styles.ButtonContainer}>
          <TouchableOpacity onPress={changeEmail} style={styles.signupButton}>
            <Text>Change Email</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logOutButton}>
            <Text>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}
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
  text: {
    marginVertical: 4,
    height: 50,
    padding: 10,
    textAlign: "center",
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
  logOutButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 10,
    alignItems: "center",
    backgroundColor: "#FF0000",
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
});
