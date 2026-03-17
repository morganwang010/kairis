package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        string         `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Username  string         `gorm:"uniqueIndex;not null" json:"username"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"not null" json:"-"`
	Phone     string         `json:"phone"`
	Avatar    string         `json:"avatar"`
	Status    string         `gorm:"default:active" json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Roles     []Role         `gorm:"many2many:user_roles;" json:"roles"`
}

type Role struct {
	ID          string         `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Name        string         `gorm:"uniqueIndex;not null" json:"name"`
	Code        string         `gorm:"uniqueIndex;not null" json:"code"`
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Permissions []Permission   `gorm:"many2many:role_permissions;" json:"permissions"`
}

type Permission struct {
	ID         string         `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Name       string         `gorm:"uniqueIndex;not null" json:"name"`
	Code       string         `gorm:"uniqueIndex;not null" json:"code"`
	Type       string         `gorm:"not null" json:"type"`
	ResourceID string         `json:"resource_id"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

type Menu struct {
	ID          string         `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Title       string         `gorm:"not null" json:"title"`
	Path        string         `gorm:"uniqueIndex;not null" json:"path"`
	Icon        string         `json:"icon"`
	Component   string         `json:"component"`
	Redirect    string         `json:"redirect"`
	ParentID    *string        `json:"parent_id"`
	Sort        int            `gorm:"default:0" json:"sort"`
	Hidden      bool           `gorm:"default:false" json:"hidden"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Children    []Menu         `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Permissions []Permission   `gorm:"many2many:menu_permissions;" json:"permissions,omitempty"`
}

type Project struct {
	ID          int            `gorm:"primaryKey;type:integer;default:nextval('project_id_seq')" json:"id"`
	ProjectName string         `gorm:"not null" json:"project_name"`
	ProjectAbbr string         `gorm:"not null" json:"project_abbr"`
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	AskesAlw    int            `json:"askes_alw"`
}

