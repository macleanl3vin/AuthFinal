import {View, Text, StyleSheet, KeyboardAvoidingView, TextInput, ActivityIndicator, TouchableOpacity, Alert} from "react-native";
import React, {useState} from "react";
import {useNavigation} from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import {signInWithPhoneNumberAndCode} from "../helperFunctions/AuthenticationFunctions";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {EditorParams} from "../App";

interface SignInWithPhoneProps {
  route: any;
}

export default function SignInWithPhone({route}: SignInWithPhoneProps): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const navigation = useNavigation<NativeStackNavigationProp<EditorParams>>();
  const {confirmationCred} = route.params;

  const SignIn = async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await signInWithPhoneNumberAndCode(confirmationCred, verificationCode);

      if (result) {
        navigation.navigate("Dashboard");
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log("Error logging in via phone number", error);
      Alert.alert(`Error logging in via phone number ${error}`);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <TextInput value={verificationCode} style={styles.input} placeholder="Verification code" autoCapitalize="none" onChangeText={(text) => setVerificationCode(text)} />
        {loading ? (
          <ActivityIndicator size="large" color="#0000f" />
        ) : (
          <View style={styles.ButtonContainer}>
            <TouchableOpacity onPress={SignIn} style={styles.signupButton} disabled={loading}>
              <Text>Next</Text>
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
