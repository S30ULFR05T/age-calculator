import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { AntDesign } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Particle config for the floating background animation
const PARTICLES = [
  { id: 1, size: 8, x: width * 0.15, y: height * 0.2, delay: 0, speed: 3000 },
  { id: 2, size: 12, x: width * 0.8, y: height * 0.15, delay: 500, speed: 4500 },
  { id: 3, size: 6, x: width * 0.75, y: height * 0.6, delay: 200, speed: 3500 },
  { id: 4, size: 10, x: width * 0.2, y: height * 0.75, delay: 800, speed: 4000 },
  { id: 5, size: 8, x: width * 0.5, y: height * 0.4, delay: 300, speed: 5000 },
];

export default function SplashScreen() {
  const router = useRouter();

  // Logo Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(0);
  const logoGlow = useSharedValue(0.9);

  // Text Animation values
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subOpacity = useSharedValue(0);
  const subTranslateY = useSharedValue(20);

  // Background gradient glow movement
  const glowTranslateX = useSharedValue(-50);
  const glowTranslateY = useSharedValue(-50);

  useEffect(() => {
    // 1. Logo scale and fade in
    logoScale.value = withDelay(
      300,
      withSpring(1, {
        damping: 10,
        stiffness: 80,
      })
    );
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));

    // 2. Logo rotation swing
    logoRotate.value = withDelay(
      300,
      withSpring(1, {
        damping: 12,
        stiffness: 90,
      })
    );

    // 3. Logo pulse glow loop
    logoGlow.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // 4. Background glow drift loop
    glowTranslateX.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-50, { duration: 6000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    glowTranslateY.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-50, { duration: 5000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // 5. Title text reveal
    titleOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
    titleTranslateY.value = withDelay(
      800,
      withSpring(0, { damping: 12, stiffness: 90 })
    );

    // 6. Subtitle text reveal
    subOpacity.value = withDelay(1200, withTiming(1, { duration: 800 }));
    subTranslateY.value = withDelay(
      1200,
      withSpring(0, { damping: 12, stiffness: 90 })
    );

    // 7. Auto navigation to Home screen after animation (approx. 2.7 seconds)
    const timeout = setTimeout(() => {
      router.replace('/home');
    }, 2800);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => {
    const rotate = logoRotate.value;
    return {
      opacity: logoOpacity.value,
      transform: [
        { scale: logoScale.value },
        {
          rotate: `${rotate * 360}deg`,
        },
      ],
    };
  });

  const glowRingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoGlow.value }],
      opacity: logoOpacity.value * 0.35,
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }],
    };
  });

  const subAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: subOpacity.value,
      transform: [{ translateY: subTranslateY.value }],
    };
  });

  const backgroundGlowStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: glowTranslateX.value },
        { translateY: glowTranslateY.value },
      ],
    };
  });

  return (
    <View style={styles.container}>
      {/* Dynamic Ambient Background Glows */}
      <Animated.View style={[styles.glowPrimary, backgroundGlowStyle]} />
      <View style={styles.glowSecondary} />

      {/* Floating Particles */}
      {PARTICLES.map((p) => {
        return <FloatingParticle key={p.id} {...p} />;
      })}

      <View style={styles.content}>
        {/* Logo Container with glowing ring */}
        <View style={styles.logoWrapper}>
          <Animated.View style={[styles.glowRing, glowRingStyle]} />
          <Animated.View style={[styles.logoBadge, logoAnimatedStyle]}>
            <AntDesign name="calendar" size={54} color="white" />
          </Animated.View>
        </View>

        {/* Branding Title & Subtitle */}
        <View style={styles.textContainer}>
          <Animated.Text style={[styles.title, titleAnimatedStyle]}>
            Age Calculator
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, subAnimatedStyle]}>
            Calculate your exact age instantly
          </Animated.Text>
        </View>
      </View>
    </View>
  );
}

// Subcomponent for individual floating particles
function FloatingParticle({
  size,
  x,
  y,
  delay,
  speed,
}: {
  size: number;
  x: number;
  y: number;
  delay: number;
  speed: number;
}) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-40, { duration: speed, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: speed, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: speed / 2 }),
          withTiming(0.1, { duration: speed / 2 })
        ),
        -1,
        true
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const particleStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: x,
          top: y,
        },
        particleStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A', // Sleek dark midnight background
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glowPrimary: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: '#1677FF',
    opacity: 0.15,
    filter: 'blur(60px)',
    top: height * 0.1,
    left: -50,
  },
  glowSecondary: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: '#6C63FF',
    opacity: 0.15,
    filter: 'blur(60px)',
    bottom: height * 0.1,
    right: -50,
  },
  particle: {
    position: 'absolute',
    backgroundColor: 'white',
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logoWrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1677FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  glowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#1677FF',
    opacity: 0.35,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#8C9BAE',
    fontWeight: '500',
    textAlign: 'center',
  },
});
