package service

import (
	"bytes"
	"fmt"
	"io"
	"kairis/backend/internal/repository"
	"strconv"
	"time"

	"github.com/jung-kurt/gofpdf"
	"gopkg.in/gomail.v2"
)

type EmailService struct {
	emailRepo *repository.EmailRepository
}

func NewEmailService(emailRepo *repository.EmailRepository) *EmailService {
	return &EmailService{emailRepo: emailRepo}
}

// SendEmailRequest 发送邮件请求结构
type SendEmailRequest struct {
	To         string `json:"to"`
	Subject    string `json:"subject"`
	Body       string `json:"body"`
	EmployeeID string `json:"employee_id"`
	Month      string `json:"month"`
	ProjectID  string `json:"project_id"`
}

// SendEmailResponse 发送邮件响应结构
type SendEmailResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// GeneratePDF 生成薪资单PDF（使用 Salaries 数据结构）
func (s *EmailService) GeneratePDF(salary *repository.SalaryWithEmployee) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// 添加标题
	pdf.SetFont("Arial", "B", 16)
	pdf.CellFormat(0, 10, "SLIP GAJI", "", 1, "C", false, 0, "")

	// 格式化金额
	formatAmount := func(amount float64) string {
		return strconv.FormatFloat(amount, 'f', 0, 64)
	}

	// 格式化日期
	formatDate := func(dateStr string) string {
		if dateStr == "" {
			return ""
		}
		// 尝试解析时间格式
		t, err := time.Parse("2006-01-02", dateStr)
		if err == nil {
			return t.Format("02/01/2006")
		}
		t, err = time.Parse(time.RFC3339, dateStr)
		if err == nil {
			return t.Format("02/01/2006")
		}
		return dateStr
	}

	// 员工信息表格
	pdf.SetFont("Arial", "", 10)
	startY := 30.0

	// 员工信息数据（与前端保持一致）
	employeeInfo := [][]string{
		{"DATE", salary.Month, "Employee_ID", salary.EmployeeID},
		{"Employee_Name", salary.EmployeeName, "NPWP", salary.Npwp},
		{"IDCard_Number", salary.IdCard, "Location_Name", salary.LocationName},
		{"Position", salary.Position + "/" + salary.Department, "Join_Date", formatDate(salary.JoinDate)},
	}

	// 绘制员工信息表格
	pdf.SetY(startY)
	for _, row := range employeeInfo {
		pdf.SetFont("Arial", "B", 9)
		pdf.CellFormat(40, 8, row[0], "1", 0, "L", false, 0, "")
		pdf.SetFont("Arial", "", 9)
		pdf.CellFormat(60, 8, row[1], "1", 0, "L", false, 0, "")
		pdf.SetFont("Arial", "B", 9)
		pdf.CellFormat(40, 8, row[2], "1", 0, "L", false, 0, "")
		pdf.SetFont("Arial", "", 9)
		pdf.CellFormat(50, 8, row[3], "1", 1, "L", false, 0, "")
	}

	// 薪资详情表格
	pdf.Ln(5)
	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(0, 10, "SALARY DETAILS", "", 1, "L", false, 0, "")

	// 薪资详情数据（与前端保持一致）
	salaryDetails := [][]string{
		{"Basic_Salary", formatAmount(salary.BasicSalary), "Field_Alw", formatAmount(salary.FieldAlw)},
		{"Housing_Alw", formatAmount(salary.HousingAlw), "Position_Alw", formatAmount(salary.PositionAlw)},
		{"TOTAL_NET_WAGES", formatAmount(salary.TotalNetWages), "Fix_Alw", formatAmount(salary.FixAlw)},
		{"Housing_ALW_Tetap", formatAmount(salary.HousingAlwTetap), "Meal_Alw", formatAmount(salary.MealAlw)},
		{"Pulsa_Alw_Month", formatAmount(salary.PulsaAlwMonth), "Transp_Alw", formatAmount(salary.TranspAlw)},
		{"Jmstk_Alw", formatAmount(salary.JmstkAlw), "Tax_Alw_Salary", formatAmount(salary.TaxAlwSalary)},
		{"Pension_Alw", formatAmount(salary.PensionAlw), "Askes_Bpjs_Alw", formatAmount(salary.AskesBpjsAlw)},
		{"OT1_Wages", formatAmount(salary.Ot1Wages), "EW1_Wages", formatAmount(salary.Ew1Wages)},
		{"EW2_Wages", formatAmount(salary.Ew2Wages), "EW3_Wages", formatAmount(salary.Ew3Wages)},
		{"Pulsa_Alw", formatAmount(salary.PulsaAlw), "Med_Alw", formatAmount(salary.MedAlw)},
		{"Att_Alw", formatAmount(salary.AttAlw), "Leave_Comp", formatAmount(salary.LeavComp)},
		{"Mandah_Alw", formatAmount(salary.MandahAlw), "Religious_Alw", formatAmount(salary.ReligiousAlw)},
		{"Incentive_Alw", formatAmount(salary.IncentiveAlw), "Rapel_Basic_Salary", formatAmount(salary.RapelBasicSalary)},
		{"Performance_Alw", formatAmount(salary.PerformanceAlw), "Rapel_Jmstk_Alw", formatAmount(salary.RapelJmstkAlw)},
		{"Comp_PHK", formatAmount(salary.CompPhk), "Trip_Alw", formatAmount(salary.TripAlw)},
		{"Tax_Alw_PHK", formatAmount(salary.TaxAlwPhk), "Acting", formatAmount(salary.Acting)},
		{"Others", formatAmount(salary.Others), "Correct_Add", formatAmount(salary.CorrectAdd)},
		{"Tax_Ded_PHK", formatAmount(salary.TaxDedPhk), "Incentive_Ded", formatAmount(salary.IncentiveDed)},
		{"Absent_Ded", formatAmount(salary.AbsentDed), "Loan_Ded", formatAmount(salary.LoanDed)},
		{"Absent_Ded2", formatAmount(salary.AbsentDed2), "Correct_Sub", formatAmount(salary.CorrectSub)},
		{"Total_Accept", formatAmount(salary.TotalAccept), "", ""},
		{"JMSTK_Fee", formatAmount(salary.JmstkFee), "Tax_Ded_Salary", formatAmount(salary.TaxDedSalary)},
		{"Pension_Ded", formatAmount(salary.PensionDed), "Askes_Bpjs_Ded", formatAmount(salary.AskesBpjsDed)},
		{"Round_Off_Salary", formatAmount(salary.RoundOffSalary), "", ""},
		{"TOT TRANSFER", formatAmount(salary.RoundOffSalary), "", ""},
	}

	// 绘制薪资详情表格
	currentY := pdf.GetY() + 5
	for _, row := range salaryDetails {
		// 检查是否需要换页
		if currentY > 260 {
			pdf.AddPage()
			currentY = 20
		}
		pdf.SetY(currentY)

		pdf.SetFont("Arial", "B", 7)
		pdf.CellFormat(40, 6, row[0], "1", 0, "L", false, 0, "")
		pdf.SetFont("Arial", "", 7)
		pdf.CellFormat(60, 6, row[1], "1", 0, "R", false, 0, "")
		pdf.SetFont("Arial", "B", 7)
		pdf.CellFormat(40, 6, row[2], "1", 0, "L", false, 0, "")
		pdf.SetFont("Arial", "", 7)
		pdf.CellFormat(50, 6, row[3], "1", 1, "R", false, 0, "")

		currentY = pdf.GetY()
	}

	// 输出到字节数组
	var buf bytes.Buffer
	err := pdf.Output(&buf)
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

