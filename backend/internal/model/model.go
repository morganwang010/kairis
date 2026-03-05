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
	ID          string       `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Name        string       `gorm:"uniqueIndex;not null" json:"name"`
	Code        string       `gorm:"uniqueIndex;not null" json:"code"`
	Description string       `json:"description"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Permissions []Permission `gorm:"many2many:role_permissions;" json:"permissions"`
}

type Permission struct {
	ID          string       `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Name        string       `gorm:"uniqueIndex;not null" json:"name"`
	Code        string       `gorm:"uniqueIndex;not null" json:"code"`
	Type        string       `gorm:"not null" json:"type"`
	ResourceID  string       `json:"resource_id"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Menu struct {
	ID        string         `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Title     string         `gorm:"not null" json:"title"`
	Path      string         `gorm:"uniqueIndex;not null" json:"path"`
	Icon      string         `json:"icon"`
	Component string         `json:"component"`
	Redirect  string         `json:"redirect"`
	ParentID  *string        `json:"parent_id"`
	Sort      int            `gorm:"default:0" json:"sort"`
	Hidden    bool           `gorm:"default:false" json:"hidden"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Children  []Menu         `json:"children,omitempty"`
	Permissions []Permission `gorm:"many2many:menu_permissions;" json:"permissions,omitempty"`
}
