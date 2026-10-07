package service

import (
	"fmt"
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
	"log/slog"
	"regexp"
	"strconv"
	"strings"
	"time"
)

type ImportFlightRequest struct {
	Flights []ImportFlightItem `json:"flights"`
}

type ImportFlightItem struct {
	EmployeeID         string            `json:"employee_id"`
	ProjectID          int               `json:"project_id"`
	Month              string            `json:"month"`
	FlightNum          string            `json:"flight_num"`
	DepartDestination  string            `json:"depart_destination"`
	JakartaChina       string            `json:"jakarta_china"`
	ChinaJakarta       string            `json:"china_jakarta"`
	JakartaSite        string            `json:"jakarta_site"`
	SiteJakarta        string            `json:"site_jakarta"`
	ReturnDestination  string            `json:"return_destination"`
	ReturnJakarta      string            `json:"return_jakarta"`
	ReturnChinaJakarta string            `json:"return_china_jakarta"`
	ReturnJakartaSite  string            `json:"return_jakarta_site"`
	ReturnSiteJakarta  string            `json:"return_site_jakarta"`
	Category           int               `json:"category"`
	FlightRaws         []ImportFlightRaw `json:"flight_raws,omitempty"`
}

type ImportFlightRaw struct {
	FlightNo   string `json:"flight_no"`
	FlightType string `json:"flight_type"`
	DepartTime string `json:"depart_time"`
	ArriveTime string `json:"arrive_time"`
	FlightInfo string `json:"flight_info"`
	TripStatus string `json:"trip_status"`
}

type FlightService struct {
	flightRepo    *repository.FlightRepository
	flightRawRepo *repository.FlightRawRepository
}

func NewFlightService(flightRepo *repository.FlightRepository, flightRawRepo *repository.FlightRawRepository) *FlightService {
	return &FlightService{
		flightRepo:    flightRepo,
		flightRawRepo: flightRawRepo,
	}
}

func (s *FlightService) CreateFlight(flight *model.Flights) error {
	if err := s.flightRepo.Create(flight); err != nil {
		return err
	}
	// Auto-populate flight_raws from flat route fields
	if err := s.EnsureFlightRawsFromFlights(flight); err != nil {
		slog.Warn("Failed to ensure flight raws on create", "error", err, "employee_id", flight.EmployeeID)
	}
	return nil
}

func (s *FlightService) GetFlightByID(id uint) (*model.Flights, error) {
	return s.flightRepo.GetByID(id)
}

func (s *FlightService) ListFlights(offset, limit int, projectID, month, employeeID, employeeName string) ([]repository.FlightWithEmployee, int64, error) {
	return s.flightRepo.List(offset, limit, projectID, month, employeeID, employeeName)
}

func (s *FlightService) UpdateFlight(flight *model.Flights) error {
	if err := s.flightRepo.Update(flight); err != nil {
		return err
	}
	// Re-sync flight_raws from updated flat route fields
	if err := s.EnsureFlightRawsFromFlights(flight); err != nil {
		slog.Warn("Failed to ensure flight raws on update", "error", err, "employee_id", flight.EmployeeID)
	}
	return nil
}

func (s *FlightService) DeleteFlight(id uint) error {
	return s.flightRepo.Delete(id)
}

func (s *FlightService) DeleteFlightByIDs(ids []uint) error {
	return s.flightRepo.DeleteByIDs(ids)
}

