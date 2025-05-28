import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, LayoutAnimation } from "react-native";

// JSON Data
const TERMS_DATA = [
  { title: "Website Usage", content: "These terms apply to your use of www.Agrodhara.in, any linked pages, API keys, features, content, or application services." },
  { title: "Company Information", content: "Agrodhara Solutions Private Limited is incorporated under the Companies Act, 2013, with its registered office at Flat No. 504, Tower-4, White Orchid, Gaur City-2, Noida, Gautam Buddha Nagar, Uttar Pradesh, India, 201309." },
  { title: "User Agreement", content: "'We', 'Us', 'Our' refer to Agrodhara. 'You', 'Yours', 'Yourself', 'Partners' refer to any individual or corporate entity using Agrodhara services." },
  { title: "Legal Compliance", content: "'Applicable Laws' include any law, rule, regulation, order, directive, or judgment applicable to you and Agrodhara." },
  { title: "Modification of Terms", content: "Agrodhara reserves the right to modify these terms at any time without prior notice. Continued usage signifies acceptance of changes." },
];

const FAQ_DATA = [
  { question: "What is the purpose of this Agrodhara App?", answer: "The purpose of this app is to enable growers and producers of GI tag products to register themselves such that enterprises can reach them for procurement. They can also check if they are within the geographical indicated region to qualify their produce." },
  { question: "On which phone can this app be used?", answer: "The app can be used on Android 5.0 Lollipop and newer versions." },
  { question: "If I uninstall the app or get a new phone, will I lose my data or progress?", answer: "You won’t lose your progress. All data is saved and linked to your account. Once you log in on a new Android device, your data will be restored." },
  { question: "Is the permission and the information I provide into the app confidential?", answer: "Yes, your information is treated confidentially as per the privacy policy that you approve before entering the app." },
  { question: "Do I have to make any payment in this app?", answer: "No, this app does not require any payment. Also, no employee of the company will ask for any payment within the app." },
];

const TermsAndFAQ = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const toggleFAQ = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentContainer}>
        
        {/* Terms and Conditions Section */}
        <Text style={styles.sectionTitle}>Terms And Conditions</Text>
        {TERMS_DATA.map((section, index) => (
          <View key={index} style={styles.bulletContainer}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{section.content}</Text>
          </View>
        ))}
 {/* FAQ Section */}

        <Text style={styles.contact}>
          If you have any queries, contact us at <Text style={styles.email}>Agrodhara1@gmail.com</Text>
        </Text>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQ_DATA.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <TouchableOpacity onPress={() => toggleFAQ(index)} style={styles.faqHeader}>
              <Text style={styles.question}>{faq.question}</Text>
              <Text style={styles.toggleIcon}>{expandedFAQ === index ? "▲" : "▼"}</Text>
            </TouchableOpacity>
            {expandedFAQ === index && <Text style={styles.answer}>{faq.answer}</Text>}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// **Styles**
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  contentContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  bulletContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 18,
    marginRight: 8,
    color: "#000",
  },
  bulletText: {
    fontSize: 15,
    color: "#444",
    flex: 1,
    lineHeight: 20,
  },
  contact: {
    fontSize: 14,
    // textAlign: "center",
    marginBottom: 15,
    color: "#555",
  },
  email: {
    fontWeight: "bold",
    color: "#78a031",
  },
  faqItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  toggleIcon: {
    fontSize: 16,
    color: "black",
  },
  answer: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
    lineHeight: 20,
  },
});

export default TermsAndFAQ;
