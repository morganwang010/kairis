package service

import (
	"bytes"
	"fmt"
	"io"
	"kairis/backend/internal/repository"
	"strconv"

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

// GeneratePDF 生成薪资单PDF（与前端保持一致格式）
func (s *EmailService) GeneratePDF(salary *repository.SalaryWithEmployee) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// 格式化金额（添加千位分隔符）
	// formatAmount := func(amount float64) string {
	// 	return fmt.Sprintf("%.0f", amount)
	// }

	// 带逗号分隔的格式化金额
	formatAmountWithComma := func(amount float64) string {
		str := fmt.Sprintf("%.0f", amount)
		result := ""
		for i, c := range str {
			if i > 0 && (len(str)-i)%3 == 0 {
				result += ","
			}
			result += string(c)
		}
		return result
	}

	// 公司信息标题
	pdf.SetFont("Arial", "B", 14)
	pdf.CellFormat(0, 8, "Great Wall Drilling Company", "", 1, "C", false, 0, "")
	pdf.SetFont("Arial", "", 11)
	pdf.CellFormat(0, 6, "GWDC", "", 1, "C", false, 0, "")
	pdf.SetFont("Arial", "B", 16)
	pdf.CellFormat(0, 10, "PAYROLL SLIP", "", 1, "C", false, 0, "")

	// 员工信息表格（两列布局）
	pdf.SetFont("Arial", "", 9)
	pdf.Ln(4)

	// 第一行
	pdf.SetFont("Arial", "B", 9)
	pdf.CellFormat(60, 6, "Employee_Name:", "", 0, "L", false, 0, "")
	pdf.SetFont("Arial", "", 9)
	pdf.CellFormat(40, 6, salary.EmployeeName, "", 0, "L", false, 0, "")
	pdf.SetFont("Arial", "B", 9)
	pdf.CellFormat(65, 6, "Project:", "", 0, "L", false, 0, "")
	pdf.SetFont("Arial", "", 9)
	pdf.CellFormat(25, 6, salary.ProjectName, "", 1, "L", false, 0, "")

	// 第二行
	pdf.SetFont("Arial", "B", 9)
	pdf.CellFormat(60, 6, "Designation:", "", 0, "L", false, 0, "")
	pdf.SetFont("Arial", "", 9)
	pdf.CellFormat(40, 6, salary.Position, "", 0, "L", false, 0, "")
	pdf.SetFont("Arial", "B", 9)
	pdf.CellFormat(65, 6, "Month:", "", 0, "L", false, 0, "")
	pdf.SetFont("Arial", "", 9)
	pdf.CellFormat(25, 6, salary.Month, "", 1, "L", false, 0, "")

	// 分隔线
	pdf.SetLineWidth(0.5)
	pdf.Line(15, pdf.GetY(), 195, pdf.GetY())
	pdf.Ln(4)

	// Fixed Allowance 部分
	pdf.SetFont("Arial", "B", 11)
	pdf.CellFormat(80, 6, "Fixed_Alw:", "", 0, "L", false, 0, "")
	pdf.CellFormat(0, 6, formatAmountWithComma(salary.TotalFixedAlw), "", 1, "R", false, 0, "")

	// 固定津贴数据（两列布局）
	fixedAlwData := []struct {
		label string
		value float64
	}{
		{"Basic_Salary", salary.BasicSalary},
		{"Post_Function", salary.PostFunctionAlwMonth},
		{"Phone_Alw", salary.PhoneAlwMonth},
		{"Internet_Alw", salary.InternetAlwMonth},
		{"Incentive", salary.IncentiveMonth},
		{"Operational", salary.OperationalAlwMonth},
		{"Housing_Alw", salary.HousingAlwMonth},
		{"Seniority", salary.SeniorityAlwMonth},
		{"Transport_Alw", salary.TransportAlwMonth},
		{"Field_Alw", salary.FieldAlwMonth},
		{"Accomodation", salary.AccommodationAlwMonth},
	}

	pdf.SetFont("Arial", "", 8)
	colWidth := 90.0
	fixedAlwFiltered := []struct {
		label string
		value float64
	}{}
	for _, item := range fixedAlwData {
		if item.value != 0 {
			fixedAlwFiltered = append(fixedAlwFiltered, item)
		}
	}
	for i, item := range fixedAlwFiltered {
		if i%2 == 0 {
			pdf.CellFormat(colWidth-25, 5, item.label, "", 0, "L", false, 0, "")
			pdf.CellFormat(25, 5, formatAmountWithComma(item.value), "", 0, "R", false, 0, "")
		} else {
			pdf.CellFormat(colWidth-25, 5, item.label, "", 0, "L", false, 0, "")
			pdf.CellFormat(25, 5, formatAmountWithComma(item.value), "", 1, "R", false, 0, "")
		}
	}
	if len(fixedAlwFiltered)%2 != 0 {
		pdf.Ln(5)
	}

	pdf.Ln(3)
	pdf.Line(15, pdf.GetY(), 195, pdf.GetY())
	pdf.Ln(4)

	// Non-Fixed Allowance 部分
	pdf.SetFont("Arial", "B", 11)
	pdf.CellFormat(80, 6, "Non_Fixed_Alw:", "", 0, "L", false, 0, "")
	pdf.CellFormat(0, 6, formatAmountWithComma(salary.TotalNonFixedAlw), "", 1, "R", false, 0, "")

	nonFixedAlwData := []struct {
		label string
		value float64
	}{
		{"THR", salary.Thr},
		{"Bonus", salary.Bonus},
		{"Compensation", salary.Compensation},
		{"Acting_Alw", salary.ActingAlw},
		{"Salary_Prorate", salary.SalaryProrate},
		{"Other", salary.OtherNonFixed},
		{"Work_Prorate", salary.WorkProrate},
		{"Work_Alw", salary.WorkAlw},
		{"OS_Alw", salary.OsAlw},
		{"OA_Alw", salary.OaAlw},
		{"OVT_Alw", salary.OvtAlw},
		{"BT_Alw", salary.BtAlw},
		{"On_Alw", salary.OnAlw},
		{"OT_Alw", salary.OtAlw},
		{"T_Alw", salary.TAlw},
		{"TNT_Alw", salary.TntAlw},
		{"AL_Alw", salary.AlAlw},
		{"ROT_Alw", salary.RotAlw},
		{"TR_Alw", salary.TrAlw},
		{"ST_Alw", salary.StAlw},
		{"LS_Alw", salary.LsAlw},
	}

	pdf.SetFont("Arial", "", 8)
	nonFixedAlwFiltered := []struct {
		label string
		value float64
	}{}
	for _, item := range nonFixedAlwData {
		if item.value != 0 {
			nonFixedAlwFiltered = append(nonFixedAlwFiltered, item)
		}
	}
	for i, item := range nonFixedAlwFiltered {
		if i%2 == 0 {
			pdf.CellFormat(colWidth-25, 5, item.label, "", 0, "L", false, 0, "")
			pdf.CellFormat(25, 5, formatAmountWithComma(item.value), "", 0, "R", false, 0, "")
		} else {
			pdf.CellFormat(colWidth-25, 5, item.label, "", 0, "L", false, 0, "")
			pdf.CellFormat(25, 5, formatAmountWithComma(item.value), "", 1, "R", false, 0, "")
		}
	}
	if len(nonFixedAlwFiltered)%2 != 0 {
		pdf.Ln(5)
	}

	pdf.Ln(3)
	pdf.Line(15, pdf.GetY(), 195, pdf.GetY())
	pdf.Ln(4)

	// Salary Deduction 部分
	totalSalaryDed := salary.QDed + salary.PlDed + salary.LateDed + salary.ScDed + salary.Sc1Ded +
		salary.CoDed + salary.PmDed + salary.NaDed + salary.SalaryDed
	pdf.SetFont("Arial", "B", 11)
	pdf.CellFormat(80, 6, "Salary_Ded:", "", 0, "L", false, 0, "")
	pdf.CellFormat(0, 6, formatAmountWithComma(totalSalaryDed), "", 1, "R", false, 0, "")

	salaryDedData := []struct {
		label string
		value float64
	}{
		{"Q_Ded", salary.QDed},
		{"PL_Ded", salary.PlDed},
		{"Late_Ded", salary.LateDed},
		{"SC_Ded", salary.ScDed},
		{"SC1_Ded", salary.Sc1Ded},
		{"CO_Ded", salary.CoDed},
		{"PM_Ded", salary.PmDed},
		{"NA_Ded", salary.NaDed},
		{"Other", salary.SalaryDed},
	}

	pdf.SetFont("Arial", "", 8)
	salaryDedFiltered := []struct {
		label string
		value float64
	}{}
	for _, item := range salaryDedData {
		if item.value != 0 {
			salaryDedFiltered = append(salaryDedFiltered, item)
		}
	}
	for i, item := range salaryDedFiltered {
		if i%2 == 0 {
			pdf.CellFormat(colWidth-25, 5, item.label, "", 0, "L", false, 0, "")
			pdf.CellFormat(25, 5, formatAmountWithComma(item.value), "", 0, "R", false, 0, "")
		} else {
			pdf.CellFormat(colWidth-25, 5, item.label, "", 0, "L", false, 0, "")
			pdf.CellFormat(25, 5, formatAmountWithComma(item.value), "", 1, "R", false, 0, "")
		}
	}
	if len(salaryDedFiltered)%2 != 0 {
		pdf.Ln(5)
	}

	pdf.Ln(3)
	pdf.Line(15, pdf.GetY(), 195, pdf.GetY())
	pdf.Ln(4)

	// Gross Salary 部分
	pdf.SetFont("Arial", "B", 11)
	pdf.CellFormat(80, 6, "Gross Salary:", "", 0, "L", false, 0, "")
	pdf.CellFormat(0, 6, formatAmountWithComma(salary.GrossSalary), "", 1, "R", false, 0, "")

	pdf.Ln(3)
	pdf.Line(15, pdf.GetY(), 195, pdf.GetY())
	pdf.Ln(4)

	// BPJS/TAX Deduction 部分
	totalBpjsTaxDed := salary.BpjsWorkDed + salary.BpjsHealthDed + salary.TaxDed
	pdf.SetFont("Arial", "B", 11)
	pdf.CellFormat(80, 6, "BPJS/TAX_Ded:", "", 0, "L", false, 0, "")
	pdf.CellFormat(0, 6, formatAmountWithComma(totalBpjsTaxDed), "", 1, "R", false, 0, "")

	bpjsTaxData := []struct {
		label string
		value float64
	}{
		{"BPJS_Work_Ded", salary.BpjsWorkDed},
		{"BPJS_Health_Ded", salary.BpjsHealthDed + salary.BpjsHealthTambahan},
		{"Tax_Ded", salary.TaxDed},
	}

	pdf.SetFont("Arial", "", 8)
	bpjsTaxFiltered := []struct {
		label string
		value float64
	}{}
	for _, item := range bpjsTaxData {
		if item.value != 0 {
			bpjsTaxFiltered = append(bpjsTaxFiltered, item)
		}
	}
	for _, item := range bpjsTaxFiltered {
		pdf.CellFormat(50, 5, item.label, "", 0, "L", false, 0, "")
		pdf.CellFormat(0, 5, formatAmountWithComma(item.value), "", 1, "R", false, 0, "")
	}

	pdf.Ln(5)

	// Final Staff Receive 部分（带边框高亮）
	// pdf.SetLineWidth(0.0)
	// pdf.Rect(15, pdf.GetY(), 180, 20, "D")
	pdf.Ln(3)
	pdf.Line(15, pdf.GetY(), 195, pdf.GetY())
	pdf.Ln(4)

	pdf.SetFont("Arial", "B", 13)
	pdf.SetY(pdf.GetY() + 5)
	pdf.CellFormat(160, 7, "Final_Staff_Receive:", "", 0, "L", false, 0, "")

	pdf.SetFont("Arial", "B", 16)
	pdf.CellFormat(60, 8, formatAmountWithComma(salary.FinalStaffReceive), "", 1, "L", false, 0, "")

	// 添加备注
	pdf.Ln(8)
	pdf.SetFont("Arial", "", 9)
	// pdf.CellFormat(0, 5, "This slip is computer generated, no signature required.", "", 1, "C", false, 0, "")

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