func (s *FlightService) ImportFlight(req ImportFlightRequest) error {
	for _, item := range req.Flights {
		existing, err := s.flightRepo.GetByEmployeeIDAndMonth(item.EmployeeID, item.Month, item.ProjectID)
		if err == nil && len(existing) > 0 {
			slog.Info("Updating existing flight", "employee_id", item.EmployeeID, "project_id", item.ProjectID, "month", item.Month)
			flightModel := &model.Flights{
				ID:                 existing[0].ID,
				EmployeeID:         item.EmployeeID,
				ProjectID:          item.ProjectID,
				Month:              item.Month,
				FlightNum:          item.FlightNum,
				DepartDestination:  item.DepartDestination,
				JakartaChina:       item.JakartaChina,
				ChinaJakarta:       item.ChinaJakarta,
				JakartaSite:        item.JakartaSite,
				SiteJakarta:        item.SiteJakarta,
				ReturnDestination:  item.ReturnDestination,
				ReturnJakarta:      item.ReturnJakarta,
				ReturnChinaJakarta: item.ReturnChinaJakarta,
				ReturnJakartaSite:  item.ReturnJakartaSite,
				ReturnSiteJakarta:  item.ReturnSiteJakarta,
				Category:           item.Category,
			}
			if err := s.flightRepo.Update(flightModel); err != nil {
				slog.Error("Failed to update flight", "error", err, "employee_id", item.EmployeeID)
				return err
			}
			if err := s.EnsureFlightRawsFromFlights(flightModel); err != nil {
				slog.Warn("Failed to ensure flight raws on import update", "error", err, "employee_id", item.EmployeeID)
			}
		} else {
			slog.Info("Creating new flight", "employee_id", item.EmployeeID, "project_id", item.ProjectID, "month", item.Month)
			flightModel := &model.Flights{
				EmployeeID:         item.EmployeeID,
				ProjectID:          item.ProjectID,
				Month:              item.Month,
				FlightNum:          item.FlightNum,
				DepartDestination:  item.DepartDestination,
				JakartaChina:       item.JakartaChina,
				ChinaJakarta:       item.ChinaJakarta,
				JakartaSite:        item.JakartaSite,
				SiteJakarta:        item.SiteJakarta,
				ReturnDestination:  item.ReturnDestination,
				ReturnJakarta:      item.ReturnJakarta,
				ReturnChinaJakarta: item.ReturnChinaJakarta,
				ReturnJakartaSite:  item.ReturnJakartaSite,
				ReturnSiteJakarta:  item.ReturnSiteJakarta,
				Category:           item.Category,
			}
			if err := s.flightRepo.Create(flightModel); err != nil {
				slog.Error("Failed to create flight", "error", err, "employee_id", item.EmployeeID)
				return err
			}
			if err := s.EnsureFlightRawsFromFlights(flightModel); err != nil {
				slog.Warn("Failed to ensure flight raws on import create", "error", err, "employee_id", item.EmployeeID)
			}
		}
	}
	return nil
}

// buildFlightRawModelsFromFlights converts the flat route fields on a model.Flights
// into individual model.FlightRaw records. Each non-empty route field → one row.
// Dates are parsed from string to time.Time for depart_time / arrive_time.
// flight_type is set to "go"/"return" for CalculateTripClosure compatibility;
// the route key is embedded in flight_info.
func buildFlightRawModelsFromFlights(flight *model.Flights) []model.FlightRaw {
	empID, _ := strconv.ParseUint(flight.EmployeeID, 10, 64)

	type routeSpec struct {
		value     string
		routeKey  string
		direction string
	}

	routes := []routeSpec{
		{flight.ChinaJakarta, "china_jakarta", "go"},
		{flight.JakartaChina, "jakarta_china", "return"},
		{flight.JakartaSite, "jakarta_site", "go"},
		{flight.SiteJakarta, "site_jakarta", "return"},
		// Also handle return trip flat fields (when present)
		{flight.ReturnJakarta, "return_jakarta", "return"},
		{flight.ReturnChinaJakarta, "return_china_jakarta", "go"},
		{flight.ReturnJakartaSite, "return_jakarta_site", "go"},
		{flight.ReturnSiteJakarta, "return_site_jakarta", "return"},
	}

	var raws []model.FlightRaw
	for _, r := range routes {
		if strings.TrimSpace(r.value) == "" {
			continue
		}

		var departTime, arriveTime *time.Time
		if t, ok := parseFlightDateTime(r.value); ok {
			departTime = &t
			arriveTime = &t
		}

		info := fmt.Sprintf("%s|%s|%s|%s", flight.FlightNum, r.direction, r.routeKey, r.value)
		raws = append(raws, model.FlightRaw{
			EmployeeID:  empID,
			FlightNo:    flight.FlightNum,
			FlightType:  r.direction,
			DepartTime:  departTime,
			ArriveTime:  arriveTime,
			FlightInfo:  info,
			TripStatus:  "",
			ImportMonth: flight.Month,
		})
	}
	return raws
}

