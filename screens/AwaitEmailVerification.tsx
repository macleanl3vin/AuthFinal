import {View, Text, StyleSheet, ActivityIndicator} from "react-native";
import React, {useEffect, useState} from "react";
import {useNavigation} from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {EditorParams} from "../App";

interface awaitEmailVerificationProps {
  route: any;
}

export default function AwaitEmailVerification({route}: awaitEmailVerificationProps): JSX.Element {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<EditorParams>>();

  const {userEmail, userPassword, fullPhone} = route.params;
  const [isEmailVerified, setEmailVerified] = useState(false);
  const [shouldContinueLoop, setShouldContinueLoop] = useState(true);

  // function that checks if email is verified
  const checkEmailVerification = async () => {
    try {
      // reloads the user's credentials/data
      await auth().currentUser?.reload();

      // assigns the current boolean value of emailVerified to isVerified.
      const isVerified = auth().currentUser?.emailVerified || false;

      setEmailVerified(isVerified);
      // Stops checking email verification if it's already verified.
      if (isVerified) {
        setShouldContinueLoop(false);
      }
    } catch (error) {
      console.error("Error checking email verification:", error);
    }
  };

  // Checks if the email is verified every two seconds and stops when necessary.
  // The loop should continue based on the state of shouldContinueLoop/isVerified.
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (shouldContinueLoop) {
        checkEmailVerification();
      }
    }, 2000);

    // Cleanup function to clear the interval when shouldContinueLoop is false.
    return () => clearInterval(intervalId);
  }, [shouldContinueLoop]);

  // Use effect for navigating to PhoneNumberVerification when email is verified
  useEffect(() => {
    if (isEmailVerified) {
      try {
        // Navigates to PhoneNumberVerification with the user's email and phone.
        navigation.navigate("PhoneNumberVerification", {email: userEmail, phone: fullPhone, password: userPassword});
      } catch (error) {
        console.error("Error navigating to PhoneNumberVerification:", error);
        alert("An error occurred while navigating. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  }, [isEmailVerified, userEmail, fullPhone, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Check your email for verification. Press next if verified.</Text>
      {loading ? <ActivityIndicator size="large" color="#0000f" /> : <View style={styles.ButtonContainer}></View>}
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
    backgroundColor: "#fff",
    width: 50,
    height: 50,
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
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
});
