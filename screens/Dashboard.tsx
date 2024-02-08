import {View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput} from "react-native";
import React, {useState} from "react";
import auth from "@react-native-firebase/auth";
import {QuerySnapshot, collection, getDocs, getFirestore, query, updateDoc, where} from "firebase/firestore";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {EditorParams} from "../App";

interface DashboardProps {
  route: any;
}

export default function Dashboard({route}: DashboardProps): JSX.Element {
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

  console.log(auth().currentUser);

  const changeEmail = async () => {
    setLoading(true);

    try {
      // Make sure input is a valid email, If it isnt promp user again
      const trimmedInput = newEmail.trim();
      if (!trimmedInput) {
        alert("Please enter a valid email.");

        setLoading(false);
        return;
      }

      // Confirm user input is a valid email
      if (emailRegex.test(trimmedInput)) {
        auth().currentUser?.verifyBeforeUpdateEmail(trimmedInput);

        alert("Verify your new email");

        const userCollection = collection(firestore, "users");
        const q = query(userCollection, where("email", "==", currentEmail));
        const querySnapshot: QuerySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Assuming there is only one document with the specific email, which there should be.
          const doc = querySnapshot.docs[0];
          // Update the document with the new email
          const newData = {email: trimmedInput};
          await updateDoc(doc.ref, newData);

          await auth().signOut();

          navigation.navigate("SignInPage");
        } else {
          console.warn("email was not changed");
        }
      }
    } catch (error) {
      alert("Could not change your email!");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput value={newEmail} style={styles.input} placeholder="Email/Phone" autoCapitalize="none" onChangeText={(text) => setNewEmail(text)} />
      {loading ? (
        <ActivityIndicator size="large" color="#0000f" />
      ) : (
        <View style={styles.ButtonContainer}>
          <TouchableOpacity onPress={changeEmail} style={styles.signupButton}>
            <Text>Next</Text>
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