// calculateOnSiteAttendanceFromRaws computes site attendance days from flight_raws.
// It ONLY considers pairs of raws whose trip_status == "closed" — i.e. pairs that
// CalculateTripClosure has already matched. It then pairs jakarta_site (go) raws
// with site_jakarta (return) raws by closest time, and sums each pair's interval.
// Returns total days (Σ pair_duration / 24).
//
// Precondition: CalculateTripClosure must have run first so trip_status is populated.
func (s *FlightService) calculateOnSiteAttendanceFromRaws(empID uint64, month string) (float64, error) {
	raws, err := s.flightRawRepo.List(empID, month)
	if err != nil {
		return 0, fmt.Errorf("list flight raws: %w", err)
	}

	// Only the main-trip site pair — user asked for jakarta_site ↔ site_jakarta
	sitePairs := map[string]string{
		"jakarta_site": "site_jakarta",
	}

	type rawRef struct {
		index int
		raw   *model.FlightRaw
	}

	// Filter: trip_status MUST be "closed" AND depart_time MUST exist
	goByKey := make(map[string][]rawRef)
	returnByKey := make(map[string][]rawRef)
	closedCount := 0

	for i := range raws {
		r := &raws[i]
		if r.DepartTime == nil {
			continue
		}
		if r.TripStatus != "closed" {
			continue
		}
		closedCount++

		key := extractRouteKey(r.FlightInfo)
		if _, isGo := sitePairs[key]; isGo {
			goByKey[key] = append(goByKey[key], rawRef{index: i, raw: r})
		}
		for _, retKey := range sitePairs {
			if key == retKey {
				returnByKey[retKey] = append(returnByKey[retKey], rawRef{index: i, raw: r})
				break
			}
		}
	}

	slog.Debug("calculateOnSiteAttendanceFromRaws prefilter",
		"employee_id", empID, "month", month,
		"total_raws", len(raws), "closed_raws", closedCount,
		"go_by_key", len(goByKey), "return_by_key", len(returnByKey))

	matchedReturn := make(map[int]bool)
	var totalDays float64
	matchedPairs := 0

	for goKey, goRaws := range goByKey {
		retKey := sitePairs[goKey]
		retRaws := returnByKey[retKey]

		for _, g := range goRaws {
			var bestIdx int = -1
			var bestDiff time.Duration

			for j, ret := range retRaws {
				if matchedReturn[ret.index] {
					continue
				}
				diff := ret.raw.DepartTime.Sub(*g.raw.DepartTime)
				if diff <= 0 {
					continue // return must be after go
				}
				if bestIdx == -1 || diff < bestDiff {
					bestIdx = j
					bestDiff = diff
				}
			}

			if bestIdx != -1 {
				// Date-only: zero out time, subtract YYYY-MM-DD
				goDay := time.Date(g.raw.DepartTime.Year(), g.raw.DepartTime.Month(), g.raw.DepartTime.Day(), 0, 0, 0, 0, g.raw.DepartTime.Location())
				retDay := time.Date(retRaws[bestIdx].raw.DepartTime.Year(), retRaws[bestIdx].raw.DepartTime.Month(), retRaws[bestIdx].raw.DepartTime.Day(), 0, 0, 0, 0, retRaws[bestIdx].raw.DepartTime.Location())
				pairDays := retDay.Sub(goDay).Hours() / 24

				slog.Debug("OnSite closed pair matched",
					"go_raw_id", g.raw.ID, "go_date", goDay.Format("2006-01-02"),
					"ret_raw_id", retRaws[bestIdx].raw.ID, "ret_date", retDay.Format("2006-01-02"),
					"pair_days", pairDays)
				totalDays += pairDays
				matchedReturn[retRaws[bestIdx].index] = true
				matchedPairs++
			}
		}
	}

	slog.Debug("calculateOnSiteAttendanceFromRaws result",
		"employee_id", empID, "month", month,
		"matched_pairs", matchedPairs, "total_days", totalDays)
	return totalDays, nil
}

// EnsureFlightRawsFromFlights is the canonical entry point for synchronising
// flight_raws from a Flights row. It deletes any existing raws for this
// employee+month, builds new ones from the 4 flat route fields (plus the 4
// return-trip fields when present), and batch-inserts them.
//
// Callers: CreateFlight, UpdateFlight, ImportFlight — every path that touches
// the flights table must funnel through here.
func (s *FlightService) EnsureFlightRawsFromFlights(flight *model.Flights) error {
	empID, err := strconv.ParseUint(flight.EmployeeID, 10, 64)
	if err != nil || empID == 0 {
		return fmt.Errorf("invalid employee_id %q for flight_raws: %w", flight.EmployeeID, err)
	}

	if err := s.flightRawRepo.DeleteByEmployeeIDAndMonth(empID, flight.Month); err != nil {
		return fmt.Errorf("delete existing flight raws: %w", err)
	}

	raws := buildFlightRawModelsFromFlights(flight)
	if len(raws) == 0 {
		slog.Info("No flight raws to save (all route fields empty)", "employee_id", flight.EmployeeID, "month", flight.Month)
		return nil
	}

	if err := s.flightRawRepo.CreateBatch(raws); err != nil {
		return fmt.Errorf("batch create flight raws: %w", err)
	}

	slog.Info("Saved flight raws", "count", len(raws), "employee_id", flight.EmployeeID, "month", flight.Month)
	return nil
}

