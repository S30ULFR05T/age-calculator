import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import dayjs from 'dayjs';
import { AntDesign } from '@expo/vector-icons';

interface RangeCalendarProps {
  fromDate: Date | null;
  toDate: Date | null;
}

export function RangeCalendar({ fromDate, toDate }: RangeCalendarProps) {
  // Default to today if no date is selected
  const initialDate = fromDate ? dayjs(fromDate) : dayjs();
  const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(initialDate);

  const fromDateDay = fromDate ? dayjs(fromDate).startOf('day') : null;
  const toDateDay = toDate ? dayjs(toDate).startOf('day') : null;

  const startOfMonth = currentMonth.startOf('month');
  const startDayOfWeek = startOfMonth.day(); // 0 for Sunday
  const daysInMonth = currentMonth.daysInMonth();
  const prevMonth = currentMonth.subtract(1, 'month');
  const prevMonthDays = prevMonth.daysInMonth();
  const nextMonth = currentMonth.add(1, 'month');

  // Generate 42 days for a grid representing 6 weeks
  const days: { date: dayjs.Dayjs; isCurrentMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    if (i < startDayOfWeek) {
      const dateVal = prevMonthDays - startDayOfWeek + i + 1;
      days.push({
        date: prevMonth.date(dateVal),
        isCurrentMonth: false,
      });
    } else if (i < startDayOfWeek + daysInMonth) {
      const dateVal = i - startDayOfWeek + 1;
      days.push({
        date: currentMonth.date(dateVal),
        isCurrentMonth: true,
      });
    } else {
      const dateVal = i - startDayOfWeek - daysInMonth + 1;
      days.push({
        date: nextMonth.date(dateVal),
        isCurrentMonth: false,
      });
    }
  }

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <AntDesign name="left" size={16} color="#1677FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentMonth.format('MMMM YYYY')}</Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <AntDesign name="right" size={16} color="#1677FF" />
        </TouchableOpacity>
      </View>

      {/* Weekdays Row */}
      <View style={styles.weekdaysContainer}>
        {weekdays.map((day) => (
          <Text key={day} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.grid}>
        {days.map((item, idx) => {
          const itemDay = item.date.startOf('day');
          const isStart = fromDateDay ? itemDay.isSame(fromDateDay, 'day') : false;
          const isEnd = toDateDay ? itemDay.isSame(toDateDay, 'day') : false;
          
          let isInBetween = false;
          if (fromDateDay && toDateDay) {
            isInBetween = itemDay.isAfter(fromDateDay, 'day') && itemDay.isBefore(toDateDay, 'day');
          }

          const hasRange = fromDateDay && toDateDay && toDateDay.isAfter(fromDateDay, 'day');

          return (
            <View key={idx} style={styles.cell}>
              {/* Background track highlight */}
              {hasRange && (isInBetween || isStart || isEnd) && (
                <View
                  style={[
                    styles.trackHighlight,
                    isStart && styles.trackStart,
                    isEnd && styles.trackEnd,
                    isInBetween && styles.trackMiddle,
                  ]}
                />
              )}

              {/* Day Circle */}
              <View
                style={[
                  styles.dayCircle,
                  (isStart || isEnd) && styles.activeDayCircle,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    !item.isCurrentMonth && styles.inactiveDayText,
                    isInBetween && styles.inBetweenDayText,
                    (isStart || isEnd) && styles.activeDayText,
                  ]}
                >
                  {item.date.date()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    color: '#8C8C8C',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  cell: {
    width: '14.28%',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    position: 'relative',
  },
  trackHighlight: {
    position: 'absolute',
    height: 32,
    backgroundColor: '#E6F4FE',
    zIndex: 1,
  },
  trackStart: {
    left: '50%',
    right: 0,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  trackEnd: {
    left: 0,
    right: '50%',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  trackMiddle: {
    left: 0,
    right: 0,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  activeDayCircle: {
    backgroundColor: '#1677FF',
    shadowColor: '#1677FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  dayText: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
  },
  inBetweenDayText: {
    color: '#1677FF',
    fontWeight: 'bold',
  },
  activeDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inactiveDayText: {
    color: '#BFBFBF',
  },
});
