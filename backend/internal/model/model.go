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
	ID          int    `gorm:"primaryKey;type:integer;default:nextval('project_id_seq')" json:"id"`
	ProjectName string `gorm:"not null" json:"project_name"`
	ProjectAbbr string `gorm:"not null" json:"project_abbr"`
	// Description string         `json:"description"`
	CreatedAt time.Time `json:"created_at"`
	// UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	AskesAlw  int            `json:"askes_alw"`
	OtHoursOn int            `json:"ot_hours_on"`
	EwHoursOn int            `json:"ew_hours_on"`
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

	Thr             float64 `gorm:"column:thr;default:0.00" json:"thr"`
	Bonus           float64 `gorm:"column:bonus;default:0.00" json:"bonus"`
	Compensation    float64 `gorm:"column:compensation;default:0.00" json:"compensation"`
	ActingAllowance float64 `gorm:"column:acting_alw;default:0.00" json:"acting_alw"`
	SalaryProrate   float64 `gorm:"column:salary_prorate;default:0.00" json:"salary_prorate"`
	Rapel           float64 `gorm:"column:rapel;default:0.00" json:"rapel"`
	TaxAlw          float64 `gorm:"column:tax_alw;default:0.00" json:"tax_alw"`
	TaxDed          float64 `gorm:"column:tax_ded;default:0.00" json:"tax_ded"`
	OtherAdd        float64 `gorm:"column:other_add;default:0.00" json:"other_add"`
	OtherDed        float64 `gorm:"column:other_ded;default:0.00" json:"other_ded"`
	// 时间字段
	CreateTime time.Time `gorm:"column:create_time;default:CURRENT_TIMESTAMP" json:"create_time"`
	UpdateTime time.Time `gorm:"column:update_time;default:CURRENT_TIMESTAMP;autoUpdateTime" json:"update_time"`
}

