import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  Animated
} from 'react-native';

const DistrictFactsCarousel = ({ districtFacts, loading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading && districtFacts.length > 1) {
      const interval = setInterval(() => {
        // Start sliding out to the left
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
          useNativeDriver: true
        }).start(() => {
          // Reset position off-screen to the right and update index
          slideAnim.setValue(100);
          setCurrentIndex((prevIndex) => (prevIndex + 1) % districtFacts.length);
          
          // Slide in from the right
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
          }).start();
        });
      }, 4000); // Change every 4 seconds
      
      return () => clearInterval(interval);
    }
  }, [districtFacts, loading]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>DISTRICT HIGHLIGHTS</Text>
      
      {loading ? (
        <ActivityIndicator size="small" color="#3a7d5c" />
      ) : districtFacts.length > 0 ? (
        <View style={styles.factContainer}>
          <Animated.View 
            style={[
              styles.factCard,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <Text style={styles.factText}>{districtFacts[currentIndex]}</Text>
          </Animated.View>
        </View>
      ) : (
        <Text style={styles.factText}>No facts available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
   fontWeight: '800', // or
fontWeight: 'bold',
    color: '#2f3f38',
    letterSpacing: 1,
    marginBottom: 12,
  },
  factContainer: {
    height: 100, // Fixed height to prevent layout jumps
    justifyContent: 'center',
    padddingVertical: 20,
  },
  factCard: {
    paddingVertical: 12,
    position: 'absolute',
    width: '100%',
  },
  factText: {
    fontSize: 16,
    color: '#2a5c4a',
    lineHeight: 22,
  },
});

export default DistrictFactsCarousel;