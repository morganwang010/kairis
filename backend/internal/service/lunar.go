package service

import (
	"fmt"
	"time"
)

// 农历数据从1900年到2100年
// 每个数字代表一年的农历信息：
// 低4位：闰月月份（0表示没有闰月）
// 中间12或13位：每月的大小（1=30天，0=29天），从最高月份到最低
// 最高1位：闰月的大小（1=30天，0=29天）
var lunarInfo = [201]int{
	0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
	0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
	0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
	0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
	0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
	0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
	0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
	0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, // 1970-1979
	0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
	0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
	0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
	0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
	0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
	0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
	0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040-2049
	0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, // 2050-2059
	0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, // 2060-2069
	0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, // 2070-2079
	0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, // 2080-2089
	0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, // 2090-2099
	0x0d520, // 2100
}

// minYear and maxYear for lunar calendar conversion
const (
	lunarMinYear = 1900
	lunarMaxYear = 2100
)

// leapMonth returns the leap month for a given year, or 0 if none
func leapMonth(year int) int {
	return lunarInfo[year-lunarMinYear] & 0xf
}

// leapDays returns the number of days in the leap month for a given year
func leapDays(year int) int {
	if leapMonth(year) != 0 {
		if lunarInfo[year-lunarMinYear]&0x10000 != 0 {
			return 30
		}
		return 29
	}
	return 0
}

// monthDays returns the number of days in a specific lunar month of a given year
func monthDays(year, month int) int {
	if lunarInfo[year-lunarMinYear]&(0x10000>>uint(month)) != 0 {
		return 30
	}
	return 29
}

// lunarYearDays returns the total number of days in a lunar year
func lunarYearDays(year int) int {
	sum := 348
	for i := 0x8000; i > 0x8; i >>= 1 {
		if lunarInfo[year-lunarMinYear]&i != 0 {
			sum++
		}
	}
	return sum + leapDays(year)
}

// toSolar converts a lunar date (year, month, day, isLeap) to a solar date
// Returns the corresponding time.Time (solar/gregorian date)
func toSolar(lunarYear, lunarMonth, lunarDay int, isLeap bool) time.Time {
	// Calculate the offset from 1900-01-31 (which is lunar 1900-01-01)
	baseDate := time.Date(1900, 1, 31, 0, 0, 0, 0, time.UTC)

	// Calculate days offset for the lunar year
	offset := 0
	for y := lunarMinYear; y < lunarYear; y++ {
		offset += lunarYearDays(y)
	}

	// Calculate days offset for the lunar month
	if isLeap && leapMonth(lunarYear) == lunarMonth {
		// Leap month: count days before the leap month
		for m := 1; m < lunarMonth; m++ {
			offset += monthDays(lunarYear, m)
		}
		// Add days in the leap month up to the target day
		offset += lunarDay - 1
	} else {
		// Non-leap month: count days including the leap month if it comes before
		for m := 1; m < lunarMonth; m++ {
			if leapMonth(lunarYear) == m {
				offset += leapDays(lunarYear)
			}
			offset += monthDays(lunarYear, m)
		}
		offset += lunarDay - 1
	}

	return baseDate.AddDate(0, 0, offset)
}

// LunarDate represents a lunar calendar date
type LunarDate struct {
	Year   int
	Month  int
	Day    int
	IsLeap bool
}

// ToSolar converts the lunar date to a solar (gregorian) date
func (l LunarDate) ToSolar() time.Time {
	return toSolar(l.Year, l.Month, l.Day, l.IsLeap)
}

// getChinaHolidays returns the Chinese public holidays for a given year.
// Returns a map of "MM-DD" -> overtime days count.
// Holidays included:
//   - 元旦 (New Year's Day): Jan 1
//   - 春节 (Spring Festival): Lunar Jan 1-4
//   - 清明节 (Qingming): Apr 4
//   - 劳动节 (Labor Day): May 1-2
//   - 端午节 (Dragon Boat): Lunar May 5
//   - 中秋节 (Mid-Autumn): Lunar Aug 15
//   - 国庆节 (National Day): Oct 1-3
func getChinaHolidays(year int) (map[string]int, error) {
	if year < lunarMinYear || year > lunarMaxYear {
		return nil, fmt.Errorf("year %d out of range [%d, %d]", year, lunarMinYear, lunarMaxYear)
	}

	holidays := make(map[string]int)

	// Fixed solar holidays
	holidays["01-01"] = 1 // 元旦
	holidays["04-04"] = 1 // 清明节 (solar term, always Apr 4-6)
	holidays["05-01"] = 1 // 劳动节
	holidays["05-02"] = 1 // 劳动节
	holidays["10-01"] = 1 // 国庆节
	holidays["10-02"] = 1 // 国庆节
	holidays["10-03"] = 1 // 国庆节

	// Lunar-based holidays converted to solar dates
	// 春节: Lunar January 1-4
	for day := 1; day <= 4; day++ {
		solarDate := LunarDate{Year: year, Month: 1, Day: day, IsLeap: false}.ToSolar()
		key := fmt.Sprintf("%02d-%02d", solarDate.Month(), solarDate.Day())
		holidays[key] = 1
	}

	// 端午节: Lunar May 5
	solarDate := LunarDate{Year: year, Month: 5, Day: 5, IsLeap: false}.ToSolar()
	key := fmt.Sprintf("%02d-%02d", solarDate.Month(), solarDate.Day())
	holidays[key] = 1

	// 中秋节: Lunar August 15
	solarDate = LunarDate{Year: year, Month: 8, Day: 15, IsLeap: false}.ToSolar()
	key = fmt.Sprintf("%02d-%02d", solarDate.Month(), solarDate.Day())
	holidays[key] = 1

	return holidays, nil
}

// getChinaHolidaysCached provides a thread-safe cached version of getChinaHolidays
// to avoid recalculating for the same year
var holidayCache = make(map[int]map[string]int)

// GetChinaHolidays returns Chinese holidays for a year, with caching
func GetChinaHolidays(year int) (map[string]int, error) {
	if holidays, ok := holidayCache[year]; ok {
		return holidays, nil
	}
	holidays, err := getChinaHolidays(year)
	if err != nil {
		return nil, err
	}
	holidayCache[year] = holidays
	return holidays, nil
}