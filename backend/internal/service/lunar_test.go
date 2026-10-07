package service

import (
	"fmt"
	"testing"
)

func TestLunarToSolar(t *testing.T) {
	tests := []struct {
		name      string
		lunarYear int
		lunarMonth int
		lunarDay  int
		isLeap    bool
		expected  string // "YYYY-MM-DD"
	}{
		// Known solar dates for Chinese festivals
		// 2024年
		{"2024春节初一", 2024, 1, 1, false, "2024-02-10"},
		{"2024春节初二", 2024, 1, 2, false, "2024-02-11"},
		{"2024春节初三", 2024, 1, 3, false, "2024-02-12"},
		{"2024春节初四", 2024, 1, 4, false, "2024-02-13"},
		{"2024端午", 2024, 5, 5, false, "2024-06-10"},
		{"2024中秋", 2024, 8, 15, false, "2024-09-17"},

		// 2025年
		{"2025春节初一", 2025, 1, 1, false, "2025-01-29"},
		{"2025春节初二", 2025, 1, 2, false, "2025-01-30"},
		{"2025春节初三", 2025, 1, 3, false, "2025-01-31"},
		{"2025春节初四", 2025, 1, 4, false, "2025-02-01"},
		{"2025端午", 2025, 5, 5, false, "2025-05-31"},
		{"2025中秋", 2025, 8, 15, false, "2025-10-06"},

		// 2023年
		{"2023春节初一", 2023, 1, 1, false, "2023-01-22"},
		{"2023端午", 2023, 5, 5, false, "2023-06-22"},
		{"2023中秋", 2023, 8, 15, false, "2023-09-29"},

		// 2026年 (future)
		{"2026春节初一", 2026, 1, 1, false, "2026-02-17"},
		{"2026端午", 2026, 5, 5, false, "2026-06-19"},
		{"2026中秋", 2026, 8, 15, false, "2026-09-25"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := toSolar(tt.lunarYear, tt.lunarMonth, tt.lunarDay, tt.isLeap)
			resultStr := fmt.Sprintf("%04d-%02d-%02d", result.Year(), result.Month(), result.Day())
			if resultStr != tt.expected {
				t.Errorf("toSolar(%d, %d, %d, %v) = %s, expected %s",
					tt.lunarYear, tt.lunarMonth, tt.lunarDay, tt.isLeap, resultStr, tt.expected)
			}
		})
	}
}

func TestGetChinaHolidays(t *testing.T) {
	// Test 2024 holidays
	holidays, err := GetChinaHolidays(2024)
	if err != nil {
		t.Fatalf("GetChinaHolidays(2024) error: %v", err)
	}

	expected2024 := map[string]bool{
		"01-01": true, // 元旦
		"02-10": true, // 春节初一
		"02-11": true, // 春节初二
		"02-12": true, // 春节初三
		"02-13": true, // 春节初四
		"04-04": true, // 清明节
		"05-01": true, // 劳动节
		"05-02": true, // 劳动节
		"06-10": true, // 端午节
		"09-17": true, // 中秋节
		"10-01": true, // 国庆节
		"10-02": true, // 国庆节
		"10-03": true, // 国庆节
	}

	for key := range expected2024 {
		if holidays[key] != 1 {
			t.Errorf("2024 holiday %s: expected 1, got %d", key, holidays[key])
		}
	}

	// Test 2025 holidays
	holidays2025, err := GetChinaHolidays(2025)
	if err != nil {
		t.Fatalf("GetChinaHolidays(2025) error: %v", err)
	}

	expected2025 := map[string]bool{
		"01-01": true, // 元旦
		"01-29": true, // 春节初一
		"01-30": true, // 春节初二
		"01-31": true, // 春节初三
		"02-01": true, // 春节初四
		"04-04": true, // 清明节
		"05-01": true, // 劳动节
		"05-02": true, // 劳动节
		"05-31": true, // 端午节
		"10-06": true, // 中秋节
		"10-01": true, // 国庆节
		"10-02": true, // 国庆节
		"10-03": true, // 国庆节
	}

	for key := range expected2025 {
		if holidays2025[key] != 1 {
			t.Errorf("2025 holiday %s: expected 1, got %d", key, holidays2025[key])
		}
	}

	t.Logf("2024 holidays: %v", holidays)
	t.Logf("2025 holidays: %v", holidays2025)
}

func TestLunarDate_WithLeapMonth(t *testing.T) {
	// 2023 has a leap month (闰二月)
	// Verify leap month handling doesn't crash
	// In 2023, Chinese New Year is Jan 22 (lunar Jan 1)
	d := LunarDate{Year: 2023, Month: 1, Day: 1, IsLeap: false}
	solar := d.ToSolar()
	expected := "2023-01-22"
	result := fmt.Sprintf("%04d-%02d-%02d", solar.Year(), solar.Month(), solar.Day())
	if result != expected {
		t.Errorf("Leap month test: expected %s, got %s", expected, result)
	}
}

func TestHolidayCache(t *testing.T) {
	// First call computes
	h1, err := GetChinaHolidays(2024)
	if err != nil {
		t.Fatalf("error: %v", err)
	}

	// Second call should use cache
	h2, err := GetChinaHolidays(2024)
	if err != nil {
		t.Fatalf("error: %v", err)
	}

	if len(h1) != len(h2) {
		t.Error("cache returned different data")
	}
}

func TestGetChinaHolidays_InvalidYear(t *testing.T) {
	_, err := GetChinaHolidays(1800)
	if err == nil {
		t.Error("expected error for invalid year")
	}

	_, err = GetChinaHolidays(2200)
	if err == nil {
		t.Error("expected error for invalid year")
	}
}