// SendEmail 发送邮件（带PDF附件）
func (s *EmailService) SendEmail(req SendEmailRequest) (*SendEmailResponse, error) {
	// 获取薪资数据（联合查询）

	salary, err := s.emailRepo.GetSalaryWithEmployeeByMonth(req.EmployeeID, req.Month, req.ProjectID)
	if err != nil {
		return &SendEmailResponse{
			Success: false,
			Message: fmt.Sprintf("获取薪资数据失败: %v", err),
		}, nil
	}

	// 获取邮件配置
	config, err := s.emailRepo.GetEmailConfig()
	if err != nil {
		return &SendEmailResponse{
			Success: false,
			Message: fmt.Sprintf("获取邮件配置失败: %v", err),
		}, nil
	}

	// 检查必要配置
	requiredConfigs := []string{"email_smtp_address", "email_smtp_port", "email_password", "email_address"}
	for _, key := range requiredConfigs {
		if _, ok := config[key]; !ok {
			return &SendEmailResponse{
				Success: false,
				Message: fmt.Sprintf("缺少必要的邮件配置: %s", key),
			}, nil
		}
	}

	// 解析端口
	port, err := strconv.Atoi(config["email_smtp_port"])
	if err != nil {
		return &SendEmailResponse{
			Success: false,
			Message: fmt.Sprintf("邮件服务器端口格式错误: %v", err),
		}, nil
	}

	// 生成PDF
	pdfData, err := s.GeneratePDF(salary)
	if err != nil {
		return &SendEmailResponse{
			Success: false,
			Message: fmt.Sprintf("生成PDF失败: %v", err),
		}, nil
	}

	// 创建邮件
	m := gomail.NewMessage()
	m.SetHeader("From", config["email_address"])
	m.SetHeader("To", req.To)
	m.SetHeader("Subject", req.Subject)
	m.SetBody("text/plain", req.Body)

	// 添加PDF附件
	m.Attach("salary_slip.pdf", gomail.SetCopyFunc(func(w io.Writer) error {
		_, err := w.Write(pdfData)
		return err
	}))

	// 发送邮件
	d := gomail.NewDialer(
		config["email_smtp_address"],
		port,
		config["email_address"],
		config["email_password"],
	)

	if err := d.DialAndSend(m); err != nil {
		return &SendEmailResponse{
			Success: false,
			Message: fmt.Sprintf("发送邮件失败: %v", err),
		}, nil
	}
	// 发送成功后，更新salary数据表中的email_sent字段
	if err := s.emailRepo.UpdateSalaryEmailSent(req.EmployeeID, req.Month, req.ProjectID, true); err != nil {
		return &SendEmailResponse{
			Success: false,
			Message: fmt.Sprintf("更新薪资数据失败: %v", err),
		}, nil
	}
	return &SendEmailResponse{
		Success: true,
		Message: fmt.Sprintf("邮件发送成功！收件人: %s, 主题: %s", req.To, req.Subject),
	}, nil
}
