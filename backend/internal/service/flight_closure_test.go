package service

import (
	"kairis/backend/internal/model"
	"testing"
	"time"
)

func TestExtractRouteKey(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		wantKey string
	}{
		{
			name:    "china_jakarta go flight",
			input:   "CA997|go|china_jakarta|2024-02-10",
			wantKey: "china_jakarta",
		},
		{
			name:    "jakarta_china return flight",
			input:   "CA998|return|jakarta_china|2024-03-01",
			wantKey: "jakarta_china",
		},
		{
			name:    "jakarta_site go flight",
			input:   "CA999|go|jakarta_site|2024-02-15",
			wantKey: "jakarta_site",
		},
		{
			name:    "site_jakarta return flight",
			input:   "CA000|return|site_jakarta|2024-02-28",
			wantKey: "site_jakarta",
		},
		{
			name:    "empty input",
			input:   "",
			wantKey: "",
		},
		{
			name:    "malformed no pipe",
			input:   "CA997",
			wantKey: "",
		},
		{
			name:    "only two parts",
			input:   "CA997|go",
			wantKey: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := extractRouteKey(tt.input)
			if got != tt.wantKey {
				t.Errorf("extractRouteKey(%q) = %q, want %q", tt.input, got, tt.wantKey)
			}
		})
	}
}

func TestRoutePairMap(t *testing.T) {
	tests := []struct {
		goRoute     string
		wantReturn  string
		shouldExist bool
	}{
		{"china_jakarta", "jakarta_china", true},
		{"jakarta_site", "site_jakarta", true},
		{"jakarta_china", "", false},
		{"site_jakarta", "", false},
		{"invalid_key", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.goRoute, func(t *testing.T) {
			got, ok := routePairMap[tt.goRoute]
			if tt.shouldExist && (!ok || got != tt.wantReturn) {
				t.Errorf("routePairMap[%q] = (%q, %v), want (%q, true)", tt.goRoute, got, ok, tt.wantReturn)
			}
			if !tt.shouldExist && ok {
				t.Errorf("routePairMap[%q] should not exist but got %q", tt.goRoute, got)
			}
		})
	}
}

func TestCalculateTripClosure_Matching(t *testing.T) {
	t.Run("matched china-jakarta pair", func(t *testing.T) {
		raws := []model.FlightRaw{
			{
				ID:        1,
				EmployeeID: 1,
				FlightType: "go",
				FlightInfo: "CA997|go|china_jakarta|2024-02-10",
			},
			{
				ID:        2,
				EmployeeID: 1,
				FlightType: "return",
				FlightInfo: "CA998|return|jakarta_china|2024-03-01",
			},
		}

		matched := make(map[int]bool)
		for _, g := range []model.FlightRaw{raws[0]} {
			goKey := extractRouteKey(g.FlightInfo)
			expectedReturnKey := routePairMap[goKey]
			if expectedReturnKey == "" {
				continue
			}
			for _, r := range []model.FlightRaw{raws[1]} {
				returnKey := extractRouteKey(r.FlightInfo)
				if returnKey == expectedReturnKey {
					matched[1] = true
					matched[2] = true
				}
			}
		}
		if len(matched) != 2 {
			t.Errorf("Expected 2 matched records, got %d", len(matched))
		}
	})

	t.Run("matched jakarta-site pair", func(t *testing.T) {
		goKey := extractRouteKey("CA999|go|jakarta_site|2024-02-15")
		returnKey := extractRouteKey("CA000|return|site_jakarta|2024-02-28")

		if routePairMap[goKey] != returnKey {
			t.Errorf("Route pair mismatch: go=%q, return=%q", goKey, returnKey)
		}
	})

	t.Run("unmatched return has no go pair", func(t *testing.T) {
		goKey := extractRouteKey("CA001|go|unknown_route|2024-04-10")
		if _, ok := routePairMap[goKey]; ok {
			t.Errorf("unknown_route should not have a pair")
		}
	})
}

func TestCalculateTripClosure_TimeProximity(t *testing.T) {
	t.Run("closest return matched", func(t *testing.T) {
		baseTime := time.Date(2024, 2, 10, 0, 0, 0, 0, time.UTC)

		goRaw := model.FlightRaw{
			ID:         1,
			EmployeeID: 1,
			FlightType: "go",
			FlightInfo: "CA997|go|china_jakarta|2024-02-10",
			DepartTime: &baseTime,
		}

		closerReturn := model.FlightRaw{
			ID:         2,
			EmployeeID: 1,
			FlightType: "return",
			FlightInfo: "CA998|return|jakarta_china|2024-03-01",
			DepartTime: timePtr(baseTime.Add(20 * 24 * time.Hour)),
		}

		fartherReturn := model.FlightRaw{
			ID:         3,
			EmployeeID: 1,
			FlightType: "return",
			FlightInfo: "CA999|return|jakarta_china|2024-06-01",
			DepartTime: timePtr(baseTime.Add(120 * 24 * time.Hour)),
		}

		goKey := extractRouteKey(goRaw.FlightInfo)
		expectedReturnKey := routePairMap[goKey]

		var bestMatch *model.FlightRaw
		var bestDiff time.Duration

		returnRaws := []*model.FlightRaw{&closerReturn, &fartherReturn}
		for _, r := range returnRaws {
			returnKey := extractRouteKey(r.FlightInfo)
			if returnKey != expectedReturnKey {
				continue
			}
			diff := r.DepartTime.Sub(*goRaw.DepartTime)
			if diff < 0 {
				diff = -diff
			}
			if bestMatch == nil || diff < bestDiff {
				bestMatch = r
				bestDiff = diff
			}
		}

		if bestMatch == nil || bestMatch.ID != 2 {
			t.Errorf("Expected closer return (id=2) to be matched, got %v", bestMatch)
		}
		t.Logf("Best match diff: %v", bestDiff)
	})
}

func TestCalculateTripClosure_MultipleRecords(t *testing.T) {
	t.Run("multiple mixed routes", func(t *testing.T) {
		raws := []struct {
			id    uint
			info  string
			ftype string
		}{
			{1, "CA997|go|china_jakarta|2024-02-10", "go"},
			{2, "CA999|go|jakarta_site|2024-02-15", "go"},
			{3, "CA000|return|site_jakarta|2024-02-28", "return"},
			{4, "CA998|return|jakarta_china|2024-03-01", "return"},
		}

		var goRaws, returnRaws []struct {
			id   uint
			info string
		}
		for _, r := range raws {
			if r.ftype == "go" {
				goRaws = append(goRaws, struct {
					id   uint
					info string
				}{r.id, r.info})
			} else {
				returnRaws = append(returnRaws, struct {
					id   uint
					info string
				}{r.id, r.info})
			}
		}

		matched := make(map[uint]bool)
		for _, g := range goRaws {
			goKey := extractRouteKey(g.info)
			expectedReturnKey := routePairMap[goKey]
			if expectedReturnKey == "" {
				continue
			}
			for _, r := range returnRaws {
				if matched[r.id] {
					continue
				}
				returnKey := extractRouteKey(r.info)
				if returnKey == expectedReturnKey {
					matched[g.id] = true
					matched[r.id] = true
					break
				}
			}
		}

		if len(matched) != 4 {
			t.Errorf("Expected 4 matched records (2 closed pairs), got %d", len(matched))
		}
		t.Logf("Matched IDs: %v", matched)
	})
}

func timePtr(t time.Time) *time.Time {
	return &t
}