// routePairMap defines which route keys form a closed trip (go -> return)
var routePairMap = map[string]string{
	"china_jakarta": "jakarta_china",
	"jakarta_site":  "site_jakarta",
}

// extractRouteKey parses flight_info to extract the route key.
// flight_info format: flight_no|flight_type|route_key|date
func extractRouteKey(flightInfo string) string {
	parts := strings.Split(flightInfo, "|")
	if len(parts) < 3 {
		return ""
	}
	return strings.ToLower(parts[2])
}

// CalculateTripClosure calculates trip closure status for all flight raws of
// an employee in a given month. Records are matched by route pairs:
//   - china_jakarta (go) + jakarta_china (return) = closed
//   - jakarta_site (go) + site_jakarta (return) = closed
//   - return_jakarta_site (go) + return_site_jakarta (return) = closed
//
// Closure rule: the two closest-in-time go/return records that form a valid
// route pair are considered a closed trip.
func (s *FlightService) CalculateTripClosure(employeeID uint64, importMonth string) error {
	raws, err := s.flightRawRepo.List(employeeID, importMonth)
	if err != nil {
		return fmt.Errorf("list flight raws: %w", err)
	}

	if len(raws) == 0 {
		return nil
	}

	type rawRef struct {
		index int
		raw   *model.FlightRaw
	}

	var goRaws, returnRaws []rawRef
	for i := range raws {
		r := &raws[i]
		if r.FlightType == "go" {
			goRaws = append(goRaws, rawRef{index: i, raw: r})
		} else if r.FlightType == "return" {
			returnRaws = append(returnRaws, rawRef{index: i, raw: r})
		}
	}

	matched := make(map[int]bool)

	for _, g := range goRaws {
		goKey := extractRouteKey(g.raw.FlightInfo)
		expectedReturnKey := routePairMap[goKey]
		if expectedReturnKey == "" {
			continue
		}

		var bestMatch *rawRef
		var bestDiff time.Duration

		for j := range returnRaws {
			r := returnRaws[j]
			if matched[r.index] {
				continue
			}
			returnKey := extractRouteKey(r.raw.FlightInfo)
			if returnKey != expectedReturnKey {
				continue
			}

			var diff time.Duration
			if g.raw.DepartTime != nil && r.raw.DepartTime != nil {
				diff = r.raw.DepartTime.Sub(*g.raw.DepartTime)
				if diff < 0 {
					diff = -diff
				}
			} else {
				diff = 0
			}

			if bestMatch == nil || diff < bestDiff {
				bestMatch = &returnRaws[j]
				bestDiff = diff
			}
		}

		if bestMatch != nil {
			g.raw.TripStatus = "closed"
			bestMatch.raw.TripStatus = "closed"
			matched[g.index] = true
			matched[bestMatch.index] = true
		}
	}

	for i := range raws {
		if !matched[i] {
			raws[i].TripStatus = "open"
		}
	}

	for i := range raws {
		if err := s.flightRawRepo.UpdateTripStatus(raws[i].ID, raws[i].TripStatus); err != nil {
			slog.Error("Failed to update trip_status", "id", raws[i].ID, "error", err)
		}
	}

	slog.Info("Calculated trip closure", "employee_id", employeeID, "month", importMonth, "total", len(raws), "closed", len(matched)/2)
	return nil
}

// CalculateResult holds the result of a flight calculation
type CalculateResult struct {
	WorkDays                 float64  `json:"work_days"`
	OvertimeDays             float64  `json:"overtime_days"`
	LeaveDays                float64  `json:"leave_days"`
	TotalDays                float64  `json:"total_days"`
	CalendarDays             float64  `json:"calendar_days"`
	IndonesiaStartDate       string   `json:"indonesia_start_date"`
	IndonesiaEndDate         string   `json:"indonesia_end_date"`
	OffSiteAttendanceDays    float64  `json:"off_site_attendance_days"`
	OnSiteAttendanceDays     float64  `json:"on_site_attendance_days"`
	FrontlineBaseDays        float64  `json:"frontline_base_days"`
	ChinaHolidayOvertimeDays float64  `json:"china_holiday_overtime_days"`
	OverseasAttendanceDays   float64  `json:"overseas_attendance_days"`
	SafetyAllowanceDays      float64  `json:"safety_allowance_days"`
	SeaAge                   float64  `json:"sea_age"`
	OverdueWorkDays          float64  `json:"overdue_work_days"`
	Breakdown                []string `json:"breakdown"`
}