type License struct {
	ID             int            `gorm:"primaryKey;type:integer;default:nextval('license_id_seq')" json:"id"`
	LicenseKey     string         `gorm:"not null;uniqueIndex" json:"license_key"`
	Status         string         `gorm:"default:inactive" json:"status"`
	ActivationDate string         `json:"activation_date"`
	ExpirationDate string         `json:"expiration_date"`
	ValidUntil     string         `json:"valid_until"`
	CompanyName    string         `json:"company_name"`
	EmployeeCount  int            `gorm:"default:0" json:"employee_count"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

// Incidents 对应 incidents 数据表的 GORM 模型
// 字段命名遵循 Go 驼峰规范，通过 gorm 标签映射数据库下划线命名列
type Incidents struct {
	// 主键字段
	ID uint `gorm:"column:id;primaryKey;autoIncrement" json:"id"` // SERIAL 对应 autoIncrement

	// 核心业务字段（非空约束）
	EmployeeID string `gorm:"column:employee_id;not null" json:"employee_id"` // TEXT NOT NULL
	ProjectID  int    `gorm:"column:project_id;not null" json:"project_id"`   // INTEGER NOT NULL
	Month      string `gorm:"column:month;not null" json:"month"`             // TEXT NOT NULL

	// 薪资相关字段（默认值 0.00）
	LeaveComp        float64 `gorm:"column:leave_comp;default:0.00" json:"leave_comp"`
	MedAlw           float64 `gorm:"column:med_alw;default:0.00" json:"med_alw"`
	Others           float64 `gorm:"column:others;default:0.00" json:"others"`
	ReligiousAlw     float64 `gorm:"column:religious_alw;default:0.00" json:"religious_alw"`
	RapelBasicSalary float64 `gorm:"column:rapel_basic_salary;default:0.00" json:"rapel_basic_salary"`
	RapelJmstkAlw    float64 `gorm:"column:rapel_jmstk_alw;default:0.00" json:"rapel_jmstk_alw"`
	IncentiveAlw     float64 `gorm:"column:incentive_alw;default:0.00" json:"incentive_alw"`
	Acting           float64 `gorm:"column:acting;default:0.00" json:"acting"`
	PerformanceAlw   float64 `gorm:"column:performance_alw;default:0.00" json:"performance_alw"`
	TripAlw          float64 `gorm:"column:trip_alw;default:0.00" json:"trip_alw"`
	Ot2Wages         float64 `gorm:"column:ot2_wages;default:0.00" json:"ot2_wages"`
	Ot3Wages         float64 `gorm:"column:ot3_wages;default:0.00" json:"ot3_wages"`
	CompPhk          float64 `gorm:"column:comp_phk;default:0.00" json:"comp_phk"`
	TaxAlwPhk        float64 `gorm:"column:tax_alw_phk;default:0.00" json:"tax_alw_phk"`
	AbsentDed        float64 `gorm:"column:absent_ded;default:0.00" json:"absent_ded"`
	AbsentDed2       float64 `gorm:"column:absent_ded2;default:0.00" json:"absent_ded2"`
	CorrectAdd       float64 `gorm:"column:correct_add;default:0.00" json:"correct_add"`
	CorrectSub       float64 `gorm:"column:correct_sub;default:0.00" json:"correct_sub"`
	IncentiveDed     float64 `gorm:"column:incentive_ded;default:0.00" json:"incentive_ded"`
	LoanDed          float64 `gorm:"column:loan_ded;default:0.00" json:"loan_ded"`
	TaxDedPhk        float64 `gorm:"column:tax_ded_phk;default:0.00" json:"tax_ded_phk"`
	MandahAlw        float64 `gorm:"column:mandah_alw;default:0.00" json:"mandah_alw"`

	// 时间字段
	CreateTime time.Time `gorm:"column:create_time;default:CURRENT_TIMESTAMP" json:"create_time"`
	UpdateTime time.Time `gorm:"column:update_time;default:CURRENT_TIMESTAMP;autoUpdateTime" json:"update_time"`
}

type Attendances struct {
	ID         uint    `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	EmployeeID string  `gorm:"column:employee_id;not null" json:"employee_id"`
	Day1       string  `gorm:"column:day1;default:'0'" json:"day1"`
	Day2       string  `gorm:"column:day2;default:'0'" json:"day2"`
	Day3       string  `gorm:"column:day3;default:'0'" json:"day3"`
	Day4       string  `gorm:"column:day4;default:'0'" json:"day4"`
	Day5       string  `gorm:"column:day5;default:'0'" json:"day5"`
	Day6       string  `gorm:"column:day6;default:'0'" json:"day6"`
	Day7       string  `gorm:"column:day7;default:'0'" json:"day7"`
	Day8       string  `gorm:"column:day8;default:'0'" json:"day8"`
	Day9       string  `gorm:"column:day9;default:'0'" json:"day9"`
	Day10      string  `gorm:"column:day10;default:'0'" json:"day10"`
	Day11      string  `gorm:"column:day11;default:'0'" json:"day11"`
	Day12      string  `gorm:"column:day12;default:'0'" json:"day12"`
	Day13      string  `gorm:"column:day13;default:'0'" json:"day13"`
	Day14      string  `gorm:"column:day14;default:'0'" json:"day14"`
	Day15      string  `gorm:"column:day15;default:'0'" json:"day15"`
	Day16      string  `gorm:"column:day16;default:'0'" json:"day16"`
	Day17      string  `gorm:"column:day17;default:'0'" json:"day17"`
	Day18      string  `gorm:"column:day18;default:'0'" json:"day18"`
	Day19      string  `gorm:"column:day19;default:'0'" json:"day19"`
	Day20      string  `gorm:"column:day20;default:'0'" json:"day20"`
	Day21      string  `gorm:"column:day21;default:'0'" json:"day21"`
	Day22      string  `gorm:"column:day22;default:'0'" json:"day22"`
	Day23      string  `gorm:"column:day23;default:'0'" json:"day23"`
	Day24      string  `gorm:"column:day24;default:'0'" json:"day24"`
	Day25      string  `gorm:"column:day25;default:'0'" json:"day25"`
	Day26      string  `gorm:"column:day26;default:'0'" json:"day26"`
	Day27      string  `gorm:"column:day27;default:'0'" json:"day27"`
	Day28      string  `gorm:"column:day28;default:'0'" json:"day28"`
	Day29      string  `gorm:"column:day29;default:'0'" json:"day29"`
	Day30      string  `gorm:"column:day30;default:'0'" json:"day30"`
	Day31      string  `gorm:"column:day31;default:'0'" json:"day31"`
	Work       int     `gorm:"column:work;default:0" json:"work"`
	ProjectID  int     `gorm:"column:project_id;default:NULL" json:"project_id"`
	Permission int     `gorm:"column:permission;default:0" json:"permission"`
	Off        int     `gorm:"column:off;default:0" json:"off"`
	Absent     int     `gorm:"column:absent;default:0" json:"absent"`
	Sick       int     `gorm:"column:sick;default:0" json:"sick"`
	Standby    int     `gorm:"column:standby;default:0" json:"standby"`
	Ew         float64 `gorm:"column:ew;default:0" json:"ew"`
	Month      string  `gorm:"column:month;not null" json:"month"`
	Ot1        float64 `gorm:"column:ot1;default:0" json:"ot1"`
	Ew1        float64 `gorm:"column:ew1;default:0" json:"ew1"`
	Ew2        float64 `gorm:"column:ew2;default:0" json:"ew2"`
	Ew3        float64 `gorm:"column:ew3;default:0" json:"ew3"`
	Ot2        float64 `gorm:"column:ot2;default:0" json:"ot2"`
	Ot3        float64 `gorm:"column:ot3;default:0" json:"ot3"`
	LeaveReplc float64 `gorm:"column:leave_replc;default:0" json:"leave_replc"`
	Unpresent  float64 `gorm:"column:unpresent;default:0" json:"unpresent"`
	TotalDays  int     `gorm:"column:total_days;default:0" json:"total_days"`
}

