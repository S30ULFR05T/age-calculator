import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import Card from '@ant-design/react-native/lib/card';
import DatePicker from '@ant-design/react-native/lib/date-picker';
import List from '@ant-design/react-native/lib/list';
import Flex from '@ant-design/react-native/lib/flex';
import Toast from '@ant-design/react-native/lib/toast';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  FadeInDown,
  Extrapolation,
} from 'react-native-reanimated';
import { AntDesign } from '@expo/vector-icons';
import { calculateAge, AgeCalculationResult } from '@/utils/age-calculator';
import { RangeCalendar } from '@/components/range-calendar';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [result, setResult] = useState<AgeCalculationResult | null>(null);
  const [editingMode, setEditingMode] = useState<boolean>(true);

  // Reanimated shared value for morphing state: 0 = Input Mode, 1 = Result Mode
  const morphProgress = useSharedValue(0);

  // Button scale shared values for micro-animations
  const calcBtnScale = useSharedValue(1);
  const editBtnScale = useSharedValue(1);

  useEffect(() => {
    morphProgress.value = withTiming(editingMode ? 0 : 1, {
      duration: 350,
    });
  }, [editingMode, morphProgress]);

  useEffect(() => {
    const backAction = () => {
      if (!editingMode) {
        setEditingMode(true);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [editingMode]);

  const handleCalculate = () => {
    if (!fromDate || !toDate) {
      Toast.fail('Please select both dates');
      return;
    }

    if (dayjs(fromDate).isAfter(dayjs(toDate), 'day')) {
      Toast.fail({
        content: 'From Date cannot be after To Date',
        duration: 3,
      });
      return;
    }

    const res = calculateAge(fromDate, toDate);
    setResult(res);
    setEditingMode(false);
  };

  const handleEdit = () => {
    setEditingMode(true);
  };

  // Animated styles for morphing transitions (clamped to prevent spring-overshoot jitters)
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(morphProgress.value, [0, 1], [90, 52], Extrapolation.CLAMP),
      marginBottom: interpolate(morphProgress.value, [0, 1], [24, 8], Extrapolation.CLAMP),
      overflow: 'hidden',
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(morphProgress.value, [0, 1], [1, 0.75], Extrapolation.CLAMP);
    const translateY = interpolate(morphProgress.value, [0, 1], [0, -5], Extrapolation.CLAMP);
    return {
      transform: [
        { scale },
        { translateY },
      ],
    };
  });

  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(morphProgress.value, [0, 0.5], [1, 0], Extrapolation.CLAMP),
      height: interpolate(morphProgress.value, [0, 0.5], [20, 0], Extrapolation.CLAMP),
      marginTop: interpolate(morphProgress.value, [0, 0.5], [4, 0], Extrapolation.CLAMP),
      overflow: 'hidden',
    };
  });

  const formFieldsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(morphProgress.value, [0, 0.8], [1, 0], Extrapolation.CLAMP),
      height: interpolate(morphProgress.value, [0, 1], [200, 0], Extrapolation.CLAMP),
      pointerEvents: editingMode ? 'auto' : 'none',
      overflow: 'hidden',
    };
  });

  const summaryRowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(morphProgress.value, [0.2, 1], [0, 1], Extrapolation.CLAMP),
      height: interpolate(morphProgress.value, [0, 1], [0, 44], Extrapolation.CLAMP),
      pointerEvents: editingMode ? 'none' : 'auto',
      overflow: 'hidden',
    };
  });

  // Scale animation helper for Calculate button
  const calcBtnAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: calcBtnScale.value }],
    };
  });

  // Scale animation helper for Edit button
  const editBtnAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: editBtnScale.value }],
    };
  });

  // Formatting helpers
  // const formatDate = (date: Date | null) => {
  //   return date ? dayjs(date).format('DD / MM / YYYY') : '-- / -- / ----';
  // };

  const formatDate = (date: Date | null) => {
    return date ? dayjs(date).format('DD MMMM YYYY') : '-- ---- ----';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: Math.max(16 - insets.bottom, 0) + 12 }]} showsVerticalScrollIndicator={false}>

        {/* Header Section (Animate title to top and smaller in Result Mode) */}
        <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
          <Animated.Text style={[styles.title, titleAnimatedStyle]}>
            {editingMode ? 'Age Calculator' : 'Age Calculation'}
          </Animated.Text>
          <Animated.View style={subtitleAnimatedStyle}>
            <Text style={styles.subtitle}>Calculate your exact age instantly</Text>
          </Animated.View>
        </Animated.View>

        {/* Primary Interactive Card (Morphs from full inputs to compact summary) */}
        <Animated.View style={styles.cardContainer}>
          <Card style={styles.card}>
            <View style={styles.cardBody}>

              {/* Full Input Form (Visible when editingMode = true) */}
              <Animated.View style={formFieldsAnimatedStyle}>
                <Text style={styles.formTitle}>Select Range</Text>

                <List style={styles.list}>
                  {/* From Date Picker */}
                  <DatePicker
                    value={fromDate || undefined}
                    mode="date"
                    minDate={new Date(1900, 0, 1)}
                    maxDate={new Date(2100, 11, 31)}
                    onChange={(date) => setFromDate(date)}
                    format="DD / MM / YYYY"
                    title="Select From Date"
                  >
                    <List.Item
                      arrow="horizontal"
                      style={styles.listItemRow}
                      extra={
                        <Text style={[styles.dateTextVal, fromDate && styles.dateTextSelected]}>
                          {formatDate(fromDate)}
                        </Text>
                      }
                    >
                      <Text style={styles.fieldLabel}>From Date</Text>
                    </List.Item>
                  </DatePicker>

                  {/* To Date Picker */}
                  <DatePicker
                    value={toDate}
                    mode="date"
                    minDate={new Date(1900, 0, 1)}
                    maxDate={new Date(2100, 11, 31)}
                    onChange={(date) => setToDate(date)}
                    format="DD / MM / YYYY"
                    title="Select To Date"
                  >
                    <List.Item
                      arrow="horizontal"
                      style={styles.listItemRow}
                      extra={
                        <Text style={[styles.dateTextVal, toDate && styles.dateTextSelected]}>
                          {formatDate(toDate)}
                        </Text>
                      }
                    >
                      <Text style={styles.fieldLabel}>To Date</Text>
                    </List.Item>
                  </DatePicker>
                </List>

                {/* Calculate Button (Microscale animated) */}
                <Animated.View style={[styles.calcButtonWrapper, calcBtnAnimatedStyle]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={!fromDate || !toDate}
                    onPressIn={() => {
                      calcBtnScale.value = withTiming(0.95, { duration: 100 });
                    }}
                    onPressOut={() => {
                      calcBtnScale.value = withSpring(1);
                    }}
                    onPress={handleCalculate}
                    style={[
                      styles.calculateButton,
                      (!fromDate || !toDate) && styles.calculateButtonDisabled,
                    ]}
                  >
                    <Text style={styles.calculateButtonText}>Calculate Age</Text>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>

              {/* Compact Summary View (Visible when editingMode = false) */}
              <Animated.View style={summaryRowAnimatedStyle}>
                <Flex justify="between" align="center" style={styles.summaryFlex}>
                  <View style={styles.summaryDates}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>From:</Text>
                      <Text style={styles.summaryValue}>{formatDate(fromDate)}</Text>
                    </View>
                    <View style={[styles.summaryRow, { marginTop: 4 }]}>
                      <Text style={styles.summaryLabel}>To:</Text>
                      <Text style={styles.summaryValue}>{formatDate(toDate)}</Text>
                    </View>
                  </View>

                  <Animated.View style={editBtnAnimatedStyle}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPressIn={() => {
                        editBtnScale.value = withTiming(0.85, { duration: 100 });
                      }}
                      onPressOut={() => {
                        editBtnScale.value = withSpring(1);
                      }}
                      onPress={handleEdit}
                      style={styles.editButton}
                    >
                      <AntDesign name="edit" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                  </Animated.View>
                </Flex>
              </Animated.View>
            </View>
          </Card>
        </Animated.View>

        {/* Results and Calendar Section (Rendered conditionally when not editing) */}
        {!editingMode && result && (
          <View style={styles.resultsContainer}>

            {/* Age Breakdown Card */}
            <Animated.View
              entering={FadeInDown.duration(400)}
              style={styles.resultCardWrapper}
            >
              <View style={styles.sectionHeaderContainer}>
                <AntDesign
                  name="calendar"
                  size={18}
                  color="#1677FF"
                  style={styles.sectionHeaderIcon}
                />
                <Text style={styles.sectionHeader}>Age Breakdown</Text>
              </View>
              <Card style={styles.card}>
                {/* <Card.Header
                  title={
                    <View style={styles.cardHeaderRow}>
                      <AntDesign name={"calendar" as any} size={16} color="#1677FF" style={styles.headerIcon} />
                      <Text style={styles.cardHeaderTitle}>Age Breakdown</Text>
                    </View>
                  }
                /> */}
                <View style={styles.resultsCardBody}>
                  {/* Primary result display */}
                  <View style={styles.primaryResultContainer}>
                    <Text style={styles.primaryResultVal}>
                      {result.years > 0
                        ? `${result.years} year${result.years > 1 ? 's' : ''} ${result.months} month${result.months !== 1 ? 's' : ''} ${result.days} day${result.days !== 1 ? 's' : ''}`
                        : `${result.months} month${result.months !== 1 ? 's' : ''} ${result.days} day${result.days !== 1 ? 's' : ''}`
                      }
                    </Text>
                    <Text style={styles.primaryResultLabel}>Exact Age</Text>
                  </View>

                  {/* Staggered result formats */}
                  <View style={styles.listContainer}>
                    {[
                      {
                        label: 'Weeks & Days',
                        value: `${result.weeks} week${result.weeks !== 1 ? 's' : ''} ${result.remainingDays} day${result.remainingDays !== 1 ? 's' : ''}`,
                        icon: 'calendar',
                      },
                      {
                        label: 'Total Days',
                        value: `${formatNumber(result.totalDays)} days`,
                        icon: 'schedule',
                      },
                      {
                        label: 'Total Hours',
                        value: `${formatNumber(result.totalHours)} hours`,
                        icon: 'hourglass',
                      },
                      {
                        label: 'Total Minutes',
                        value: `${formatNumber(result.totalMinutes)} minutes`,
                        icon: 'sync',
                      },
                      {
                        label: 'Total Seconds',
                        value: `${formatNumber(result.totalSeconds)} seconds`,
                        icon: 'dashboard',
                      },
                    ].map((item, index) => (
                      <Animated.View
                        key={item.label}
                        entering={FadeInDown.delay(index * 80).duration(300)}
                        style={styles.listItemWrapper}
                      >
                        <Flex justify="between" align="center" style={styles.listItem}>
                          <Flex align="center">
                            <AntDesign name={item.icon as any} size={16} color="#818CF8" style={styles.listIcon} />
                            <Text style={styles.listItemLabel}>{item.label}</Text>
                          </Flex>
                          <Text style={styles.listItemVal}>{item.value}</Text>
                        </Flex>
                      </Animated.View>
                    ))}
                  </View>
                </View>
              </Card>
            </Animated.View>

            {/* Calendar Section */}
            <Animated.View
              entering={FadeInDown.delay(500).duration(400)}
              style={styles.calendarWrapper}
            >
              <View style={styles.sectionHeaderContainer}>
                <AntDesign
                  name="calendar"
                  size={18}
                  color="#1677FF"
                  style={styles.sectionHeaderIcon}
                />
                <Text style={styles.sectionHeader}>Visual Range Preview</Text>
              </View>
              <RangeCalendar fromDate={fromDate} toDate={toDate} />
            </Animated.View>

            {/* Inline Footer below visual calendar in breakdown mode */}
            <Text style={styles.inlineFooter}>
              designed and developed by S30ULFR05T
            </Text>
          </View>
        )}

      </ScrollView>

      {/* Absolute footer shown ONLY in editingMode (select range screen) */}
      {editingMode && (
        <Text style={[styles.footer, { bottom: Math.max(insets.bottom, 16) + 12 }]}>
          designed and developed by S30ULFR05T
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F7F8FC', // Premium soft gray background
    backgroundColor: '#000000',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.5,
    marginTop: 6
  },
  subtitle: {
    fontSize: 14,
    color: '#A3A3A3',
    fontWeight: '500',
    textAlign: 'center',
  },
  cardContainer: {
    marginVertical: 8,
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#18191D',
    borderWidth: 1,
    borderColor: '#26272B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  list: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  listItemRow: {
    backgroundColor: 'transparent',
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  dateTextVal: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  dateTextSelected: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  calcButtonWrapper: {
    marginTop: 20,
    width: '100%',
  },
  calculateButton: {
    height: 52,
    backgroundColor: '#1677FF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1677FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  calculateButtonDisabled: {
    backgroundColor: '#374151',
    shadowOpacity: 0,
    elevation: 0,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryFlex: {
    width: '100%',
  },
  summaryDates: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    width: 45,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#132F4C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    marginTop: 16,
  },
  resultCardWrapper: {
    marginBottom: 20,
  },
  resultsCardBody: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
  },
  headerIcon: {
    marginRight: 8,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  primaryResultContainer: {
    alignItems: 'center',
    backgroundColor: '#132035',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1D3557',
  },
  primaryResultVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3B82F6',
    textAlign: 'center',
  },
  primaryResultLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContainer: {
    gap: 10,
  },
  listItemWrapper: {
    width: '100%',
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1E1F28',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2B2C38',
  },
  listIcon: {
    marginRight: 10,
  },
  listItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  listItemVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionHeaderIcon: {
    marginRight: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 0,
  },
  calendarWrapper: {
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    fontSize: 10,
    color: '#4B5563',
    textAlign: 'center',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  inlineFooter: {
    fontSize: 10,
    color: '#4B5563',
    textAlign: 'center',
    letterSpacing: 0.5,
    fontWeight: '500',
    marginTop: 24,
  },
});