type Attendances struct {
	ID         uint    `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	EmployeeID string  `gorm:"column:employee_id;not null" json:"employee_id"`
	Work       int     `gorm:"column:work;default:0" json:"work"`
	ProjectID  int     `gorm:"column:project_id;default:NULL" json:"project_id"`
	Permission int     `gorm:"column:permission;default:0" json:"permission"`
	Off        float64 `gorm:"column:off;default:0" json:"off"`
	Month      string  `gorm:"column:month;not null" json:"month"`

	W    float64 `gorm:"column:w;default:0" json:"w"`
	Ons  float64 `gorm:"column:ons;default:0" json:"ons"`
	OsOa float64 `gorm:"column:os_oa;default:0" json:"os_oa"`
	Ot   float64 `gorm:"column:ot;default:0" json:"ot"`
	Ovt  float64 `gorm:"column:ovt;default:0" json:"ovt"`
	Bt   float64 `gorm:"column:bt;default:0" json:"bt"`
	T    float64 `gorm:"column:t;default:0" json:"t"`
	Tnt  float64 `gorm:"column:tnt;default:0" json:"tnt"`
	Al   float64 `gorm:"column:al;default:0" json:"al"`
	Rot  float64 `gorm:"column:rot;default:0" json:"rot"`
	Tr   float64 `gorm:"column:tr;default:0" json:"tr"`
	St   float64 `gorm:"column:st;default:0" json:"st"`
	Ls   float64 `gorm:"column:ls;default:0" json:"ls"`
	Q    float64 `gorm:"column:q;default:0" json:"q"`
	Wfh  float64 `gorm:"column:wfh;default:0" json:"wfh"`
	Pl   float64 `gorm:"column:pl;default:0" json:"pl"`
	L    float64 `gorm:"column:l;default:0" json:"l"`
	Sc   float64 `gorm:"column:sc;default:0" json:"sc"`
	Sc1  float64 `gorm:"column:sc1;default:0" json:"sc1"`
	Co   float64 `gorm:"column:co;default:0" json:"co"`
	Pm   float64 `gorm:"column:pm;default:0" json:"pm"`
	Na   float64 `gorm:"column:na;default:0" json:"na"`
}

// Salaries 对应 salaries 数据表的 GORM 模型
type Salaries struct {
	ID          uint    `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	Month       string  `gorm:"column:month;not null" json:"month"`
	ProjectID   int     `gorm:"column:project_id;default:0" json:"project_id"`
	EmployeeID  string  `gorm:"column:employee_id;not null" json:"employee_id"`
	TaxStatus   float64 `gorm:"column:tax_status;default:0" json:"tax_status"`
	BasicSalary float64 `gorm:"column:basic_salary;default:0.00" json:"basic_salary"`

	CreateTime       time.Time `gorm:"column:create_time;default:CURRENT_TIMESTAMP" json:"create_time"`
	UpdateTime       time.Time `gorm:"column:update_time;default:CURRENT_TIMESTAMP;autoUpdateTime" json:"update_time"`
	SalarySlipStatus string    `gorm:"column:salary_slip_status;default:'0'" json:"salary_slip_status"`
	PulsaAlwMonth    float64   `gorm:"column:pulsa_alw_month;default:0.00" json:"pulsa_alw_month"`
	IsCalculate      int       `gorm:"column:is_calculate;default:1" json:"is_calculate"`
	DeleteFlag       int       `gorm:"column:delete_flag;default:0" json:"delete_flag"`
	Age              float64   `gorm:"column:age;default:0" json:"age"`

	// Fixed Allowance - 固定津贴
	// PostFunctionAlw float64 `gorm:"column:post_function_alw;default:0" json:"post_function_alw"`
	// PhoneAlw         float64 `gorm:"column:phone_alw;default:0" json:"phone_alw"`
	// InternetAlw      float64 `gorm:"column:internet_alw;default:0" json:"internet_alw"`
	// Incentive        float64 `gorm:"column:incentive;default:0" json:"incentive"`
	// OperationalAlw   float64 `gorm:"column:operational_alw;default:0" json:"operational_alw"`
	// HousingAlw       float64 `gorm:"column:housing_alw;default:0" json:"housing_alw"`
	// SeniorityAlw     float64 `gorm:"column:seniority_alw;default:0" json:"seniority_alw"`
	// TransportAlw     float64 `gorm:"column:transport_alw;default:0" json:"transport_alw"`
	// FieldAlw         float64 `gorm:"column:field_alw;default:0" json:"field_alw"`
	// AccommodationAlw float64 `gorm:"column:accommodation_alw;default:0" json:"accommodation_alw"`
	TotalFixedAlw float64 `gorm:"column:total_fixed_alw;default:0" json:"total_fixed_alw"`

	// Non-Fixed Allowance - 非固定津贴
	// THR              float64 `gorm:"column:thr;default:0" json:"thr"`
	// Bonus            float64 `gorm:"column:bonus;default:0" json:"bonus"`
	// Compensation     float64 `gorm:"column:compensation;default:0" json:"compensation"`
	// ActingAlw        float64 `gorm:"column:acting_alw;default:0" json:"acting_alw"`
	// SalaryProrate    float64 `gorm:"column:salary_prorate;default:0" json:"salary_prorate"`
	// OtherNonFixed    float64 `gorm:"column:other_non_fixed;default:0" json:"other_non_fixed"`
	// WorkProrate      float64 `gorm:"column:work_prorate;default:0" json:"work_prorate"`
	WorkAlw          float64 `gorm:"column:work_alw;default:0" json:"work_alw"`
	OsOaAlw          float64 `gorm:"column:osoa_alw;default:0" json:"osoa_alw"`
	OvtAlw           float64 `gorm:"column:ovt_alw;default:0" json:"ovt_alw"`
	BtAlw            float64 `gorm:"column:bt_alw;default:0" json:"bt_alw"`
	TAlw             float64 `gorm:"column:t_alw;default:0" json:"t_alw"`
	TntAlw           float64 `gorm:"column:tnt_alw;default:0" json:"tnt_alw"`
	AlAlw            float64 `gorm:"column:al_alw;default:0" json:"al_alw"`
	RotAlw           float64 `gorm:"column:rot_alw;default:0" json:"rot_alw"`
	TrAlw            float64 `gorm:"column:tr_alw;default:0" json:"tr_alw"`
	StAlw            float64 `gorm:"column:st_alw;default:0" json:"st_alw"`
	LsAlw            float64 `gorm:"column:ls_alw;default:0" json:"ls_alw"`
	OnAlw            float64 `gorm:"column:on_alw;default:0" json:"on_alw"`
	OtAlw            float64 `gorm:"column:ot_alw;default:0" json:"ot_alw"`
	TotalNonFixedAlw float64 `gorm:"column:total_non_fixed_alw;default:0" json:"total_non_fixed_alw"`

	// Salary Deduction - 薪资扣除
	QDed      float64 `gorm:"column:q_ded;default:0" json:"q_ded"`
	PlDed     float64 `gorm:"column:pl_ded;default:0" json:"pl_ded"`
	LateDed   float64 `gorm:"column:late_ded;default:0" json:"late_ded"`
	ScDed     float64 `gorm:"column:sc_ded;default:0" json:"sc_ded"`
	Sc1Ded    float64 `gorm:"column:sc1_ded;default:0" json:"sc1_ded"`
	CoDed     float64 `gorm:"column:co_ded;default:0" json:"co_ded"`
	PmDed     float64 `gorm:"column:pm_ded;default:0" json:"pm_ded"`
	NaDed     float64 `gorm:"column:na_ded;default:0" json:"na_ded"`
	SalaryDed float64 `gorm:"column:salary_ded;default:0" json:"salary_ded"`

	// BPJS Allowances
	JkkAlw          float64 `gorm:"column:jkk_alw;default:0" json:"jkk_alw"`
	JkmAlw          float64 `gorm:"column:jkm_alw;default:0" json:"jkm_alw"`
	JhtAlw          float64 `gorm:"column:jht_alw;default:0" json:"jht_alw"`
	JpAlw           float64 `gorm:"column:jp_alw;default:0" json:"jp_alw"`
	BpjsManpowerAlw float64 `gorm:"column:bpjs_manpower_alw;default:0" json:"bpjs_manpower_alw"`
	BpjsHealthAlw   float64 `gorm:"column:bpjs_health_alw;default:0" json:"bpjs_health_alw"`

	// Gross Salary - 总薪资
	GrossSalary float64 `gorm:"column:gross_salary;default:0" json:"gross_salary"`

	// BPJS/TAX Deduction - BPJS/税费扣除
	JhtDed             float64 `gorm:"column:jht_ded;default:0" json:"jht_ded"`
	JpDed              float64 `gorm:"column:jp_ded;default:0" json:"jp_ded"`
	BpjsWorkDed        float64 `gorm:"column:bpjs_work_ded;default:0" json:"bpjs_work_ded"`
	BpjsHealthDed      float64 `gorm:"column:bpjs_health_ded;default:0" json:"bpjs_health_ded"`
	BpjsHealthTambahan float64 `gorm:"column:bpjs_health_tambahan;default:0" json:"bpjs_health_tambahan"`
	// TaxDed             float64 `gorm:"column:tax_ded;default:0" json:"tax_ded"`
	// TotalBpjsTaxDed float64 `gorm:"column:total_bpjs_tax_ded;default:0" json:"total_bpjs_tax_ded"`

	// Final - 最终
	TotalDeduction    float64 `gorm:"column:total_deduction;default:0" json:"total_deduction"`
	FinalStaffReceive float64 `gorm:"column:final_staff_receive;default:0" json:"final_staff_receive"`

	// Additional fields for display
	ProjectName  string `gorm:"-" json:"project_name"`
	EmployeeName string `gorm:"-" json:"employee_name"`
	Position     string `gorm:"-" json:"position"`
	Department   string `gorm:"-" json:"department"`
	NPWP         string `gorm:"-" json:"npwp"`
	Location     string `gorm:"-" json:"location"`
	JoinDate     string `gorm:"-" json:"join_date"`
	IDCard       string `gorm:"-" json:"id_card"`
}