// Salaries 对应 salaries 数据表的 GORM 模型
type Salaries struct {
	ID               uint      `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	Month            string    `gorm:"column:month;not null" json:"month"`
	ProjectID        int       `gorm:"column:project_id;default:0" json:"project_id"`
	EmployeeID       string    `gorm:"column:employee_id;not null" json:"employee_id"`
	TaxStatus        float64   `gorm:"column:tax_status;default:0" json:"tax_status"`
	BasicSalary      float64   `gorm:"column:basic_salary;default:0.00" json:"basic_salary"`
	HousingAlw       float64   `gorm:"column:housing_alw;default:0.00" json:"housing_alw"`
	PositionAlw      float64   `gorm:"column:position_alw;default:0.00" json:"position_alw"`
	FieldAlw         float64   `gorm:"column:field_alw;default:0.00" json:"field_alw"`
	FixAlw           float64   `gorm:"column:fix_alw;default:0.00" json:"fix_alw"`
	JmstkAlw         float64   `gorm:"column:jmstk_alw;default:0.00" json:"jmstk_alw"`
	PensionAlw       float64   `gorm:"column:pension_alw;default:0.00" json:"pension_alw"`
	MealAlw          float64   `gorm:"column:meal_alw;default:0.00" json:"meal_alw"`
	TranspAlw        float64   `gorm:"column:transp_alw;default:0.00" json:"transp_alw"`
	TaxAlwSalary     float64   `gorm:"column:tax_alw_salary;default:0.00" json:"tax_alw_salary"`
	TaxAlwPhk        float64   `gorm:"column:tax_alw_phk;default:0.00" json:"tax_alw_phk"`
	CompPhk          float64   `gorm:"column:comp_phk;default:0.00" json:"comp_phk"`
	AskesBpjsAlw     float64   `gorm:"column:askes_bpjs_alw;default:0.00" json:"askes_bpjs_alw"`
	MedAlw           float64   `gorm:"column:med_alw;default:0.00" json:"med_alw"`
	PulsaAlw         float64   `gorm:"column:pulsa_alw;default:0.00" json:"pulsa_alw"`
	Others           float64   `gorm:"column:others;default:0.00" json:"others"`
	AttAlw           float64   `gorm:"column:att_alw;default:0.00" json:"att_alw"`
	HousingAlwTetap  float64   `gorm:"column:housing_alw_tetap;default:0.00" json:"housing_alw_tetap"`
	ReligiousAlw     float64   `gorm:"column:religious_alw;default:0.00" json:"religious_alw"`
	RapelBasicSalary float64   `gorm:"column:rapel_basic_salary;default:0.00" json:"rapel_basic_salary"`
	RapelJmstkAlw    float64   `gorm:"column:rapel_jmstk_alw;default:0.00" json:"rapel_jmstk_alw"`
	IncentiveAlw     float64   `gorm:"column:incentive_alw;default:0.00" json:"incentive_alw"`
	Acting           float64   `gorm:"column:acting;default:0.00" json:"acting"`
	PerformanceAlw   float64   `gorm:"column:performance_alw;default:0.00" json:"performance_alw"`
	TripAlw          float64   `gorm:"column:trip_alw;default:0.00" json:"trip_alw"`
	Ot1Wages         float64   `gorm:"column:ot1_wages;default:0.00" json:"ot1_wages"`
	Ot1Hour          float64   `gorm:"column:ot1_hour;default:0.00" json:"ot1_hour"`
	Ew1Hour          float64   `gorm:"column:ew1_hour;default:0.00" json:"ew1_hour"`
	Ew1Wages         float64   `gorm:"column:ew1_wages;default:0.00" json:"ew1_wages"`
	Ew2Hour          float64   `gorm:"column:ew2_hour;default:0.00" json:"ew2_hour"`
	Ew2Wages         float64   `gorm:"column:ew2_wages;default:0.00" json:"ew2_wages"`
	Ew3Hour          float64   `gorm:"column:ew3_hour;default:0.00" json:"ew3_hour"`
	Ew3Wages         float64   `gorm:"column:ew3_wages;default:0.00" json:"ew3_wages"`
	CorrectAdd       float64   `gorm:"column:correct_add;default:0.00" json:"correct_add"`
	CorrectSub       float64   `gorm:"column:correct_sub;default:0.00" json:"correct_sub"`
	LeavComp         float64   `gorm:"column:leav_comp;default:0.00" json:"leav_comp"`
	TotalAccept      float64   `gorm:"column:total_accept;default:0.00" json:"total_accept"`
	JmstkFee         float64   `gorm:"column:jmstk_fee;default:0.00" json:"jmstk_fee"`
	PensionDed       float64   `gorm:"column:pension_ded;default:0.00" json:"pension_ded"`
	TaxDedSalary     float64   `gorm:"column:tax_ded_salary;default:0.00" json:"tax_ded_salary"`
	TaxDedPhk        float64   `gorm:"column:tax_ded_phk;default:0.00" json:"tax_ded_phk"`
	AskesBpjsDed     float64   `gorm:"column:askes_bpjs_ded;default:0.00" json:"askes_bpjs_ded"`
	IncentiveDed     float64   `gorm:"column:incentive_ded;default:0.00" json:"incentive_ded"`
	LoanDed          float64   `gorm:"column:loan_ded;default:0.00" json:"loan_ded"`
	AbsentDed        float64   `gorm:"column:absent_ded;default:0.00" json:"absent_ded"`
	AbsentDed2       float64   `gorm:"column:absent_ded2;default:0.00" json:"absent_ded2"`
	NetAccept        float64   `gorm:"column:net_accept;default:0.00" json:"net_accept"`
	RoundOffSalary   float64   `gorm:"column:round_off_salary;default:0.00" json:"round_off_salary"`
	CreateTime       time.Time `gorm:"column:create_time;default:CURRENT_TIMESTAMP" json:"create_time"`
	UpdateTime       time.Time `gorm:"column:update_time;default:CURRENT_TIMESTAMP;autoUpdateTime" json:"update_time"`
	TotalNetWages    float64   `gorm:"column:total_net_wages;default:0.00" json:"total_net_wages"`
	SalarySlipStatus string    `gorm:"column:salary_slip_status;default:'0'" json:"salary_slip_status"`
	PulsaAlwMonth    float64   `gorm:"column:pulsa_alw_month;default:0.00" json:"pulsa_alw_month"`
	MandahAlw        float64   `gorm:"column:mandah_alw;default:0.00" json:"mandah_alw"`
	IsCalculate      int       `gorm:"column:is_calculate;default:1" json:"is_calculate"`
	DeleteFlag       int       `gorm:"column:delete_flag;default:0" json:"delete_flag"`
}

// Employee 对应 employees 数据表的 GORM 模型
type Employee struct {
	// 主键字段
	ID uint `gorm:"column:id;primaryKey;autoIncrement" json:"id"` // SERIAL PRIMARY KEY

	// 核心业务字段
	EmployeeID      string    `gorm:"column:employee_id;not null" json:"employee_id"`                               // TEXT NOT NULL
	ProjectID       int       `gorm:"column:project_id;default:0" json:"project_id"`                                // INTEGER default 0
	Name            string    `gorm:"column:name;not null" json:"name"`                                             // TEXT NOT NULL
	Department      string    `gorm:"column:department" json:"department"`                                          // TEXT
	Position        string    `gorm:"column:position" json:"position"`                                              // TEXT
	HireDate        string    `gorm:"column:hire_date" json:"hire_date"`                                            // TEXT
	LeaveDate       string    `gorm:"column:leave_date" json:"leave_date"`                                          // TEXT
	Salary          float64   `gorm:"column:salary;default:0.00" json:"salary"`                                     // NUMERIC default 0.00
	TaxStatus       float64   `gorm:"column:tax_status;default:0.00" json:"tax_status"`                             // NUMERIC default 0.00
	IdCard          string    `gorm:"column:id_card;default:'000000000000000000'" json:"id_card"`                   // TEXT default
	Npwp            string    `gorm:"column:npwp;default:'123'" json:"npwp"`                                        // TEXT default
	HierarchyID     string    `gorm:"column:hierarchy_id;default:'0'" json:"hierarchy_id"`                          // TEXT default
	HierarchyName   string    `gorm:"column:hierarchy_name" json:"hierarchy_name"`                                  // TEXT
	JoinDate        time.Time `gorm:"column:join_date;default:CURRENT_TIMESTAMP" json:"join_date"`                  // TIMESTAMP
	ResignDate      time.Time `gorm:"column:resign_date;default:CURRENT_TIMESTAMP" json:"resign_date"`              // TIMESTAMP
	Email           string    `gorm:"column:email;default:'123@123.com'" json:"email"`                              // TEXT default
	BasicSalary     float64   `gorm:"column:basic_salary;default:0.00" json:"basic_salary"`                         // NUMERIC default 0.00
	HousingAlw      float64   `gorm:"column:housing_alw;default:0.00" json:"housing_alw"`                           // NUMERIC default 0.00
	PositionAlw     float64   `gorm:"column:position_alw;default:0.00" json:"position_alw"`                         // NUMERIC default 0.00
	FieldAlw        float64   `gorm:"column:field_alw;default:0.00" json:"field_alw"`                               // NUMERIC default 0.00
	FixAlw          float64   `gorm:"column:fix_alw;default:0.00" json:"fix_alw"`                                   // NUMERIC default 0.00
	MealAlwDay      float64   `gorm:"column:meal_alw_day;default:0.00" json:"meal_alw_day"`                         // NUMERIC default 0.00
	TranspAlwDay    float64   `gorm:"column:transp_alw_day;default:0.00" json:"transp_alw_day"`                     // NUMERIC default 0.00
	PulsaAlwDay     float64   `gorm:"column:pulsa_alw_day;default:0.00" json:"pulsa_alw_day"`                       // NUMERIC default 0.00
	AttAlwDay       float64   `gorm:"column:att_alw_day;default:0.00" json:"att_alw_day"`                           // NUMERIC default 0.00
	CreatedAt       time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`                // TIMESTAMP
	UpdatedAt       time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP;autoUpdateTime" json:"updated_at"` // TIMESTAMP
	TaxType         string    `gorm:"column:tax_type;default:'TK/0'" json:"tax_type"`                               // TEXT default
	LocationName    string    `gorm:"column:location_name;default:'Jakarta'" json:"location_name"`                  // TEXT default
	PulsaAlwMonth   float64   `gorm:"column:pulsa_alw_month;default:0.00" json:"pulsa_alw_month"`                   // NUMERIC default 0.00
	HousingAlwTetap float64   `gorm:"column:housing_alw_tetap;default:0.00" json:"housing_alw_tetap"`               // NUMERIC default 0.00
	DeleteFlag      int       `gorm:"column:delete_flag;default:0" json:"delete_flag"`                              // INTEGER default 0
}
