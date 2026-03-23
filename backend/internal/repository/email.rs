use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
use lettre::message::{Attachment, MultiPart, SinglePart};
use lettre::message::header::ContentType;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::error::Error;
use base64::{Engine as _, engine::general_purpose};
use std::str;
// 邮件配置结构
#[derive(Debug, Deserialize)]
struct EmailConfig {
    email_smtp_address: String,
    email_smtp_port: u16,
    email_password: String,
    email_address: String,
}

// 发送邮件请求结构
#[derive(Debug, Deserialize)]
pub struct SendEmailRequest {
    to: String,
    subject: String,
    body: String,
    attachment: Option<String>,
    employee_id: String,
    month: String,
    project_id: String,
}

// 发送邮件响应结构
#[derive(Debug, Serialize, Clone)]
pub struct SendEmailResponse {
    success: bool,
    message: String,
}

// 从数据库获取邮件配置
fn get_email_config(conn: &Connection) -> Result<EmailConfig, String> {
    // 准备SQL语句查询所有邮件相关配置
    let mut stmt = match conn.prepare("SELECT name, config FROM system_config WHERE name IN ('email_smtp_address', 'email_smtp_port', 'email_password', 'email_address')") {
        Ok(stmt) => stmt,
        Err(e) => return Err(format!("准备SQL语句失败: {}", e))
    };

    // 执行查询并收集配置项
    let mut config_map = std::collections::HashMap::new();
    let mut rows = match stmt.query([]) {
        Ok(rows) => rows,
        Err(e) => return Err(format!("执行查询失败: {}", e)),
    };

    // 遍历查询结果并填充到HashMap中
    while let Some(row) = match rows.next() {
        Ok(row) => row,
        Err(e) => return Err(format!("读取行失败: {}", e)),
    } {
        let name: String = match row.get(0) {
            Ok(name) => name,
            Err(e) => return Err(format!("获取name字段失败: {}", e)),
        };
        let config: String = match row.get(1) {
            Ok(config) => config,
            Err(e) => return Err(format!("获取config字段失败: {}", e)),
        };
        config_map.insert(name, config);
    }

    // 检查必要的配置项是否存在
    for key in [
        "email_smtp_address",
        "email_smtp_port",
        "email_password",
        "email_address",
    ] {
        if !config_map.contains_key(key) {
            return Err(format!("缺少必要的邮件配置: {}", key));
        }
    }

    // 将端口号字符串转换为u16
    let email_smtp_port: u16 = match config_map["email_smtp_port"].parse() {
        Ok(port) => port,
        Err(e) => return Err(format!("邮件服务器端口格式错误: {}", e)),
    };

    // 构建并返回EmailConfig结构
    Ok(EmailConfig {
        email_smtp_address: config_map["email_smtp_address"].clone(),
        email_smtp_port,
        email_password: config_map["email_password"].clone(),
        email_address: config_map["email_address"].clone(),
    })
}