// Employee 对应 employees 数据表的 GORM 模型
type Employee struct {
	// 主键字段
	ID uint `gorm:"column:id;primaryKey;autoIncrement" json:"id"` // SERIAL PRIMARY KEY

	// 核心业务字段
	EmployeeID               string    `gorm:"column:employee_id;not null" json:"employee_id"`              // TEXT NOT NULL
	ProjectID                int       `gorm:"column:project_id;default:0" json:"project_id"`               // INTEGER default 0
	EmployeeName             string    `gorm:"column:employee_name;not null" json:"employee_name"`          // TEXT NOT NULL
	Department               string    `gorm:"column:department" json:"department"`                         // TEXT
	Position                 string    `gorm:"column:position" json:"position"`                             // TEXT                                     // TEXT
	Salary                   float64   `gorm:"column:salary;default:0.00" json:"salary"`                    // NUMERIC default 0.00
	TaxStatus                float64   `gorm:"column:tax_status;default:0.00" json:"tax_status"`            // NUMERIC default 0.00
	IdCard                   string    `gorm:"column:id_card;default:'000000000000000000'" json:"id_card"`  // TEXT default
	Npwp                     string    `gorm:"column:npwp;default:'123'" json:"npwp"`                       // TEXT default
	HierarchyID              string    `gorm:"column:hierarchy_id;default:'0'" json:"hierarchy_id"`         // TEXT default
	HierarchyName            string    `gorm:"column:hierarchy_name" json:"hierarchy_name"`                 // TEXT
	JoinDate                 time.Time `gorm:"column:join_date;default:CURRENT_TIMESTAMP" json:"join_date"` // TIMESTAMP
	ResignDate               time.Time `gorm:"column:resign_date;default:CURRENT_TIMESTAMP" json:"resign_date"`
	Email                    string    `gorm:"column:email;default:''" json:"email"`                                         // TEXT default
	BasicSalary              float64   `gorm:"column:basic_salary;default:0.00" json:"basic_salary"`                         // NUMERIC default 0.00
	CreatedAt                time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`                // TIMESTAMP
	UpdatedAt                time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP;autoUpdateTime" json:"updated_at"` // TIMESTAMP
	TaxType                  string    `gorm:"column:tax_type;default:'TK/0'" json:"tax_type"`                               // TEXT default
	DeleteFlag               int       `gorm:"column:delete_flag;default:0" json:"delete_flag"`
	BPJSHealthTambahanStatus string    `gorm:"column:bpjs_health_tambahan_status;default:0" json:"bpjs_health_tambahan_status"` // INTEGER default 0
	DateOfBirth              string    `gorm:"column:date_of_birth;default:CURRENT_TIMESTAMP" json:"date_of_birth"`
	PostFunctionAlwMonth     float64   `gorm:"column:post_function_alw_month;default:0.00" json:"post_function_alw_month"` // NUMERIC default 0.00
	PhoneAlwMonth            float64   `gorm:"column:phone_alw_month;default:0.00" json:"phone_alw_month"`                 // NUMERIC default 0.00
	InternetAlwMonth         float64   `gorm:"column:internet_alw_month;default:0.00" json:"internet_alw_month"`           // NUMERIC default 0.00
	IncentiveMonth           float64   `gorm:"column:incentive_month;default:0.00" json:"incentive_month"`                 // NUMERIC default 0.00
	OperationalAlwMonth      float64   `gorm:"column:operational_alw_month;default:0.00" json:"operational_alw_month"`     // NUMERIC default 0.00
	HousingAlwMonth          float64   `gorm:"column:housing_alw_month;default:0.00" json:"housing_alw_month"`             // NUMERIC default 0.00
	SeniorityAlwMonth        float64   `gorm:"column:seniority_alw_month;default:0.00" json:"seniority_alw_month"`         // NUMERIC default 0.00
	TransportAlwMonth        float64   `gorm:"column:transport_alw_month;default:0.00" json:"transport_alw_month"`         // NUMERIC default 0.00
	FieldAlwMonth            float64   `gorm:"column:field_alw_month;default:0.00" json:"field_alw_month"`                 // NUMERIC default 0.00
	AccommodationAlwMonth    float64   `gorm:"column:accommodation_alw_month;default:0.00" json:"accommodation_alw_month"` // NUMERIC default 0.00
	WorkDay                  float64   `gorm:"column:work_day;default:0" json:"work_day"`                                  // INTEGER default 0
	OnDay                    float64   `gorm:"column:on_day;default:0" json:"on_day"`                                      // INTEGER default 0
	BTDay                    float64   `gorm:"column:bt_day;default:0" json:"bt_day"`                                      // INTEGER default 0
	OADay                    float64   `gorm:"column:oa_day;default:0" json:"oa_day"`                                      // INTEGER default 0
	TravellDay               float64   `gorm:"column:travell_day;default:0" json:"travell_day"`                            // INTEGER default 0
	TnTDay                   float64   `gorm:"column:tnt_day;default:0" json:"tnt_day"`                                    // INTEGER default 0
	STDay                    float64   `gorm:"column:st_day;default:0" json:"st_day"`                                      // INTEGER default 0
	TRDay                    float64   `gorm:"column:tr_day;default:0" json:"tr_day"`                                      // INTEGER default 0
}