// Chinese public holidays are dynamically calculated per year in lunar.go
// Use GetChinaHolidays(year) to get the holiday map for a specific year

// CalculateFlight calculates work days, overtime days and leave days from a single flight record.
// It always runs CalculateTripClosure first so flight_raws are marked closed/open before
// OnSiteAttendanceDays is derived from them.
func (s *FlightService) CalculateFlight(flightID uint) (*CalculateResult, error) {
	flight, err := s.flightRepo.GetByID(flightID)
	if err != nil {
		return nil, fmt.Errorf("flight not found: %w", err)
	}

	// Ensure trip closure is up-to-date before computing OnSiteAttendanceDays
	if empID, cerr := strconv.ParseUint(flight.EmployeeID, 10, 64); cerr == nil && empID != 0 {
		if cerr := s.CalculateTripClosure(empID, flight.Month); cerr != nil {
			slog.Warn("CalculateTripClosure failed before CalculateFlight", "error", cerr, "employee_id", flight.EmployeeID)
		}
	}

	result := s.calculateFromFlightData(flight)

	flight.WorkDays = result.WorkDays
	flight.OvertimeDays = result.OvertimeDays
	flight.LeaveDays = result.LeaveDays
	flight.CalculatedAt = time.Now()
	flight.CalendarDays = result.CalendarDays
	flight.IndonesiaStartDate = result.IndonesiaStartDate
	flight.IndonesiaEndDate = result.IndonesiaEndDate
	flight.OffSiteAttendanceDays = result.OffSiteAttendanceDays
	flight.OnSiteAttendanceDays = result.OnSiteAttendanceDays
	flight.FrontlineBaseDays = result.FrontlineBaseDays
	flight.ChinaHolidayOvertimeDays = result.ChinaHolidayOvertimeDays
	flight.OverseasAttendanceDays = result.OverseasAttendanceDays
	flight.SafetyAllowanceDays = result.SafetyAllowanceDays
	flight.SeaAge = result.SeaAge
	flight.OverdueWorkDays = result.OverdueWorkDays

	if err := s.flightRepo.Update(flight); err != nil {
		return nil, fmt.Errorf("failed to update flight: %w", err)
	}

	return result, nil
}

// CalculateFlightBatch calculates flights for all records of an employee in a month.
// It runs CalculateTripClosure once up-front so OnSiteAttendanceDays for every row
// benefits from up-to-date closed/open status on flight_raws.
func (s *FlightService) CalculateFlightBatch(employeeID, month string, projectID int) ([]CalculateResult, error) {
	flights, err := s.flightRepo.GetByEmployeeIDAndMonth(employeeID, month, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to query flights: %w", err)
	}

	if len(flights) == 0 {
		return nil, fmt.Errorf("no flight records found for employee %s in month %s", employeeID, month)
	}

	// Ensure trip closure is up-to-date for this employee+month before computing
	empIDUint, _ := strconv.ParseUint(employeeID, 10, 64)
	if empIDUint != 0 {
		if cerr := s.CalculateTripClosure(empIDUint, month); cerr != nil {
			slog.Warn("CalculateTripClosure failed before CalculateFlightBatch", "error", cerr, "employee_id", employeeID)
		}
	}

	results := make([]CalculateResult, 0, len(flights))
	for _, flight := range flights {
		result := s.calculateFromFlightData(&flight)

		flight.WorkDays = result.WorkDays
		flight.OvertimeDays = result.OvertimeDays
		flight.LeaveDays = result.LeaveDays
		flight.CalculatedAt = time.Now()
		flight.CalendarDays = result.CalendarDays
		flight.IndonesiaStartDate = result.IndonesiaStartDate
		flight.IndonesiaEndDate = result.IndonesiaEndDate
		flight.OffSiteAttendanceDays = result.OffSiteAttendanceDays
		flight.OnSiteAttendanceDays = result.OnSiteAttendanceDays
		flight.FrontlineBaseDays = result.FrontlineBaseDays
		flight.ChinaHolidayOvertimeDays = result.ChinaHolidayOvertimeDays
		flight.OverseasAttendanceDays = result.OverseasAttendanceDays
		flight.SafetyAllowanceDays = result.SafetyAllowanceDays
		flight.SeaAge = result.SeaAge
		flight.OverdueWorkDays = result.OverdueWorkDays

		if err := s.flightRepo.Update(&flight); err != nil {
			slog.Error("Failed to update flight", "error", err, "flight_id", flight.ID)
			continue
		}

		results = append(results, *result)
	}

	return results, nil
}