// 正式发送邮件函数，请使用这个
#[tauri::command]
pub fn send_email(request: SendEmailRequest) -> Result<SendEmailResponse, String> {
    // 连接数据库获取配置
    let conn = match crate::database::connect_database() {
        Ok(conn) => conn,
        Err(e) => {
            return Ok(SendEmailResponse {
                success: false,
                message: format!("数据库连接失败: {}", e),
            });
        }
    };

    let config = match get_email_config(&conn) {
        Ok(config) => config,
        Err(e) => {
            return Ok(SendEmailResponse {
                success: false,
                message: format!("获取邮件配置失败: {}", e),
            });
        }
    };

    // 创建邮件
    let email = match {
        if let Some(attachment_data) = &request.attachment {
            // 处理附件
            // 移除data URI前缀
            let mut base64_data = attachment_data.trim().to_string();
            
            // 更健壮的前缀处理
            if base64_data.starts_with("data:") {
                if let Some(comma_index) = base64_data.find(',') {
                    base64_data = base64_data[comma_index + 1..].trim().to_string();
                }
            }
            
            // 打印完整的base64数据前100个字符用于详细调试
            println!("原始附件数据长度: {}", attachment_data.len());
            println!("处理后Base64数据长度: {}", base64_data.len());
            println!("处理后Base64数据前100字符: {:?}", &base64_data[0..std::cmp::min(100, base64_data.len())]);
            
            // 验证base64数据格式
            let is_valid_base64 = base64_data.chars().all(|c| {
                c.is_ascii_alphanumeric() || c == '+' || c == '/' || c == '='
            });
            println!("Base64数据格式是否有效: {}", is_valid_base64);
            
            let decoded_data = match general_purpose::STANDARD.decode(&base64_data) {
                Ok(data) => data,
                Err(e) => {
                    // 打印错误位置的字符信息
                    let error_pos = 4; // 从错误信息中获取
                    if error_pos < base64_data.len() {
                        let invalid_char = base64_data.chars().nth(error_pos).unwrap();
                        println!("错误位置字符: {:?} (ASCII: {})
", invalid_char, invalid_char as u32);
                        println!("错误位置前后字符: {:?}", &base64_data[std::cmp::max(0, error_pos as isize - 5) as usize..std::cmp::min(base64_data.len(), error_pos + 6)]);
                    }
                    return Ok(SendEmailResponse {
                        success: false,
                        message: format!("解码附件失败: {}\n请检查Base64数据格式是否正确\n错误位置: 偏移量 {}", e, error_pos),
                    });
                }
            };

            // 创建多部分邮件
            let content_type = match ContentType::parse("application/pdf") {
                Ok(ct) => ct,
                Err(e) => {
                    return Ok(SendEmailResponse {
                        success: false,
                        message: format!("解析PDF内容类型失败: {}", e),
                    });
                }
            };  
            
            let multipart = MultiPart::mixed()
                .singlepart(
                    SinglePart::builder()
                        .header(ContentType::TEXT_PLAIN)
                        .body(request.body.clone())
                )
                .singlepart(
                    Attachment::new(String::from("salary_slip.pdf"))
                        .body(decoded_data, content_type)
                );

            // 构建邮件
            Message::builder()
                .from(
                    config
                        .email_address
                        .parse()
                        .map_err(|e| format!("发件人邮箱格式错误: {}", e))?,
                )
                .to(request
                    .to
                    .parse()
                    .map_err(|e| format!("收件人邮箱格式错误: {}", e))?)
                .subject(&request.subject)
                .multipart(multipart)
        } else {
            // 无附件，创建普通邮件
            Message::builder()
                .from(
                    config
                        .email_address
                        .parse()
                        .map_err(|e| format!("发件人邮箱格式错误: {}", e))?,
                )
                .to(request
                    .to
                    .parse()
                    .map_err(|e| format!("收件人邮箱格式错误: {}", e))?)
                .subject(&request.subject)
                .body(request.body.clone())
        }
    } {
        Ok(email) => email,
        Err(e) => {
            return Ok(SendEmailResponse {
                success: false,
                message: format!("创建邮件失败: {}", e),
            });
        }
    };

    // 配置SMTP传输
    let creds = Credentials::new(config.email_address.clone(), config.email_password);
    let mailer = match SmtpTransport::relay(&config.email_smtp_address) {
        Ok(relay) => relay
            .port(config.email_smtp_port)
            .credentials(creds)
            .build(),
        Err(e) => {
            return Ok(SendEmailResponse {
                success: false,
                message: format!("创建SMTP传输失败: {}", e),
            });
        }
    };

    // 发送邮件
    let response = match mailer.send(&email) {
        Ok(_) => SendEmailResponse {
            success: true,
            message: format!(
                "邮件发送成功！\n收件人: {}\n主题: {}\nSMTP服务器: {}:{}",
                request.to, request.subject, config.email_smtp_address, config.email_smtp_port
            ),
        },
        Err(e) => {
            println!("邮件发送详细错误: {:?}", e);
            SendEmailResponse {
                success: false,
                message: format!(
                    "邮件发送失败: {}\n请检查:\n1. SMTP服务器配置是否正确\n2. 邮箱账号密码是否正确\n3. 网络连接是否正常\n4. 附件大小是否超过限制\n服务器: {}:{}\n发件人: {}",
                    e, config.email_smtp_address, config.email_smtp_port, config.email_address
                ),
            }
        },
    };

    // 如果邮件发送成功后，修改salary表中的send状态为1
    if response.success {
        let conn = match crate::database::connect_database() {
            Ok(conn) => conn,
            Err(e) => return Ok(SendEmailResponse { success: false, message: format!("数据库连接失败: {}", e) }),
        };

        let update_sql = "UPDATE salary SET salary_slip_status = 1 WHERE employee_id = ? AND month = ? AND project_id = ?";
        let params: &[&dyn rusqlite::ToSql] = &[&request.employee_id, &request.month, &request.project_id];

        match conn.execute(update_sql, params) {
            Ok(_) => {
                let mut updated_response = response.clone();
                updated_response.message = format!("{} 并成功更新数据库", updated_response.message);
                Ok(updated_response)
            }
            Err(e) => {
                let mut updated_response = response.clone();
                updated_response.success = false;
                updated_response.message = format!("{} 但更新数据库失败: {}", updated_response.message, e);
                Ok(updated_response)
            }
        }
    } else {
        Ok(response)
    }
}
