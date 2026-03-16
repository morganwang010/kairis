package service

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
	"log/slog"
	"strings"
	"time"
)

type LicenseService struct {
	licenseRepo *repository.LicenseRepository
}

func NewLicenseService(licenseRepo *repository.LicenseRepository) *LicenseService {
	return &LicenseService{
		licenseRepo: licenseRepo,
	}
}

func (s *LicenseService) CreateLicense(license *model.License) error {
	return s.licenseRepo.Create(license)
}

func (s *LicenseService) GetLicenseByID(id int) (*model.License, error) {
	return s.licenseRepo.GetByID(id)
}

func (s *LicenseService) GetLicenseByLicenseKey(licenseKey string) (*model.License, error) {
	return s.licenseRepo.GetByLicenseKey(licenseKey)
}

func (s *LicenseService) ListLicenses(offset, limit int) ([]model.License, int64, error) {
	return s.licenseRepo.List(offset, limit)
}

func (s *LicenseService) UpdateLicense(license *model.License) error {
	return s.licenseRepo.Update(license)
}

func (s *LicenseService) DeleteLicense(id int) error {
	return s.licenseRepo.Delete(id)
}

func (s *LicenseService) ActivateLicense(licenseKey, companyName string) (*model.License, error) {
	license, err := VerifyLicense(licenseKey)
	if err != nil {
		return nil, err
	}
	slog.Info("777Activating license %s for company %s", licenseKey, companyName)
	now := time.Now().Format("2006-01-02")
	license.Status = "active"
	license.ActivationDate = now
	// license.CompanyName = companyName

	// // 假设许可证有效期为1年
	// expiration := time.Now().AddDate(1, 0, 0).Format("2006-01-02")
	// license.ExpirationDate = expiration
	// license.ValidUntil = expiration

	if err := s.licenseRepo.Create(license); err != nil {
		return nil, err
	}

	return license, nil
}

func (s *LicenseService) DeactivateLicense(licenseKey string) error {
	license, err := s.licenseRepo.GetByLicenseKey(licenseKey)
	if err != nil {
		return err
	}

	license.Status = "inactive"

	return s.licenseRepo.Update(license)
}

func (s *LicenseService) CheckLicense() (*model.License, error) {
	license, err := s.licenseRepo.CheckLicense()
	if err != nil {
		return nil, err
	}

	if license.Status != "active" {
		return nil, nil
	}

	// if license.CompanyName != companyName {
	// 	return nil, nil
	// }

	// if license.EmployeeCount < employeeCount {
	// 	return nil, nil
	// }

	// 检查许可证是否过期
	if license.ExpirationDate != "" {
		expirationDate, err := time.Parse("2006-01-02", license.ExpirationDate)
		if err == nil {
			now := time.Now()
			if expirationDate.Before(now) {
				return nil, nil
			}
		}
	} else if license.ValidUntil != "" {
		validUntil, err := time.Parse("2006-01-02", license.ValidUntil)
		if err == nil {
			now := time.Now()
			if validUntil.Before(now) {
				return nil, nil
			}
		}
	}

	return license, nil
}

// VerifyLicense 验证许可证密钥，逻辑与 Rust 版本完全对齐
func VerifyLicense(licenseKey string) (*model.License, error) {
	// 1. 移除许可证中的连字符
	cleanLicenseKey := strings.ReplaceAll(licenseKey, "-", "")

	// 2. Base64 解码
	decoded, err := base64.StdEncoding.DecodeString(cleanLicenseKey)
	if err != nil {
		return nil, errors.New("License格式错误")
	}

	// 3. 转换为字符串
	decodedStr := string(decoded)
	slog.Info("11111Activating license for company %s", decodedStr)

	// 4. 分离数据和签名（按 | 分割）
	parts := strings.Split(decodedStr, "|")
	if len(parts) != 2 {
		return nil, errors.New("License格式错误")
	}
	dataString := parts[0]
	signature := parts[1]

	// 5. 验证 HMAC SHA256 签名
	const secretKey = "hrms-license-secret-key-2026"
	// 创建 HMAC 哈希器
	h := hmac.New(sha256.New, []byte(secretKey))
	_, err = h.Write([]byte(dataString))
	if err != nil {
		return nil, errors.New("签名计算失败")
	}
	// 计算期望的签名（十六进制格式）
	expectedSignature := h.Sum(nil)
	expectedSignatureHex := hex.EncodeToString(expectedSignature)

	// 对比签名
	if expectedSignatureHex != signature {
		return nil, errors.New("License签名无效")
	}
	slog.Info("222Activating license for company ")

	// 6. 解析 JSON 数据为 License 结构体
	// 将dataString转换为json格式，以更方便获取其中的值
	var data map[string]interface{}
	err = json.Unmarshal([]byte(dataString), &data)
	if err != nil {
		return nil, errors.New("License数据解析失败")
	}
	// slog.Info("license77777 ")
	var license model.License
	license.LicenseKey = licenseKey
	license.CompanyName = data["companyName"].(string)
	// license.EmployeeCount = int(data["employee_count"].(float64))
	license.ValidUntil = data["expirationDate"].(string)
	license.ExpirationDate = data["expirationDate"].(string)

	// err = json.Unmarshal([]byte(dataString), &license)
	// if err != nil {
	// 	return nil, errors.New("License数据解析失败")
	// }

	return &license, nil
}