// calculateFromFlightData performs the actual calculation from flight segment data
func (s *FlightService) calculateFromFlightData(flight *model.Flights) *CalculateResult {
	result := &CalculateResult{
		WorkDays:     0,
		OvertimeDays: 0,
		LeaveDays:    0,
		Breakdown:    []string{},
	}

	year, month := parseMonth(flight.Month)

	// Get dynamically calculated holidays for this year
	holidayMap, err := GetChinaHolidays(year)
	if err != nil {
		slog.Warn("Failed to get holidays, using empty map", "year", year, "error", err)
		holidayMap = make(map[string]int)
	}

	// 日历天数: 当月自然日天数
	firstDay := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
	nextMonth := firstDay.AddDate(0, 1, 0)
	daysInMonth := nextMonth.Sub(firstDay).Hours() / 24
	result.CalendarDays = daysInMonth

	// 海龄: 每个月自动1
	result.SeaAge = 1

	// Collect flight date fields categorized by type
	// 去程: China->Jakarta, Jakarta->Site (只算天数)
	outboundFields := []struct {
		name  string
		value string
	}{
		{"China->Jakarta (去程)", flight.ChinaJakarta},
		{"Jakarta->Site (去程)", flight.JakartaSite},
	}

	// 回程: Jakarta->China, Site->Jakarta (算天数)
	returnFields := []struct {
		name  string
		value string
	}{
		{"Jakarta->China (回程)", flight.JakartaChina},
		{"Site->Jakarta (回程)", flight.SiteJakarta},
	}

	// Return trip return fields
	returnTripFields := []struct {
		name  string
		value string
	}{
		{"Return Jakarta", flight.ReturnJakarta},
		{"Return China->Jakarta", flight.ReturnChinaJakarta},
		{"Return Jakarta->Site", flight.ReturnJakartaSite},
		{"Return Site->Jakarta", flight.ReturnSiteJakarta},
	}

	seenDates := make(map[string]bool)
	var allDates []time.Time

	// Process all date fields
	allFields := append(append(outboundFields, returnFields...), returnTripFields...)
	for _, field := range allFields {
		if strings.TrimSpace(field.value) == "" {
			continue
		}
		dates := parseDateField(field.value, year, month)
		for _, d := range dates {
			dateKey := d.Format("2006-01-02")
			if seenDates[dateKey] {
				continue
			}
			seenDates[dateKey] = true
			allDates = append(allDates, d)

			weekday := d.Weekday()
			isWeekend := weekday == time.Saturday || weekday == time.Sunday

			// Check if it's a Chinese holiday
			holidayKey := fmt.Sprintf("%02d-%02d", d.Month(), d.Day())
			holidayDays := holidayMap[holidayKey]

			if holidayDays > 0 {
				result.ChinaHolidayOvertimeDays += float64(holidayDays)
				result.OvertimeDays++
				result.Breakdown = append(result.Breakdown,
					fmt.Sprintf("%s %s: 法定假日加班日", field.name, dateKey))
			} else if isWeekend {
				result.OvertimeDays++
				result.Breakdown = append(result.Breakdown,
					fmt.Sprintf("%s %s: 周末加班日", field.name, dateKey))
			} else {
				result.WorkDays++
				result.Breakdown = append(result.Breakdown,
					fmt.Sprintf("%s %s: 工作日", field.name, dateKey))
			}
		}
	}
	slog.Info("china to jakarta start date*--------------------------", "date", result.IndonesiaStartDate)
	// 驻印尼起始时间: China->Jakarta 的日期
	if strings.TrimSpace(flight.ChinaJakarta) != "" {
		if dates := parseDateField(flight.ChinaJakarta, year, month); len(dates) > 0 {
			result.IndonesiaStartDate = dates[0].Format("2006-01-02")
		}
	}
	slog.Info("Indonesia start date**************************", "date", result.IndonesiaStartDate)

	// 驻印尼回国时间: Jakarta->China 的日期
	if strings.TrimSpace(flight.JakartaChina) != "" {
		if dates := parseDateField(flight.JakartaChina, year, month); len(dates) > 0 {
			result.IndonesiaEndDate = dates[len(dates)-1].Format("2006-01-02")
		}
	}

	// 计算雅加达总停留天数 (作为临时变量, 后面扣减 OnSite)
	var jakartaTotalDays float64
	if result.IndonesiaStartDate != "" && result.IndonesiaEndDate != "" {
		start, _ := time.Parse("2006-01-02", result.IndonesiaStartDate)
		end, _ := time.Parse("2006-01-02", result.IndonesiaEndDate)
		if !start.After(end) {
			jakartaTotalDays = end.Sub(start).Hours() / 24
		}
	}

	// 现场出勤 / 前线基地出勤: 优先用 flight_raws 日期差计算
	if empID64, err := strconv.ParseUint(flight.EmployeeID, 10, 64); err == nil && empID64 != 0 {
		if days, err := s.calculateOnSiteAttendanceFromRaws(empID64, flight.Month); err == nil && days > 0 {
			if flight.Category == 1 {
				result.OnSiteAttendanceDays = days
			} else {
				result.FrontlineBaseDays = days
			}
			slog.Debug("Site attendance from flight_raws", "category", flight.Category, "days", days, "employee_id", flight.EmployeeID)
		}
	}

	// 回退: 从扁平字段计算 (兼容旧数据或 flight_raws 为空的情况)
	if result.OnSiteAttendanceDays == 0 &&
		result.FrontlineBaseDays == 0 &&
		strings.TrimSpace(flight.JakartaSite) != "" && strings.TrimSpace(flight.SiteJakarta) != "" {
		siteDates := parseDateField(flight.JakartaSite, year, month)
		returnSiteDates := parseDateField(flight.SiteJakarta, year, month)
		if len(siteDates) > 0 && len(returnSiteDates) > 0 {
			siteStart := siteDates[0]
			siteEnd := returnSiteDates[len(returnSiteDates)-1]
			if !siteStart.After(siteEnd) {
				siteDays := siteEnd.Sub(siteStart).Hours()/24 + 1
				if flight.Category == 1 {
					result.OnSiteAttendanceDays = siteDays
				} else {
					result.FrontlineBaseDays = siteDays
				}
			}
		}
	}

	// 非现场出勤 = 雅加达总停留天数 - 现场/前线基地天数
	siteDaysForOffSite := result.OnSiteAttendanceDays
	if flight.Category != 1 {
		siteDaysForOffSite = result.FrontlineBaseDays
	}
	if jakartaTotalDays > 0 {
		offSite := jakartaTotalDays - siteDaysForOffSite
		if offSite < 0 {
			offSite = 0
		}
		result.OffSiteAttendanceDays = offSite
		slog.Debug("OffSiteAttendanceDays computed",
			"jakarta_total_days", jakartaTotalDays,
			"site_days_subtracted", siteDaysForOffSite,
			"category", flight.Category,
			"off_site_days", result.OffSiteAttendanceDays)
	}

	// 休假天数: 在国内的天数 (总天数 - 出勤天数)
	totalAttendance := result.OffSiteAttendanceDays + result.OnSiteAttendanceDays + result.FrontlineBaseDays
	if totalAttendance > 0 && totalAttendance < result.CalendarDays {
		result.LeaveDays = result.CalendarDays - totalAttendance
	}

	// 境外出勤天数 = 非现场出勤 + 现场出勤 + 前线基地出勤
	result.OverseasAttendanceDays = result.OffSiteAttendanceDays + result.OnSiteAttendanceDays + result.FrontlineBaseDays

	// 安全补贴天数 = 境外出勤天数
	result.SafetyAllowanceDays = result.OverseasAttendanceDays

	// 超期工作天数
	// 现场工作人员: 每年国外工作超过165天，从第166天开始算超期
	// 非现场人员: 超过248天，从249天开始算
	// 这里简化处理: 如果总出勤天数超过165，超出部分算超期
	if result.OverseasAttendanceDays > 165 {
		result.OverdueWorkDays = result.OverseasAttendanceDays - 165
	}

	result.TotalDays = result.WorkDays + result.OvertimeDays

	return result
}