type TaxRates struct {
	ID        uint    `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	SalaryMin float64 `gorm:"column:salary_min;type:numeric;not null;default:0" json:"salary_min"`
	SalaryMax float64 `gorm:"column:salary_max;type:numeric;not null" json:"salary_max"`
	TaxRate   float64 `gorm:"column:tax_rate;type:numeric;not null;check:tax_rate >= 0 AND tax_rate <= 1" json:"tax_rate"`
	Grade     string  `gorm:"column:grade;type:text;not null" json:"grade"`
}

type TaxFreeBases struct {
	ID          uint    `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	Grade       string  `gorm:"column:grade;type:text;not null;unique" json:"grade"`
	FreeTaxBase float64 `gorm:"column:free_tax_base;type:numeric;not null;default:0" json:"free_tax_base"`
}

type SalaryCoefficient struct {
	ID          uint      `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	CJmstkAlw   float64   `gorm:"column:c_jmstk_alw;type:numeric;default:0.0000" json:"c_jmstk_alw"`
	CPensionAlw float64   `gorm:"column:c_pension_alw;type:numeric;default:0.0000" json:"c_pension_alw"`
	CAskesAlw   float64   `gorm:"column:c_askes_alw;type:numeric;default:0.0000" json:"c_askes_alw"`
	COtHour1    float64   `gorm:"column:c_ot_hour1;type:numeric;default:0.00" json:"c_ot_hour1"`
	COtWages1   float64   `gorm:"column:c_ot_wages1;type:numeric;default:0.0000" json:"c_ot_wages1"`
	CEwHour1    float64   `gorm:"column:c_ew_hour1;type:numeric;default:0.00" json:"c_ew_hour1"`
	CEwWages1   float64   `gorm:"column:c_ew_wages1;type:numeric;default:0.0000" json:"c_ew_wages1"`
	CEwHour2    float64   `gorm:"column:c_ew_hour2;type:numeric;default:0.00" json:"c_ew_hour2"`
	CEwWages2   float64   `gorm:"column:c_ew_wages2;type:numeric;default:0.0000" json:"c_ew_wages2"`
	CEwHour3    float64   `gorm:"column:c_ew_hour3;type:numeric;default:0.00" json:"c_ew_hour3"`
	CEwWages3   float64   `gorm:"column:c_ew_wages3;type:numeric;default:0.0000" json:"c_ew_wages3"`
	CJmstkFee   float64   `gorm:"column:c_jmstk_fee;type:numeric;default:0.0000" json:"c_jmstk_fee"`
	CPensionDed float64   `gorm:"column:c_pension_ded;type:numeric;default:0.0000" json:"c_pension_ded"`
	CAskesDed   float64   `gorm:"column:c_askes_ded;type:numeric;default:0.0000" json:"c_askes_ded"`
	JmstkMax    float64   `gorm:"column:jmstk_max;type:numeric;default:0.0000" json:"jmstk_max"`
	PensionMax  float64   `gorm:"column:pension_max;type:numeric;default:0.0000" json:"pension_max"`
	AskesMax    float64   `gorm:"column:askes_max;type:numeric;default:0.0000" json:"askes_max"`
	AskesMin    float64   `gorm:"column:askes_min;type:numeric;default:0.0000" json:"askes_min"`
	CreateTime  time.Time `gorm:"column:create_time;default:CURRENT_TIMESTAMP" json:"create_time"`
	UpdateTime  time.Time `gorm:"column:update_time;default:CURRENT_TIMESTAMP;autoUpdateTime" json:"update_time"`
	IsDelete    int       `gorm:"column:is_delete;default:0" json:"is_delete"`
}

// SystemConfig 系统配置表
type SystemConfig struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name       string    `gorm:"type:text;not null" json:"name"`
	Config     string    `gorm:"type:text;not null" json:"config"`
	CreateTime time.Time `gorm:"column:create_time;default:CURRENT_TIMESTAMP" json:"create_time"`
	UpdateTime time.Time `gorm:"column:update_time;default:CURRENT_TIMESTAMP" json:"update_time"`
}

type SalarySlips struct {
	ID             uint      `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	Month          string    `gorm:"column:month;not null" json:"month"`
	ProjectID      int       `gorm:"column:project_id;default:0" json:"project_id"`
	EmployeeID     string    `gorm:"column:employee_id;not null" json:"employee_id"`
	EmployeeName   string    `gorm:"column:employee_name" json:"employee_name"`
	Department     string    `gorm:"column:department" json:"department"`
	Position       string    `gorm:"column:position" json:"position"`
	IdCard         string    `gorm:"column:id_card" json:"id_card"`
	BankAccount    string    `gorm:"column:bank_account" json:"bank_account"`
	BankName       string    `gorm:"column:bank_name" json:"bank_name"`
	BasicSalary    float64   `gorm:"column:basic_salary;default:0.00" json:"basic_salary"`
	AllowanceTotal float64   `gorm:"column:allowance_total;default:0.00" json:"allowance_total"`
	DeductionTotal float64   `gorm:"column:deduction_total;default:0.00" json:"deduction_total"`
	OvertimeTotal  float64   `gorm:"column:overtime_total;default:0.00" json:"overtime_total"`
	GrossSalary    float64   `gorm:"column:gross_salary;default:0.00" json:"gross_salary"`
	TaxDeduction   float64   `gorm:"column:tax_deduction;default:0.00" json:"tax_deduction"`
	NetSalary      float64   `gorm:"column:net_salary;default:0.00" json:"net_salary"`
	Status         string    `gorm:"column:status;default:'0'" json:"status"`
	Remark         string    `gorm:"column:remark" json:"remark"`
	CreateTime     time.Time `gorm:"column:create_time;default:CURRENT_TIMESTAMP" json:"create_time"`
	UpdateTime     time.Time `gorm:"column:update_time;default:CURRENT_TIMESTAMP;autoUpdateTime" json:"update_time"`
	DeleteFlag     int       `gorm:"column:delete_flag;default:0" json:"delete_flag"`
}
