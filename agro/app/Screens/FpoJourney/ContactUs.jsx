import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ContactUs = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    issueType: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    issueType: "",
    description: "",
  });

  const validateForm = () => {
    let valid = true;
    let newErrors = {
      name: "",
      email: "",
      phone: "",
      issueType: "",
      description: "",
    };

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      valid = false;
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must be 10 digits";
      valid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    // Issue type validation
    if (!formData.issueType.trim()) {
      newErrors.issueType = "Issue type is required";
      valid = false;
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      valid = false;
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const response = await fetch("https://agrodhara-18yb.onrender.com/api/fpo/contact/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          Alert.alert("Success", "Your message has been sent successfully.");
          setFormData({
            name: "",
            email: "",
            phone: "",
            issueType: "",
            description: "",
          });
          setErrors({
            name: "",
            email: "",
            phone: "",
            issueType: "",
            description: "",
          });
        } else {
          Alert.alert("Error", data.message || "Something went wrong.");
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to connect to the server.");
      }
    }
  };
  
  return (

<ScrollView>

    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
      </View>

      {/* Top Image */}
      <Image
        source={{
          uri: "https://s3-alpha-sig.figma.com/img/1f1c/34c7/a0297866238c13b96c6b6821c5b68b7d?Expires=1744588800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=R5QUfXwu30Adht88N3ZoegxtSalAmLNkNc606PXCUbny3VfApnyKJHIESXShOriEeX1Od-RCBiCFN62mrXuNMo9rUoBHIK1I~bHgIlEb80d9taTfs3wsKFGLabYgY7Hc9k0Gvp2nbzqHYRomebDi9BuXF6iGzY-uqGCpsZ8eMj4qlfchb6ycZHCrpP5t-boOqehfFuG4Nzw97DLv1X0mWLxAC8kTucFWGJCd-3YT~0rPqIAC1cGHqJaJqDBP54dzLh8gCJoraMJxHyZS0pZuD9KubJnKbBDcbqKeMVVs33fUgMsY3IiVqjfuvcYVR7jzG0m6wp~YKLhX30CcmlB31w__",
        }}
        style={styles.image}
      />

      {/* Title */}
      <Text style={styles.title}>Contact Us</Text>

      {/* Description */}
      <Text style={styles.description}>
        Feel free to use the form or drop us an email. A phone call works too.
      </Text>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Phone No."
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
        />
        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Type of Issue"
          value={formData.issueType}
          onChangeText={(text) => setFormData({ ...formData, issueType: text })}
        />
        {errors.issueType ? <Text style={styles.errorText}>{errors.issueType}</Text> : null}

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
        />
        {errors.description ? (
          <Text style={styles.errorText}>{errors.description}</Text>
        ) : null}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Info */}
      <View style={styles.contactContainer}>
        <View style={styles.contactRow}>
          <Ionicons name="call" size={20} color="green" />
          <Text style={styles.contactText}>+91 80508 XXXXX</Text>
        </View>
        <View style={styles.contactRow}>
          <Ionicons name="mail" size={20} color="green" />
          <Text style={styles.contactText}>support.agrodhara@gmail.com</Text>
        </View>
      </View>
    </View>
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 5,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 15,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#2c3e50",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 30,
    marginBottom: 25,
    color: "#7f8c8d",
    lineHeight: 22,
  },
  form: {
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#27ae60",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  contactContainer: {
    marginTop: 20,
    alignItems: "center",
    paddingBottom: 20,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#34495e",
  },
};

export default ContactUs;