// parseMonth parses "YYYY-MM" format into year and month
func parseMonth(monthStr string) (int, time.Month) {
	parts := strings.Split(monthStr, "-")
	if len(parts) == 2 {
		y, err := strconv.Atoi(parts[0])
		if err != nil {
			y = time.Now().Year()
		}
		m, err := strconv.Atoi(parts[1])
		if err != nil {
			m = int(time.Now().Month())
		}
		return y, time.Month(m)
	}
	return time.Now().Year(), time.Now().Month()
}

// parseDateField parses a date field that may contain various formats:
// - Single day: "15"
// - Full date: "2024-01-15" or "15/01/2024" or "01-15-2024"
// - Range: "15-20" (days 15 to 20)
// - Comma-separated: "15,18,20"
// - Range with year: "2024-01-15 to 2024-01-20"
func parseDateField(value string, year int, month time.Month) []time.Time {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil
	}

	var dates []time.Time
	seen := make(map[string]bool)

	addDate := func(d time.Time) {
		key := d.Format("2006-01-02")
		if !seen[key] {
			seen[key] = true
			dates = append(dates, d)
		}
	}

	// Try parsing as ISO date range: "2024-01-15 to 2024-01-20" or "2024-01-15 - 2024-01-20"
	isoRange := regexp.MustCompile(`(\d{4}[-/]\d{1,2}[-/]\d{1,2})\s*(?:to|-|~)\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})`)
	if matches := isoRange.FindStringSubmatch(value); len(matches) == 3 {
		start, err := parseFlexibleDate(matches[1])
		if err == nil {
			end, err := parseFlexibleDate(matches[2])
			if err == nil {
				for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
					addDate(d)
				}
				return dates
			}
		}
	}

	// Try parsing as ISO date: "2024-01-15" or "15/01/2024"
	if t, err := parseFlexibleDate(value); err == nil {
		addDate(t)
		return dates
	}

	// Try range of day numbers: "15-20"
	dayRange := regexp.MustCompile(`^(\d{1,2})\s*[-~]\s*(\d{1,2})$`)
	if matches := dayRange.FindStringSubmatch(value); len(matches) == 3 {
		startDay, _ := strconv.Atoi(matches[1])
		endDay, _ := strconv.Atoi(matches[2])
		for day := startDay; day <= endDay; day++ {
			d, err := time.Parse("2006-01-02", fmt.Sprintf("%04d-%02d-%02d", year, month, day))
			if err == nil {
				addDate(d)
			}
		}
		return dates
	}

	// Comma-separated day numbers: "15,18,20"
	parts := strings.Split(value, ",")
	if len(parts) > 1 {
		for _, p := range parts {
			p = strings.TrimSpace(p)
			if day, err := strconv.Atoi(p); err == nil {
				d, err := time.Parse("2006-01-02", fmt.Sprintf("%04d-%02d-%02d", year, month, day))
				if err == nil {
					addDate(d)
				}
			}
		}
		if len(dates) > 0 {
			return dates
		}
	}

	// Single day number: "15"
	if day, err := strconv.Atoi(value); err == nil {
		d, err := time.Parse("2006-01-02", fmt.Sprintf("%04d-%02d-%02d", year, month, day))
		if err == nil {
			addDate(d)
		}
		return dates
	}

	// Try to parse as common date formats
	formats := []string{
		"2006-01-02",
		"02/01/2006",
		"01/02/2006",
		"02-01-2006",
		"01-02-2006",
		"2006/01/02",
		time.RFC3339,
		"2006-01-02T15:04",
	}
	for _, format := range formats {
		if t, err := time.Parse(format, value); err == nil {
			addDate(t)
			return dates
		}
	}

	return dates
}

// parseFlexibleDate tries to parse a date string in various formats
func parseFlexibleDate(s string) (time.Time, error) {
	formats := []string{
		"2006-01-02",
		"02/01/2006",
		"01/02/2006",
		"02-01-2006",
		"01-02-2006",
		"2006/01/02",
	}
	for _, format := range formats {
		if t, err := time.Parse(format, s); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("unable to parse date: %s", s)
}

// parseFlightDateTime parses date-time strings that appear in Excel flight imports.
// Supports both date-only and date+time formats used by XLSX library with raw:false.
func parseFlightDateTime(s string) (time.Time, bool) {
	s = strings.TrimSpace(s)
	if s == "" {
		return time.Time{}, false
	}

	// Time-only extraction: if string contains a colon, try to find HH:mm or HH:mm:ss
	// We combine it with the date part
	formats := []string{
		// Date + time formats
		"20060102-15:04",      // 20260804-13:00  (common Excel text format)
		"20060102 15:04",      // 20260804 13:00
		"2006-01-02 15:04",    // 2026-08-04 13:00
		"2006-01-02 15:04:05", // 2026-08-04 13:00:00
		"2006/01/02 15:04",    // 2026/08/04 13:00
		"2006/01/02 15:04:05",
		time.RFC3339, // 2026-08-04T13:00:00Z
		"2006-01-02T15:04",
		// Date-only formats (time defaults to 00:00:00)
		"2006-01-02",
		"20060102", // 20260804
		"2006/01/02",
		"02/01/2006",
		"01/02/2006",
		"02-01-2006",
		"01-02-2006",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, s); err == nil {
			return t, true
		}
	}

	return time.Time{}, false
}
